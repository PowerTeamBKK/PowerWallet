// const { hre } = import "hardhat";
import { ethers, network } from "hardhat";
import { Contract } from "ethers";
import addresses_json from "../conf/addresses.json";

type NetworkAddresses = typeof addresses_json;

// Factory contract deployed to: 0x17bCEf39A8212494240c2dff94886fCeb5723B0E
// https://base-sepolia.blockscout.com/address/0xE0087A5EcAaF884894946191eb9d5FD0841D95Ec#code

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deployment Factory - using account:", deployer.address, "on", network.name);
  let addresses = addresses_json[network.name as keyof NetworkAddresses];
  console.log("Addresses:", addresses);

  const Factory = await ethers.getContractFactory("Factory");
  const factory = await Factory.deploy(
    addresses["usdc"],
    addresses["wbtc"],
    addresses["usdcusd_feed"],
    addresses["btcusd_feed"],
    addresses["swaps_router"],
  )
  
  // await factory.deployed();
  // await factory.target;

  console.log("Factory contract deployed to:", factory.target);
  console.log("Constructor arguments:", addresses["usdc"], addresses["wbtc"], addresses["usdcusd_feed"], addresses["btcusd_feed"]);
  
  // let owner = await newFactory.owner();
  let stableAsset = await factory.stableAsset();
  let riskAsset = await factory.riskAsset();
  let stableAssetFeed = await factory.stableAssetFeed();
  let riskAssetFeed = await factory.riskAssetFeed();
  let swapsRouter = await factory.swapRouter();

  // console.log("Factory owner:", owner);
  console.log("stableAsset:", stableAsset);
  console.log("riskAsset:", riskAsset);
  console.log("stableAssetFeed:", stableAssetFeed);
  console.log("riskAssetFeed:", riskAssetFeed);
  
  console.log(">>> TO VERIFY THE CONTRACT RUN:");
  console.log("npx hardhat verify --network ", network.name, factory.target, stableAsset, riskAsset, stableAssetFeed, riskAssetFeed, swapsRouter);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });