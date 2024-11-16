// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

import { IStrategy } from "./strategies/IStrategy.sol";
import { ISwapsRouter } from "./swaps/ISwapsRouter.sol";
import { TokenMaths } from "./utils/TokenMaths.sol";

interface IWallet {}

import { StrategyAction } from "./strategies/PowerLaw.sol";

enum TransactionType {
	Deposit,
	Withdrawal,
	Swap
}

struct Transaction {
	TransactionType transactionType;
	uint256 amount;
	uint256 timestamp;
}

contract Wallet is Ownable, AutomationCompatibleInterface, IWallet {
	using TokenMaths for uint;

	IERC20Metadata public stableAsset;
	IERC20Metadata public riskAsset;

	// Chainlink price feeds
	AggregatorV3Interface public immutable riskAssetFeed;
	AggregatorV3Interface public immutable stableAssetFeed;

	IStrategy public strategy;
	ISwapsRouter public swapRouter;

	Transaction[] public transactions;

	uint256 public slippageThereshold = 100;
	uint24 public constant feeV3 = 3000; // 0.3% fee

	event Swapped(string side, uint256 sold, uint256 bought, uint256 slippage);
	event Deposited(address indexed user, uint256 amount);
	event Withdrawn(address indexed user, uint256 amount);
	event SwapError(string reason);

	uint256 public totalDeposited;
	uint256 public totalWithdrawn;

	constructor(
		address stableTokenAddress,
		address riskTokenAddress,
		address stableAssetFeedAddress,
		address riskAssetFeedAddress,
		address swapRouterAddress
	) Ownable() {
		stableAsset = IERC20Metadata(stableTokenAddress);
		riskAsset = IERC20Metadata(riskTokenAddress);
		stableAssetFeed = AggregatorV3Interface(stableAssetFeedAddress);
		riskAssetFeed = AggregatorV3Interface(riskAssetFeedAddress);

		swapRouter = ISwapsRouter(swapRouterAddress);
	}

	function deposit(uint256 amount) external onlyOwner {
		require(
			stableAsset.transferFrom(msg.sender, address(this), amount),
			"Transfer failed"
		);
		transactions.push(
			Transaction(TransactionType.Withdrawal, amount, block.timestamp)
		);
		totalDeposited += amount;
	}

	function withdraw(uint256 amount) external onlyOwner {
		require(
			stableAsset.balanceOf(address(this)) >= amount,
			"Insufficient balance"
		);
		require(stableAsset.transfer(msg.sender, amount), "Transfer failed");
		transactions.push(
			Transaction(TransactionType.Deposit, amount, block.timestamp)
		);
		totalWithdrawn += amount;
	}

	function pause() external onlyOwner {}

	function unpause() external onlyOwner {}

	//// View Functions ////
	function isPaused() external view returns (bool) {}

	function getTransactions() public view returns (Transaction[] memory) {
		return transactions;
	}

	function getTransactionCount() public view returns (uint) {
		return transactions.length;
	}

	function totalValue() public view returns (uint256) {
		return stableAssetValue() + riskAssetValue();
	}

	function stableAssetValue() public view returns (uint256) {
		(
			,
			/*uint80 roundID**/ int256 price /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
			,
			,

		) = stableAssetFeed.latestRoundData();

		if (price <= 0) return 0;

		return
			stableAsset.balanceOf(address(this)).mul(
				uint256(price),
				stableAsset.decimals(),
				stableAssetFeed.decimals(),
				stableAsset.decimals()
			);
	}

	function riskAssetValue() public view returns (uint256) {
		(
			,
			/*uint80 roundID**/ int256 price /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
			,
			,

		) = riskAssetFeed.latestRoundData();
		if (price <= 0) return 0;

		return
			riskAsset.balanceOf(address(this)).mul(
				uint256(price),
				riskAsset.decimals(),
				riskAssetFeed.decimals(),
				stableAsset.decimals()
			);
	}

	// Set the strategy contract
	function setStrategy(address strategyAddress) public onlyOwner {
		strategy = IStrategy(strategyAddress);
	}

	/// Chainlink Automation ///

	function checkUpkeep(
		bytes calldata /* checkData */
	)
		external
		view
		override
		returns (bool upkeepNeeded, bytes memory performData)
	{
		return (strategy.shouldPerformUpkeep(), "");
	}

	function performUpkeep(bytes calldata /* performData */) external override {
		if (strategy.shouldPerformUpkeep()) {
			strategyExec();
		}
	}

	function strategyExec() internal {
		(StrategyAction action, uint256 amountIn) = strategy.exec();

		if (action != StrategyAction.NONE && amountIn > 0) {
			address tokenIn;
			address tokenOut;
			AggregatorV3Interface feed;

			if (action == StrategyAction.BUY) {
				tokenIn = address(stableAsset);
				tokenOut = address(riskAsset);
				feed = stableAssetFeed;
			} else if (action == StrategyAction.SELL) {
				tokenIn = address(riskAsset);
				tokenOut = address(stableAsset);
				feed = riskAssetFeed;
			}

			(
				,
				/*uint80 roundID**/ int256 price /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
				,
				,

			) = feed.latestRoundData();
			require(price > 0, "Risk asset price must be positive");

			// TODO perform swap
			uint256 amountInMinimum = (amountIn * 90) / 100;
			swap(tokenIn, tokenOut, amountIn, amountInMinimum, address(this));

			// function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, address recipent) internal returns (uint256 amountOut) {
		}
	}

	function swapAndCheckSlippage(
		address tokenIn,
		address tokenOut,
		StrategyAction side,
		uint amountIn
	)
		internal
		returns (bool success, uint sold, uint bought, uint slippagePerc)
	{
		// ensure max slippage is not exceeded
		(uint amountOutMin, uint amountOutExpected) = amountOutForSwap(
			tokenIn,
			tokenOut,
			amountIn
		);

		// ensure to receive some tokens back
		if (amountOutMin > 0 && amountOutExpected > 0) {
			uint stableAssetBalanceBefore = stableAsset.balanceOf(
				address(this)
			);
			uint riskAssetBalanceBefore = riskAsset.balanceOf(address(this));

			swap(tokenIn, tokenOut, amountIn, amountOutMin, address(this));

			uint stableAssetBalanceAfter = stableAsset.balanceOf(address(this));
			uint riskAssetBalanceAfter = riskAsset.balanceOf(address(this));

			if (side == StrategyAction.BUY) {
				sold = stableAssetBalanceBefore - stableAssetBalanceAfter;
				bought = riskAssetBalanceAfter - riskAssetBalanceBefore;
			} else if (side == StrategyAction.SELL) {
				sold = riskAssetBalanceBefore - riskAssetBalanceAfter;
				bought = stableAssetBalanceAfter - stableAssetBalanceBefore;
			}

			slippagePerc = bought < amountOutExpected
				? 10000 - ((10000 * bought) / amountOutExpected)
				: 0; // e.g 10000 - 9500 = 500  (5% slippage) - min slipage: 1 = 0.01%
			success =
				sold > 0 &&
				bought > 0 &&
				slippagePerc <= slippageThereshold;

			if (success) {
				string memory swapSide = (side == StrategyAction.BUY)
					? "BUY"
					: (side == StrategyAction.SELL)
					? "SELL"
					: "NONE";
				emit Swapped(swapSide, sold, bought, slippagePerc);
			}
		}
	}

	function amountOutForSwap(
		address tokenIn,
		address tokenOut,
		uint amountIn
	) internal view returns (uint amountOutMin, uint amountOutExpected) {
		/* uint startedAt, uint price, uint timeStamp, uint80 answeredInRound */
		(, int256 price, , , ) = riskAssetFeed.latestRoundData();

		// if received a negative price the return amountOutMin = 0 to avoid swap
		if (price < 0) return (0, 0);

		// swap USD => ETH
		if (tokenIn == address(stableAsset) && tokenOut == address(riskAsset)) {
			amountOutExpected = amountIn.div(
				uint256(price),
				stableAsset.decimals(),
				riskAssetFeed.decimals(),
				riskAsset.decimals()
			);
		}

		// swap ETH => USD
		if (tokenIn == address(riskAsset) && tokenOut == address(stableAsset)) {
			amountOutExpected = amountIn.mul(
				uint256(price),
				riskAsset.decimals(),
				riskAssetFeed.decimals(),
				stableAsset.decimals()
			);
		}

		amountOutMin =
			((10000 - slippageThereshold) * amountOutExpected) /
			10000;
	}

	function swap(
		address tokenIn,
		address tokenOut,
		uint256 amountIn,
		uint256 amountOutMin,
		address recipent
	) internal returns (uint256 amountOut) {
		require(
			IERC20Metadata(tokenIn).balanceOf(address(this)) >= amountIn,
			"Insufficient balance"
		);

		if (amountIn > 0 && amountOutMin > 0) {
			// allow the router to spend the tokens
			IERC20Metadata(tokenIn).approve(address(swapRouter), amountIn);
			try
				swapRouter.swap(
					tokenIn,
					tokenOut,
					amountIn,
					amountOutMin,
					recipent,
					feeV3
				)
			returns (uint256 received) {
				amountOut = received;
			} catch Error(string memory reason) {
				// log catch failing revert() and require()
				// e.g. 'Too little received' when slippage is exceeded
				emit SwapError(reason);
			} catch (bytes memory reason) {
				// catch failing assert()
				emit SwapError(string(reason));
			}
		}
	}
}
