import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-abi-exporter";

// If not set, it uses the hardhat account 0 private key.
const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// const user1PrivateKey = process.env.USER1_PRIVATE_KEY ?? ""

// If not set, it uses ours Etherscan default API key.
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";
// forking rpc url
// const forkingURL = process.env.FORKING_URL || "";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.27",
        settings: {
          optimizer: {
            enabled: true,
            // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  // Add these network configurations to your hardhat.config.ts
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    hardhat: {
      forking: {
        url: process.env.FORKING_URL || "https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY",
        blockNumber: 21175460,
        enabled: false,
      },
      chainId: 31337,
      accounts: {
        accountsBalance: "100000000000000000000",
        count: 10,
      },
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [deployerPrivateKey],
      chainId: 84532,
      verify: {
        etherscan: {
          apiKey: etherscanApiKey,
        },
      },
    },
  },
  // configuration for harhdat-verify plugin
  etherscan: {
    apiKey: {
      // Is not required by blockscout. Can be any non-empty string
      baseSepolia: `${etherscanApiKey}`,
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://base-sepolia.blockscout.com/api",
          browserURL: "https://base-sepolia.blockscout.com/",
        },
      },
    ],
  },
  // configuration for etherscan-verify from hardhat-deploy plugin
  verify: {
    etherscan: {
      apiKey: `${etherscanApiKey}`,
    },
  },
  sourcify: {
    enabled: false,
  },
  abiExporter: {
    path: './abis',     // Output directory for ABIs
    clear: true,        // Clear the directory before export
    flat: true,         // Flatten the output structure (no nested folders)
    only: [],           // Optional: only export specific contracts
    spacing: 2,         // JSON spacing (pretty print)
    format: 'json'      // Format of the output files
  },
};

export default config;
