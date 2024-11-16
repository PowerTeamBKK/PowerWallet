// const { hre } = import "hardhat";
import { ethers, network } from "hardhat";
// import { Contract } from "ethers";
import addresses_json from "../conf/addresses.json";

type NetworkAddresses = typeof addresses_json;

// Factory contract deployed to: 0x24556c87B753Bd30276D6E85FD4D03883C59994D
// https://base-sepolia.blockscout.com/address/0x24556c87B753Bd30276D6E85FD4D03883C59994D#code

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deployment Factory - using account:", deployer.address, "on", network.name);
  const addresses = addresses_json[network.name as keyof NetworkAddresses];
  console.log("Addresses:", addresses);

  const Factory = await ethers.getContractFactory("Factory");
  const factory = await Factory.deploy(
    addresses["usdc"],
    addresses["wbtc"],
    addresses["usdcusd_feed"],
    addresses["btcusd_feed"],
    addresses["swaps_router"],
    {
      gasPrice: 100000000000
    },
  );

  // await factory.deployed();
  // await factory.target;

  console.log("Factory contract deployed to:", factory.target);
  console.log(
    "Constructor arguments:",
    addresses["usdc"],
    addresses["wbtc"],
    addresses["usdcusd_feed"],
    addresses["btcusd_feed"],
  );

  // let owner = await newFactory.owner();
  const stableAsset = await factory.stableAsset();
  const riskAsset = await factory.riskAsset();
  const stableAssetFeed = await factory.stableAssetFeed();
  const riskAssetFeed = await factory.riskAssetFeed();
  const swapsRouter = await factory.swapRouter();

  // console.log("Factory owner:", owner);
  console.log("stableAsset:", stableAsset);
  console.log("riskAsset:", riskAsset);
  console.log("stableAssetFeed:", stableAssetFeed);
  console.log("riskAssetFeed:", riskAssetFeed);

  console.log(">>> TO VERIFY THE CONTRACT RUN:");
  console.log(
    "npx hardhat verify --network ",
    network.name,
    factory.target,
    stableAsset,
    riskAsset,
    stableAssetFeed,
    riskAssetFeed,
    swapsRouter,
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
