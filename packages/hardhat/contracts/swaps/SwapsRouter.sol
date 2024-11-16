// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../utils/TokenMaths.sol";
import "./ISwapsRouter.sol";
import "./ISwapsV3.sol";


contract SwapsRouter is ISwapsRouter, ReentrancyGuard, Ownable {

    enum RouterVersion { V3 }
    enum RouterType { Uniswap }

    struct RouterInfo {
        address routerAddress;
        RouterVersion routerVersion;
        RouterType routerType;
    }

    IQuoter_Uniswap quoterUniswap;

    uint public activeRouterIdx = 0;
    RouterInfo[] public routers;


    constructor(
        address quoterUniswapAddress,
        address routerUniswapAddress
    ) {
        quoterUniswap = IQuoter_Uniswap(quoterUniswapAddress);
        addRouter(routerUniswapAddress, RouterVersion.V3, RouterType.Uniswap);
    }

    function getRouters() public view returns (RouterInfo[] memory) {
        return routers;
    }

    function activeRouter() public view returns (RouterInfo memory) {
        require (activeRouterIdx < routers.length, "Invalid router index");

        return routers[activeRouterIdx];
    }


    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        address recipient,
        uint24 feeV3
    ) external returns (uint amountOut) {

        RouterInfo memory routerInfo = activeRouter();

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn).approve(address(routerInfo.routerAddress), amountIn);

        if (routerInfo.routerVersion == RouterVersion.V3 && routerInfo.routerType == RouterType.Uniswap ) {
            ISwapRouter_Uniswap.ExactInputSingleParams memory params = ISwapRouter_Uniswap
                .ExactInputSingleParams({
                    tokenIn: tokenIn,
                    tokenOut: tokenOut,
                    fee: feeV3,
                    recipient: recipient,
                    deadline: block.timestamp,
                    amountIn: amountIn,
                    amountOutMinimum: amountOutMin,
                    sqrtPriceLimitX96: 0
                });

            ISwapRouter_Uniswap router = ISwapRouter_Uniswap(routerInfo.routerAddress);

            amountOut = router.exactInputSingle(params);
        }
    }

    function getAmountOutMin(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint24 feeV3
    ) external returns (uint amountOut) {

        RouterInfo memory routerInfo = activeRouter();

        if (routerInfo.routerVersion == RouterVersion.V3 && routerInfo.routerType == RouterType.Uniswap ) {
            amountOut = quoterUniswap.quoteExactInputSingle(tokenIn, tokenOut, feeV3, amountIn, 0);
        }
    }


    function addRouter(address routerAddress,  RouterVersion routerVersion, RouterType routerType) internal {
        RouterInfo memory info = RouterInfo({
            routerAddress: routerAddress,
            routerVersion: routerVersion,
            routerType: routerType
        });
        routers.push(info);
    }
}