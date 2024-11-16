"use client";

import { useState } from "react";
import { NextPage } from "next";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { PlusIcon, WalletIcon } from "@heroicons/react/24/outline";
import { Address, IntegerInput } from "~~/components/scaffold-eth";
import DeployedContracts from "~~/contracts/deployedContracts";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useReadContract, useWriteContract } from "wagmi";

const DollarCostAverage: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const { data: userWallets, isLoading } = useScaffoldReadContract({
    contractName: "factory",
    functionName: "getWalletsByUser",
    args: [connectedAddress],
  });

  const firstWallet = userWallets?.[0];

  const { data: usdcBalance } = useScaffoldReadContract({
    contractName: "usdc",
    functionName: "balanceOf",
    args: [firstWallet],
  });

  const displayedBalance = usdcBalance ? (Number(usdcBalance) / 1_000_000).toFixed(2) : "0";

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

  return (
    <div className="max-w-1xl mx-auto p-4 mt-16 lg:mt-2 overflow-x-hidden">
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
        <WalletList wallets={userWallets as `0x${string}`[]} />
      </div>

      {/* Portfolio Stats Section */}
      <div className="bg-base-100 rounded-xl p-6 shadow-lg mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-base-200 rounded-xl p-6 text-center">
            <h3 className="text-lg text-base-content/60 mb-2">Portfolio Value</h3>
            <p className="text-2xl font-bold">${displayedBalance}</p>
          </div>
          <div className="bg-base-200 rounded-xl p-6 text-center">
            <h3 className="text-lg text-base-content/60 mb-2">Return on Investment</h3>
            <p className="text-2xl font-bold text-success">+6.5%</p>
          </div>
          <div className="bg-base-200 rounded-xl p-6 text-center">
            <h3 className="text-lg text-base-content/60 mb-2">Your Assets</h3>
            <div className="space-y-2">
              <p className="font-medium">
                <span className="text-base-content/60">USDC:</span> ${displayedBalance}
              </p>
              <p className="font-medium">
                <span className="text-base-content/60">cbBTC:</span> 0.001
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
  const { address: connectedAddress } = useAccount();
  const [approveAmount, setApproveAmount] = useState<string | bigint>("");
  const firstWallet = wallets[0];
  const { isPaused } = useReadContract({
    address: firstWallet,
    functionName: "isPaused",
    abi: DeployedContracts[84532].wallet.abi,
    args: [],
    chainId: 84532,
    query: {
      enabled: false,
      retry: false,
    },
  });

  console.log(">>> readContractHookRes", firstWallet, isPaused  )


  const approveUsdc = async (e: React.FormEvent) => {
    e.preventDefault();

    const walletAddress = wallets[0];
    const amount = BigInt(Math.floor(Number(approveAmount) * 1_000_000)); // Convert to USDC (6 decimals)

    await writeUSDCContractAsync(
      {
        functionName: "approve",
        args: [walletAddress, amount],
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
    const walletAddress = wallets[0];
    await writeWalletContractAsync({
      address: walletAddress,
      abi: DeployedContracts[84532].wallet.abi,
      functionName: "pause",
      args: [],
    });

  };

  const unpauseWallet = async (e: React.FormEvent) => {
    e.preventDefault();

    const walletAddress = wallets[0];
    await writeWalletContractAsync({
      address: walletAddress,
      abi: DeployedContracts[84532].wallet.abi,
      functionName: "unpause",
      args: [],
    });
  };

  const depositUsdc = async () => {
    const walletAddress = wallets[0];
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
    const walletAddress = wallets[0];
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

  const { data: approval, isLoading } = useScaffoldReadContract({
    contractName: "usdc",
    functionName: "allowance",
    args: [connectedAddress, firstWallet],
  });

  const isApprovalSufficient = approval && Number(approval) >= 1n;

  return (
    <div className="space-y-4">
      {wallets.map(wallet => (
        <div key={wallet} className="bg-base-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <WalletIcon className="h-5 w-5" />
            <Address address={wallet} />
          </div>
          <div className="flex flex-col lg:flex-row gap-2 justify-center">
            <div className="flex flex-wrap gap-2 justify-center">
              <IntegerInput
                value={approveAmount.toString()}
                onChange={updatedTxValue => setApproveAmount(updatedTxValue)}
                placeholder="Amount"
              />
              <button
                className="btn rounded-xl btn-primary btn-sm"
                onClick={isApprovalSufficient ? depositUsdc : approveUsdc}
                disabled={isLoading || approval === undefined}
              >
                <PlusIcon className="h-4 w-4" />
                {isLoading ? "Loading..." : isApprovalSufficient ? "Deposit" : "Approve for Deposit"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button className="btn rounded-xl btn-primary btn-sm" onClick={withdrawUsdc}>
                <PlusIcon className="h-4 w-4" />
                Withdraw
              </button>

              { !isPaused && 
                <button className="btn btn-primary btn-sm" onClick={pauseWallet}>
                  <PlusIcon className="h-4 w-4" />
                  Pause
                </button>
              }

              { isPaused && 
                <button className="btn btn-primary btn-sm" onClick={unpauseWallet}>
                  <PlusIcon className="h-4 w-4" />
                  Unpause
                </button>
              }
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DollarCostAverage;
