// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

  
 import "./ISwapsRouter.sol";
import "./ISwapsV3.sol";


contract SwapsRouter is ISwapsRouter {

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

     
    }

    function getAmountOutMin(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint24 feeV3
    ) external returns (uint amountOut) {
 
    }


    // Internal function to add a router
    function addRouter(address routerAddress,  RouterVersion routerVersion, RouterType routerType) internal {
        
    }
}