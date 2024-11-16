// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

enum StrategyAction { NONE, BUY, SELL }

enum Strategy { Accumu, BUY, SELL }

interface IStrategy {
    function name() external view returns (string);
    function shouldPerformUpkeep() external view returns (bool);
    function exec() external returns (StrategyAction action, uint256 amountIn);
}