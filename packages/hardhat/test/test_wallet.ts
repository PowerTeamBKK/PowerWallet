import { expect } from "chai";
import { deployWalletContract } from "./helpers/test_helpers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import {parseEther} from 'ethers'

describe.only("Wallet Contract", function () {
  it("Should desposit USDC", async function () {
    const { wallet, usdc, user0 } = await loadFixture(deployWalletContract);

    const amount = 100n;

    await usdc.connect(user0).approve(wallet.target, amount);

    await wallet.connect(user0).deposit(amount);

    const balance = await usdc.balanceOf(wallet.target);
    expect(balance).to.eql(amount);
  });

  it("Should get transactions", async function () {
    const { wallet, usdc, user0, owner } = await loadFixture(deployWalletContract);

    await usdc.connect(user0).approve(wallet.target, 300);
    await wallet.connect(user0).deposit(100);
    await wallet.connect(user0).deposit(200);

    const transactions = await wallet.getTransactions();

    expect(transactions.length).to.equal(2);
  });

  it("Should allow the owner to withdraw stable tokens", async function () {
    const { wallet, usdc, user0, owner } = await loadFixture(deployWalletContract);

    const depositAmount =  100;
    const withdrawAmount = 50;

    // Deposit and withdraw
    await usdc.connect(user0).approve(wallet.target, depositAmount);
    await wallet.connect(user0).deposit(depositAmount);
    console.log("deposit done")
    await wallet.connect(user0).withdraw(withdrawAmount);
    await wallet.connect(user0).withdraw(withdrawAmount);


    expect(await wallet.totalWithdrawn()).to.equal(withdrawAmount * 2);
  });

   
});
