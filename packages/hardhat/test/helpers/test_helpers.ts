import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import addresses_json from "../../conf/addresses.json";
import erc20_abi from "../../abis/erc20.json";
import pricefeed_abi from "../../abis/pricefeed.json";

const usdcSource = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640"; // rich account owning 86,402,632 USDC
export const USDC = 1_000_000; // decimals: 6

type NetworkAddresses = typeof addresses_json;
const addresses = addresses_json[network.name as keyof NetworkAddresses];

let usdcAddress = addresses["usdc"];
let wbtcAddress = addresses["wbtc"];
let btcUsdFeedAdress = addresses["btcusd_feed"];
let usdcUsdFeedAddress = addresses["usdcusd_feed"];
let uniswapV3QuoterAddress = addresses["uniswap_v3_quoter"];
let uniswapV3RouterAddress = addresses["uniswap_v3_router"];

export const deployFactoryContract = async () => {
  const [owner, user0, user1] = await ethers.getSigners();

  const usdc = new Contract(usdcAddress, erc20_abi, ethers.provider);
  const wbtc = new Contract(wbtcAddress, erc20_abi, ethers.provider);
  const stableAssetFeed = new Contract(usdcUsdFeedAddress, pricefeed_abi, ethers.provider);
  const riskAssetFeed = new Contract(btcUsdFeedAdress, pricefeed_abi, ethers.provider);

  // deploy swaps router contract
  const SwapsRouter = await ethers.getContractFactory("SwapsRouter");

  const swapsRouter = await SwapsRouter.deploy(uniswapV3QuoterAddress, uniswapV3RouterAddress, {
    maxFeePerGas: 41270515044,
  });

  // deploy factory contract
  const Factory = await ethers.getContractFactory("Factory");
  const factoryContract = await Factory.deploy(
    usdc.target,
    wbtc.target,
    stableAssetFeed.target,
    riskAssetFeed.target,
    swapsRouter.target,
    {
      maxFeePerGas: 41270515044,
    },
  );

  // fund user0 and user1 with USDC
  await transferFunds(user0, owner.address);
  await fundAccount(1000 * USDC, user0.address);

  await transferFunds(user1, owner.address);
  await fundAccount(1000 * USDC, user1.address);

  return { factoryContract, usdc, wbtc, stableAssetFeed, riskAssetFeed, owner, user0, user1 };
};

export const deployAccumulationStrategyContract = async () => {
  
    
//     const accumulationStrategy = await AccumulationOnly.deploy({
//         maxFeePerGas: 41270515044,
//     });
    
// =======
  const [owner, user0] = await ethers.getSigners();
  const AccumulationOnly = await ethers.getContractFactory("AccumulationOnly");

  const accumulationStrategy = await AccumulationOnly.deploy({
    maxFeePerGas: 41270515044,
  });

  return { accumulationStrategy, owner, user0 };
};

async function transferFunds(user: SignerWithAddress, owner: string) {
  const usdc = new Contract(usdcAddress, erc20_abi, ethers.provider);
  const balance = await usdc.balanceOf(user.address);
  if (balance > 0) {
    const tx = await usdc.connect(user).transfer(owner, balance);
    await tx.wait();
  }
}

async function fundAccount(amount: number, recipient: string) {
  const usdc = new Contract(usdcAddress, erc20_abi, ethers.provider);

  // impersonate 'account'
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [usdcSource],
  });
  const signer = await ethers.getSigner(usdcSource);

  // Set recipient's balance to 1 ETH
  await network.provider.send("hardhat_setBalance", [
    signer.address,
    "0xDE0B6B3A7640000", // 1 ETH
  ]);

  await usdc.connect(signer).transfer(recipient, amount);
}

export async function fastForwardTime(seconds: number) {
  // Increase the time
  await ethers.provider.send("evm_increaseTime", [seconds]);

  // Mine a new block
  await ethers.provider.send("evm_mine", []);
}

export const deployWalletContract = async () => {
  const [owner, user0, user1] = await ethers.getSigners();

  console.log(`deployWalletContract using ${network.name} addresses`);

  const usdc = new Contract(usdcAddress, erc20_abi, ethers.provider);
  const wbtc = new Contract(wbtcAddress, erc20_abi, ethers.provider);
  const stableAssetFeed = new Contract(usdcUsdFeedAddress, pricefeed_abi, ethers.provider);
  const riskAssetFeed = new Contract(btcUsdFeedAdress, pricefeed_abi, ethers.provider);

  // deploy swaps router contract
  const SwapsRouter = await ethers.getContractFactory("SwapsRouter");
  const swapsRouter = await SwapsRouter.deploy(uniswapV3QuoterAddress, uniswapV3RouterAddress,{
    maxFeePerGas: 41270515044,
  });

  // deploy factory contract
  const Factory = await ethers.getContractFactory("Factory");
  const factoryContract = await Factory.deploy(
    usdc.target,
    wbtc.target,
    stableAssetFeed.target,
    riskAssetFeed.target,
    swapsRouter.target,
    {
      maxFeePerGas: 41270515044,
    },
  );
   // fund user0 and user1 with USDC
  await transferFunds(user0, owner.address);
  await fundAccount(1000 * USDC, user0.address);

  await transferFunds(user1, owner.address);
  await fundAccount(1000 * USDC, user1.address);
 
  await factoryContract.connect(user0).newWalletPowerLawHigh();

  const wallets = await factoryContract.getWalletsByUser(user0.address);
  const walletAddr = wallets[0];

  const Wallet = await ethers.getContractFactory("Wallet");
  const wallet = Wallet.attach(walletAddr);

  return { factoryContract, usdc, wbtc, owner, user0, user1, wallet };
};
