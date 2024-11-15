// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

enum StrategyAction { NONE, BUY, SELL }

enum Strategy { Accumu, BUY, SELL }

interface IStrategy {
    function shouldPerformUpkeep() external view returns (bool);
    function exec() external returns (StrategyAction action, uint256 amountIn);

    function setDcaInterval(uint256 interval) external;
}