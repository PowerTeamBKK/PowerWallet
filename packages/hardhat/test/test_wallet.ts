import { expect } from "chai";
import { deployWalletContract } from "./helpers/test_helpers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
 
describe.only("Wallet Contract", function () {

  it.only("Should desposit USDC", async function () {
    const { wallet, usdc, user0 } = await loadFixture(deployWalletContract);

    const amount =100n;
    console.log("usdc");

    await usdc.connect(user0).approve(wallet.target, amount);
    console.log("wallet");

    await wallet.connect(user0).deposit(amount);
    console.log("balance");

    const balance = await usdc.balanceOf(wallet.target);
    console.log("balance");
    expect(balance).to.eql(amount);
  });

  it("Should get transactions", async function () {
    console.log("--")

    const {wallet, usdc, user0 ,owner} = await loadFixture(deployWalletContract);

    await usdc.connect(user0).approve(wallet.address, 300);
    await wallet.connect(user0).deposit(100);
    await wallet.connect(user0).deposit(200);

    let transactions = await wallet.getTransactions()
    expect(transactions.length).to.equal(2);

//     let previousBalance = await usdc.balanceOf(wallet.address);

//     let yes =  await wallet.connect(user0).performUpkeep('0x')
//     console.log("yes",yes)

//       let newBalance = await usdc.balanceOf(wallet.address);
//     expect(previousBalance).to.eql(newBalance);


//   //  let yes =  await wallet.performUpkeep('0x')
 


    
  });
   
});
