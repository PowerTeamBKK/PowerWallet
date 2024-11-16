// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import { Wallet } from "./Wallet.sol";

import { AccumulationOnly } from "./strategies/AccumulationOnly.sol";
import { PowerLawLow } from "./strategies/PowerLawLow.sol";
import { PowerLawHigh } from "./strategies/PowerLawHigh.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Factory is Ownable {
	// Mapping from user address to deployed Wallet addresses
	mapping(address => address[]) public userWallets;
	mapping(address => bool) public users;
	address[] public userAddresses;

	address public stableAsset;
	address public riskAsset;
	address public stableAssetFeed;
	address public riskAssetFeed;
	address public swapRouter;

	event FactoryCreated(
		address indexed creator,
		address stableAsset,
		address riskAsset,
		address stableAssetFeed,
		address riskAssetFeed,
		address swapRouter
	);

	// Event for new wallet creation
	event WalletCreated(address indexed creator, address walletAddress);

	constructor(
		address stableTokenAddress,
		address riskTokenAddress,
		address stableAssetFeedAddress,
		address riskAssetFeedAddress,
		address swapRouterAddress
	) {
		stableAsset = stableTokenAddress;
		riskAsset = riskTokenAddress;
		stableAssetFeed = stableAssetFeedAddress;
		riskAssetFeed = riskAssetFeedAddress;
		swapRouter = swapRouterAddress;

		emit FactoryCreated(
			msg.sender,
			stableAsset,
			riskAsset,
			stableAssetFeed,
			riskAssetFeed,
			swapRouter
		);
	}

	// Deploy the pure DCA strategy with the specified DCA amount and interval
	function newWalletDCA(uint256 amount, uint256 interval) public {
		Wallet newWallet = new Wallet(
			stableAsset,
			riskAsset,
			stableAssetFeed,
			riskAssetFeed,
			swapRouter
		);

		AccumulationOnly strategy = new AccumulationOnly();
		strategy.setDcaAmount(amount);
		strategy.setDcaInterval(interval);

		_initializeWallet(address(newWallet), address(strategy));

		emit WalletCreated(msg.sender, address(newWallet));
	}
	
	function newWalletPowerLawLow() public {
		Wallet newWallet = new Wallet(
			stableAsset,
			riskAsset,
			stableAssetFeed,
			riskAssetFeed,
			swapRouter
		);

		PowerLawLow strategy = new PowerLawLow(
			address(newWallet),
			stableAsset,
			riskAsset,
			stableAssetFeed,
			riskAssetFeed
		);

		_initializeWallet(address(newWallet), address(strategy));

		emit WalletCreated(msg.sender, address(newWallet));
	}


	function newWalletPowerLawHigh() public {
		Wallet newWallet = new Wallet(
			stableAsset,
			riskAsset,
			stableAssetFeed,
			riskAssetFeed,
			swapRouter
		);

		PowerLawHigh strategy = new PowerLawHigh(
			address(newWallet),
			stableAsset,
			riskAsset,
			stableAssetFeed,
			riskAssetFeed
		);

		_initializeWallet(address(newWallet), address(strategy));

		emit WalletCreated(msg.sender, address(newWallet));
	}


	function _initializeWallet(address newWallet, address strategy) internal {
		Wallet(newWallet).setStrategy(strategy);
		Wallet(newWallet).transferOwnership(msg.sender);
		Ownable(strategy).transferOwnership(msg.sender);

		if (!users[msg.sender]) {
			users[msg.sender] = true;
			userAddresses.push(msg.sender);
		}

		userWallets[msg.sender].push(newWallet);
	}

	// Function to get all wallet addresses for a given user
	function getWalletsByUser(
		address user
	) external view returns (address[] memory) {
		return userWallets[user];
	}

	// Function to get all user addresses
	function getUserAddresses() external view returns (address[] memory) {
		return userAddresses;
	}

	function setSwapsRouter(address _swapRouter) external onlyOwner {
		swapRouter = _swapRouter;
	}
}
