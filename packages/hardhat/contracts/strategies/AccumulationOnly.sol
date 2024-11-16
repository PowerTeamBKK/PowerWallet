// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import { IWallet } from "../Wallet.sol";
import { IStrategy, StrategyAction } from "./IStrategy.sol";


contract AccumulationOnly is IStrategy, Ownable 
{
    event StrategyEval(StrategyAction action, uint amountIn);

    uint public upkeepInterval = 24 * 60 * 60;
    uint public dcaAmount;

    uint public lastEvalTimestamp;
  
    constructor() {
        lastEvalTimestamp = block.timestamp;
    }
  
    //// IStrategy Interface //// 
    
    function name() external view returns (string) {
        return "DCA";
    }

    function exec() external returns (StrategyAction action, uint256 amountIn) {
        if (block.timestamp < lastEvalTimestamp + upkeepInterval) {
            return (StrategyAction.NONE, 0);
        }

        lastEvalTimestamp = block.timestamp;
        action = StrategyAction.BUY;
        amountIn = dcaAmount;
    }

    function setDcaAmount(uint amount) external onlyOwner {
        dcaAmount = amount;
    }

    function setDcaInterval(uint interval) external onlyOwner {
        upkeepInterval = interval;
    }

    function shouldPerformUpkeep() external view returns (bool) {
        return block.timestamp >= lastEvalTimestamp + upkeepInterval;
    }
}