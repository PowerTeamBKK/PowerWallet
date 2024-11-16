import { expect } from "chai";
import { deployPowerLawLowContract, fastForwardTime, USDC } from "./helpers/test_helpers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Power Law", function () {

  it("should get the current power law price", async function () {
    const { powerLawLowStrategy, wbtc, riskAssetFeed } = await loadFixture(deployPowerLawLowContract);
  
    const [, feedPrice, , , ] = await riskAssetFeed.latestRoundData()
    console.log("feedPrice: ",feedPrice)
    
    let decimals = await wbtc.decimals()
    console.log("decimals: ", Number(decimals), typeof decimals)
    let priceScale = 10 ** Number(decimals)
    
    // call currentPowerLawPrice
    var modelPrice = await powerLawLowStrategy.currentPowerLawPrice()
    expect(Number(modelPrice) / priceScale).to.be.approximately(Number(feedPrice) / priceScale,  2000);

  });
   
});
