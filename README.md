# 💵 Power Wallet

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 Power Wallet is an-chain personal vault that simplifies investing in bitcoin with risk management built-in, that provides a safe, easy and stress free investment experience.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, OnchainKit, and Typescript.

- ✅ **Custom Trading Strategies**: Your frontend auto-adapts to your smart contract as you edit 

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.18)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```
cd my-dapp-example
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/hardhat/hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contracts in `packages/hardhat/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. 
- Edit your deployment scripts in `packages/hardhat/deploy`

## Smart Contract

### Test

To run tests:
```
cd packages/hardhat
npx hardhat test
```

### Deploy 

To deploy the Factory contract:
```
npx hardhat run scripts/deployFactory.ts --network baseSepolia
```

## Generate ABI
Generate contract ABIs:
```
npx hardhat clear-abi
npx hardhat export-abi
```

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

## Contributing to Power Wallet

We welcome contributions to Power Wallet!
