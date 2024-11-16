"use client";

import { NextPage } from "next";
import { useAccount } from "wagmi";
import { WalletIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
 import { PlusIcon } from "@heroicons/react/24/outline";
import DeployedContracts from "~~/contracts/deployedContracts";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useWriteContract } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";




 
const DollarCostAverage: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const { data: userWallets, isLoading } = useScaffoldReadContract({
    contractName: "factory",
    functionName: "getWalletsByUser",
    args: [connectedAddress],
  });

  if (!connectedAddress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Please connect your wallet to continue</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading strategy...</p>
      </div>
    );
  }

  if (!userWallets || !Array.isArray(userWallets) || userWallets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">No DCA strategy found</p>
      </div>
    );
  }

  // Get first wallet address
  const firstWallet = userWallets[0];

  return (
    <div className="max-w-1xl mx-auto p-4 mt-16 lg:mt-2">
      {/* Oval Header */}
      <div className="bg-base-100 rounded-xl shadow-lg p-6 mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dollar Cost Average</h1>
        <div className="flex items-center gap-2">
          <WalletIcon className="h-5 w-5" />
          <Address address={connectedAddress} />
        </div>
      </div>

      {/* Strategy Details */}
      <div className="bg-base-100 rounded-xl p-6 shadow-lg">
        {/* <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-base-content/100">Strategy Address</span>
            <Address address={firstWallet} />
          </div>
        </div> */}
                      <WalletList wallets={userWallets as `0x${string}`[]} />

      </div>

      {/* Portfolio Stats Section */}
      <div className="bg-base-100 rounded-xl p-6 shadow-lg mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-base-200 rounded-full p-6 text-center">
            <h3 className="text-lg text-base-content/60 mb-2">Portfolio Value</h3>
            <p className="text-2xl font-bold">$10,000.00</p>
          </div>
          <div className="bg-base-200 rounded-full p-6 text-center">
            <h3 className="text-lg text-base-content/60 mb-2">Return on Investment</h3>
            <p className="text-2xl font-bold text-success">+15.5%</p>
          </div>
          <div className="bg-base-200 rounded-full p-6 text-center">
            <h3 className="text-lg text-base-content/60 mb-2">Your Assets</h3>
            <div className="space-y-2">
              <p className="font-medium">
                <span className="text-base-content/60">USDC:</span> 5,000
              </p>
              <p className="font-medium">
                <span className="text-base-content/60">cbBTC:</span> 0.15
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const WalletList = ({ wallets }: { wallets: `0x${string}`[] }) => {
  const { writeContractAsync: writeUSDCContractAsync } = useScaffoldWriteContract("usdc");

  const approveUsdc = async (e: React.FormEvent) => {
    e.preventDefault();

    // wallet address

    const walletAddress = "0x71419CB9f45A6384ed96648189076BB94b55e5F0";
    const amount = "1";

    await writeUSDCContractAsync(
      {
        functionName: "approve",
        args: [walletAddress, BigInt(amount)],
      },
      {
        onBlockConfirmation: txnReceipt => {
          console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          toast.success("USDC approved!");
        },
      },
    );
  };

  const { writeContractAsync: writeWalletContractAsync } = useWriteContract();
  const writeTx = useTransactor();

  const pauseWallet = async (e: React.FormEvent) => {
    e.preventDefault();

 
 

    await writeUSDCContractAsync(
      {
        functionName: "pause",
      },
      {
        onBlockConfirmation: txnReceipt => {
          console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          toast.success("pause !");

        },
      },
    );

  };

  const unpauseWallet = async (e: React.FormEvent) => {
    e.preventDefault();

    // wallet address
 

    await writeUSDCContractAsync(
      {
        functionName: "unpause",
       },
      {
        onBlockConfirmation: txnReceipt => {
          console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          toast.success("Pause contract!");

        },
      },
    );

  };
 const depositUsdc = async () => {
    const walletAddress = "0x71419CB9f45A6384ed96648189076BB94b55e5F0";
    const amount = 1n;
    const writeContractAsyncWithParams = () =>
      writeWalletContractAsync({
        address: walletAddress,
        abi: DeployedContracts[84532].wallet.abi,
        functionName: "deposit",
        args: [amount],
      });

    try {
      await writeTx(writeContractAsyncWithParams, { blockConfirmations: 1 });
    } catch (e) {
      console.log("Unexpected error in writeTx", e);
    }
  };

  const withdrawUsdc = async () => {
    const walletAddress = "0x71419CB9f45A6384ed96648189076BB94b55e5F0";
    const amount = 1n;
    const writeContractAsyncWithParams = () =>
      writeWalletContractAsync({
        address: walletAddress,
        abi: DeployedContracts[84532].wallet.abi,
        functionName: "withdraw",
        args: [amount],
      });

    try {
      await writeTx(writeContractAsyncWithParams, { blockConfirmations: 1 });
    } catch (e) {
      console.log("Unexpected error in writeTx", e);
    }
  };

  return (
    <div className="space-y-2">
      {wallets.map(wallet => (
        <div key={wallet} className="bg-base-200 p-4 rounded-lg flex items-center gap-2">
          <WalletIcon className="h-5 w-5" />
          <Address address={wallet} />
          <button className="btn btn-primary" onClick={approveUsdc}>
            <PlusIcon className="h-5 w-5" />
            Approve
          </button>
          <button className="btn btn-primary" onClick={depositUsdc}>
            <PlusIcon className="h-5 w-5" />
            Deposit
          </button>
          <button className="btn btn-primary" onClick={withdrawUsdc}>
            <PlusIcon className="h-5 w-5" />
            Withdraw
          </button>

          <button className="btn btn-primary" onClick={pauseWallet}>
            <PlusIcon className="h-5 w-5" />
            pause
          </button>

          <button className="btn btn-primary" onClick={unpauseWallet}>
            <PlusIcon className="h-5 w-5" />
            unpaused
          </button>
        </div>
      ))}
    </div>
  );
};

export default DollarCostAverage;
