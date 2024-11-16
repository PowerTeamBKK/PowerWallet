import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

// Localhost test addresses - replace with actual addresses for other networks
const LOCAL_ADDRESSES = {
  usdc: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  wbtc: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  usdcusd_feed: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  btcusd_feed: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  swaps_router: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
};

const deployFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { network } = hre;

  console.log("📡 Deploying Factory Contract...");
  console.log("Deployment Factory - using account:", deployer, "on", network.name);

  // Use local addresses for localhost, could extend with other network configs
  const addresses = network.name === "localhost" ? LOCAL_ADDRESSES : LOCAL_ADDRESSES; // Replace with network-specific addresses

  const factory = await deploy("Factory", {
    from: deployer,
    args: [
      addresses.usdc,
      addresses.wbtc,
      addresses.usdcusd_feed,
      addresses.btcusd_feed,
      addresses.swaps_router,
    ],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const deployedFactory = await hre.ethers.getContract<Contract>("Factory", deployer);

  // Verify contract state
  console.log("📝 Contract State:");
  console.log("stableAsset:", await deployedFactory.stableAsset());
  console.log("riskAsset:", await deployedFactory.riskAsset());
  console.log("stableAssetFeed:", await deployedFactory.stableAssetFeed());
  console.log("riskAssetFeed:", await deployedFactory.riskAssetFeed());
  console.log("swapRouter:", await deployedFactory.swapRouter());

  // Verification command
  if (network.name !== "localhost") {
    console.log("🔍 Verification command:");
    console.log(
      `npx hardhat verify --network ${network.name} ${factory.address} ${addresses.usdc} ${addresses.wbtc} ${addresses.usdcusd_feed} ${addresses.btcusd_feed} ${addresses.swaps_router}`
    );
  }
};

export default deployFactory;

deployFactory.tags = ["Factory"];