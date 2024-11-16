// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import { IWallet } from "../Wallet.sol";

import "hardhat/console.sol";
import "../lib/TokenMaths.sol";

import { IStrategy, StrategyAction } from "./IStrategy.sol";


contract PowerLawLow is IStrategy, Ownable {

    event StrategyEval(StrategyAction action, uint amountIn);
    
    using TokenMaths for uint;
    
    uint constant LN_SCALE = 8666000; // Approximation of ln(5792) * 1e6 for 6 decimal places
    uint constant POWER_SCALE = 1e6; // Scaling factor for fixed-point precision
    uint constant PERCENT_SCALE = 1e4;

    uint public upkeepInterval = 24 * 60 * 60;
    uint public lastEvalTimestamp;

    // price bands above and below the power law trend
    uint public higherBandPerc = 100; // 100% above the power law trend
    uint public lowerBandPerc = 30;    // 30% below the power law trend

    // strategy parameters
    uint constant public tokensToSwapPerc = 5;
    uint constant public geneisBlockTime = 1231006505; // 2009-01-03T18:15:05Z Sat


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

    function exec() external override returns (StrategyAction action, uint amountIn) {
    
        ( /*uint80 roundID**/,  int price, /*uint startedAt*/, uint priceTimestamp, /*uint80 answeredInRound*/ ) = riskAssetFeed.latestRoundData();
        if ( price <= 0 || 
            ( block.timestamp >= priceTimestamp && (block.timestamp - priceTimestamp) > upkeepInterval ) 
        ) {
            // invalid or outdated price feed
            return (StrategyAction.NONE, 0);
        }

        // update the moving average
        int128 modelPrice = currentPowerLawPrice();
        (action, amountIn) = eval(modelPrice);

        lastEvalTimestamp = block.timestamp;

        emit StrategyEval(action, amountIn);
    }

    function eval(int128 modelPrice) public view returns (StrategyAction action, uint amountIn) {

        if (wallet.totalValue() == 0) {
            return (StrategyAction.NONE, 0);
        }

        ( , int price0, , , ) = stableAssetFeed.latestRoundData();
        ( , int price1, , , ) = riskAssetFeed.latestRoundData();

        int deltaPricePerc = int(PERCENT_SCALE) * (price0 - int(modelPrice)) / int(modelPrice);
        
        // should sell when price is 100% above the power law trend
        uint targetPricePercUpPercent = higherBandPerc * PERCENT_SCALE / 100;
        bool shouldSell = deltaPricePerc > 0 && uint(deltaPricePerc) >= targetPricePercUpPercent;

        if (shouldSell) {
            action = StrategyAction.SELL;
            amountIn = (wallet.riskAssetValue() * tokensToSwapPerc ).div(uint(price1),
                stableAsset.decimals(), riskAssetFeed.decimals(), riskAsset.decimals()
            ) / 100;
        }

        // should buy when price is 30% below the power law trend
        uint targetPricePercDownPercent = lowerBandPerc * PERCENT_SCALE / 100;
        bool shouldBuy = deltaPricePerc < 0 && deltaPricePerc <= -1 * int(targetPricePercDownPercent);
                    
        if (shouldBuy) {
            // need to BUY invest tokens spending depositTokens
            action = StrategyAction.BUY;
            amountIn = (wallet.stableAssetValue() * tokensToSwapPerc ).div(uint(price0),
                stableAsset.decimals(), stableAssetFeed.decimals(), stableAsset.decimals()
            ) / 100;
        }


        // Handle rebalancing situations when risk asset token balance is too low
        // uint depositTokensToSell = rebalanceDepositTokensAmount();
        // if (depositTokensToSell > 0) {
        //     amountIn = (action == StrategyAction.BUY) && (amountIn > depositTokensToSell) ? amountIn : depositTokensToSell;
        //     return (StrategyAction.BUY, amountIn);
        // }

        return (action, amountIn);
    }

    function setDcaInterval(uint interval) external onlyOwner {
        upkeepInterval = interval;
    }

    function shouldPerformUpkeep() external view returns (bool) {

    }


    // Calculate the fair value for the bitcoin price using the bitcoin powerlaw price model.
    // This uses a Taylor polynomial expansion to approximate a fractional power value.
    // P(x) = 10^-17 * x^5.83
    function currentPowerLawPrice() public view returns (int128) {

        uint256 daysSinceGeneis = (block.timestamp - geneisBlockTime) / 86400 + 1;

         // x^5.83 is calculated as x^5 * x^0.83
        
        uint256 integerPart = daysSinceGeneis ** 5; // x^5

        // Calculate y = 0.83 * ln(x) in scaled integers
        uint256 y = (83 * LN_SCALE) / 100;

        // To calculate x^0.83 we approximate it using Taylor series up to 20 terms, scaled by 1e6
        uint256 termsCount = 20;
        uint256 fractionalPart = POWER_SCALE; // Start with the first term in the Taylor series: 1
        uint256 term = y; // Initialize the term with y for the second term

        fractionalPart += term; // Add y (second term)

        // Now add terms y^n / n! up to the 20th term
        term = (term * y) / POWER_SCALE / 2; // y^2 / 2!
        fractionalPart += term;

        for (uint256 i = 3; i <= termsCount; i++) {
            term = (term * y) / POWER_SCALE / i; // y^n / n!
            fractionalPart += term;
        }
       
        // x^5 * x^0.83, scale adjusted back by 1e6
        uint256 powerValue = (integerPart * fractionalPart) / POWER_SCALE;

        uint256 modelPrice = powerValue / 1e17; // Divide by 1e17 to get the final result

        return int128(uint128(modelPrice));
    }

    // Function to approximate power law price model:
    // P(x) = 10^-17 * x^5.83
    function approxPowerLawTrend(uint256 x) public pure returns (uint256) {
        // x^5.83 is calculated as x^5 * x^0.83
        
        uint256 integerPart = x ** 5; // x^5

        // Calculate y = 0.83 * ln(x) in scaled integers
        uint256 y = (83 * LN_SCALE) / 100;

        // To calculate x^0.83 we approximate it using Taylor series up to 20 terms, scaled by 1e6
        uint256 termsCount = 20;
        uint256 result = POWER_SCALE; // Start with the first term in the Taylor series: 1
        uint256 term = y; // Initialize the term with y for the second term

        result += term; // Add y (second term)

        // Now add terms y^n / n! up to the 20th term
        term = (term * y) / POWER_SCALE / 2; // y^2 / 2!
        result += term;

        for (uint256 i = 3; i <= termsCount; i++) {
            term = (term * y) / POWER_SCALE / i; // y^n / n!
            result += term;
        }
       
        // x^5 * x^0.83, scale adjusted back by 1e6
        uint256 power = (integerPart * result) / POWER_SCALE;

        return power / 1e17; // Divide by 1e17 to get the final result
    }
}