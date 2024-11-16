// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title TokenMaths
 * @dev Library for simple arithmetics operations between tokens of different decimals, up to 18 decimals.
 */
library TokenMaths {

    function div(uint amount1, uint amount2, uint8 decimals1, uint8 decimals2, uint8 decimalsOut) internal pure returns (uint) {
        return (10 ** decimalsOut * toWei(amount1, decimals1) / toWei(amount2, decimals2));
    }

    function mul(uint amount1, uint amount2, uint8 decimals1, uint8 decimals2, uint8 decimalsOut) internal pure returns (uint) {
       return 10 ** decimalsOut * amount1 * amount2 / 10 ** (decimals1 + decimals2);
    }

    function toWei(uint amount, uint8 decimals) internal pure returns (uint) {
        if (decimals >= 18) return amount;

        return amount * 10 ** (18 - decimals);
    }

    function fromWei(uint amount, uint8 decimals) internal pure returns (uint) {
        if (decimals >= 18) return amount;

        return amount / 10 ** (18 - decimals);
    }

    function adjustAmountDecimals(uint tokenInDecimals, uint tokenOutDecimals, uint amountIn) internal pure returns (uint) {
        uint amountInAdjusted = (tokenOutDecimals >= tokenInDecimals) ?
                amountIn * (10 ** (tokenOutDecimals - tokenInDecimals)) :
                amountIn / (10 ** (tokenInDecimals - tokenOutDecimals));

        return amountInAdjusted;
    }
}