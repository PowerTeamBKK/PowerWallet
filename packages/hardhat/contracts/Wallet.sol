// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

import { IStrategy } from "./strategies/IStrategy.sol";
import { ISwapsRouter } from "./swaps/ISwapsRouter.sol";

interface IWallet {

}

contract Wallet is  Ownable, AutomationCompatibleInterface, IWallet {

    IERC20Metadata public stableAsset;
    IERC20Metadata public riskAsset;

    // Chainlink price feeds
    AggregatorV3Interface public immutable riskAssetFeed;
    AggregatorV3Interface public immutable stableAssetFeed;

    IStrategy public strategy;
    ISwapsRouter public swapRouter;


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

    }

    function withdraw(uint256 amount) external onlyOwner {

    }

    function pause() external onlyOwner {

    }

    function unpause() external onlyOwner {

    }

    //// View Functions ////
    function isPaused() external view returns (bool) {

    }

    // Set the strategy contract
    function setStrategy(address strategyAddress) public onlyOwner {
        strategy = IStrategy(strategyAddress);
    }


    /// Chainlink Automation ///

    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory performData) {
        return (false, "");
    }

    function performUpkeep(bytes calldata /* performData */) external override {
    
    }
}