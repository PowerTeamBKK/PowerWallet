import { assert, expect } from "chai";
import { ethers } from "hardhat";
import { deployFactoryContract } from "./helpers/test_helpers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { Factory, Wallet } from "../typechain-types";

describe("Factory Contract", function () {

  it.only("Should deploy Factory", async function () {
    const { factoryContract, usdc, owner, user0, user1 } = await loadFixture(deployFactoryContract);
    // expect(factoryContract.address).to.not.equal(0);
  });

  it("Should deploy Wallet", async function () {
    const { factoryContract, usdc, wbtc, stableAssetFeed, riskAssetFeed, user0, user1 } = await loadFixture(deployFactoryContract);

    let factory = factoryContract as Factory;
    await factory.connect(user0).newPowerWallet();

    let wallets = await factory.getWalletsByUser(user0.address);
    expect(wallets.length).to.equal(1);
  });
   
});
