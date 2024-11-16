// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import { IWallet } from "../Wallet.sol";
import { PowerLaw } from "../strategies/PowerLaw.sol";

import "hardhat/console.sol";

import { IStrategy, StrategyAction } from "./IStrategy.sol";


contract PowerLaw is IStrategy, Ownable {

    uint public upkeepInterval = 24 * 60 * 60;
    uint public lastEvalTimestamp;

    IWallet public wallet;
    AggregatorV3Interface public stableAssetFeed;
    AggregatorV3Interface public riskAssetFeed;
    IERC20Metadata public stableAsset;
    IERC20Metadata public riskAsset;

    constructor(
        address walletAddress,
        address stableAssetAddress,
        address riskAssetAddress,
        address stableAssetFeedAddress,
        address riskAssetFeedAddress
    ) {
        wallet = IWallet(walletAddress);
        stableAssetFeed = AggregatorV3Interface(stableAssetFeedAddress);
        riskAssetFeed = AggregatorV3Interface(riskAssetFeedAddress);

        stableAsset = IERC20Metadata(stableAssetAddress);
        riskAsset = IERC20Metadata(riskAssetAddress);

        lastEvalTimestamp = block.timestamp;
    }

    // IStrategy interface //

    function exec() external override returns (StrategyAction action, uint amount) {
        lastEvalTimestamp = block.timestamp;
    }

    function setDcaInterval(uint interval) external onlyOwner {
        upkeepInterval = interval;
    }

    function shouldPerformUpkeep() external view returns (bool) {

    }
}