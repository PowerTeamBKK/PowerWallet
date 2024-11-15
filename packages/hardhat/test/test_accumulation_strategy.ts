import { expect } from "chai";
import { deployAccumulationStrategyContract, fastForwardTime, USDC } from "./helpers/test_helpers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber } from "ethers";

describe("Accumulation Strategy", function () {

  it("Should BUY DCA amount after dca interval elapses", async function () {
    const { accumulationStrategy, owner } = await loadFixture(deployAccumulationStrategyContract);

    // set DCA amount and DCA interval
    let dcaAmount = BigNumber.from(1000)
    await accumulationStrategy.setDcaAmount(dcaAmount)
    await accumulationStrategy.setDcaInterval(7 * 86400) // 7 days
    
    // call exec
    var {action, amountIn} = await accumulationStrategy.callStatic.exec()

    // verify that should wait for DCA interval to elapse
    expect(action).to.equals(0);    // NONE
    expect(amountIn).to.equals(0);  // 0 USDC

    // wait a week
    await fastForwardTime(7 * 86400)

    // call exec again
    var {action, amountIn} = await accumulationStrategy.callStatic.exec()

    // verify that should BUY DCA amount
    expect(action).to.equals(1);            // BUY
    expect(amountIn).to.equals(dcaAmount); // 100 USDC

  });
   
});
