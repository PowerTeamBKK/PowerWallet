// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import { Wallet } from "./Wallet.sol";
import { PowerLaw } from "./strategies/PowerLaw.sol";

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

	// Function to deploy a new Wallet contract
	function newPowerWallet() public {
		Wallet newWallet = new Wallet(
			stableAsset,
			riskAsset,
			stableAssetFeed,
			riskAssetFeed,
			swapRouter
		);

		PowerLaw strategy = new PowerLaw(
			address(newWallet),
			stableAsset,
			riskAsset,
			stableAssetFeed,
			riskAssetFeed
		);

        newWallet.setStrategy(address(strategy));
        
        newWallet.transferOwnership(msg.sender);
        strategy.transferOwnership(msg.sender);

        if (!users[msg.sender]) {
           users[msg.sender] = true;
           userAddresses.push(msg.sender);
        }

        userWallets[msg.sender].push(address(newWallet));

        emit WalletCreated(msg.sender, address(newWallet));
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
