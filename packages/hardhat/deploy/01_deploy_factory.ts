import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const LOCAL_ADDRESSES = {
  usdc: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  wbtc: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  usdcusd_feed: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  btcusd_feed: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  swaps_router: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
};

const deployFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { network } = hre;

  console.log("📡 Deploying Factory Contract...");
  console.log("Deployment Factory - using account:", deployer, "on", network.name);

  const addresses = network.name === "localhost" ? LOCAL_ADDRESSES : LOCAL_ADDRESSES;

  const factory = await deploy("Factory", {
    from: deployer,
    args: [addresses.usdc, addresses.wbtc, addresses.usdcusd_feed, addresses.btcusd_feed, addresses.swaps_router],
    log: true,
    autoMine: true,
    waitConfirmations: 1,
  });

  // Only verify on non-local networks
  if (network.name !== "localhost" && network.name !== "hardhat") {
    try {
      await hre.run("verify:verify", {
        address: factory.address,
        constructorArguments: [
          addresses.usdc,
          addresses.wbtc,
          addresses.usdcusd_feed,
          addresses.btcusd_feed,
          addresses.swaps_router,
        ],
      });
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }

  console.log("Factory deployed to:", factory.address);
};

export default deployFactory;
deployFactory.tags = ["Factory"];
