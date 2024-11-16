"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { NextPage } from "next";
import { toast } from "react-hot-toast";
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
import { PlusIcon, WalletIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StrategyModal = ({ isOpen, onClose }: StrategyModalProps) => {
  const [selectedStrategy, setSelectedStrategy] = useState("dca");
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState("");
  const { writeContractAsync: writeFactoryContractAsync, isPending } = useScaffoldWriteContract("factory");

  // const { writeContractAsync: writeWalletContractAsync, isWalletPending } = useScaffoldWriteContract({contractName:"wallet",});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedStrategy === "dca") {
        // Convert USDC amount (6 decimals)
        const usdcAmount = BigInt(Math.floor(parseFloat(amount) * 1_000_000));
        await writeFactoryContractAsync(
          {
            functionName: "newWalletDCA",
            args: [usdcAmount, BigInt(interval)],
          },
          {
            onBlockConfirmation: txnReceipt => {
              console.log("📦 Transaction blockHash", txnReceipt.blockHash);
              toast.success("DCA Strategy created successfully!");
              onClose();
            },
          },
        );
      } else if (selectedStrategy === "powerLawLow") {
        await writeFactoryContractAsync(
          {
            functionName: "newWalletPowerLawLow",
          },
          {
            onBlockConfirmation: txnReceipt => {
              console.log("📦 Transaction blockHash", txnReceipt.blockHash);
              toast.success("Power Law Low Strategy created successfully!");
              onClose();
            },
          },
        );
      } else if (selectedStrategy === "powerLawHigh") {
        await writeFactoryContractAsync(
          {
            functionName: "newWalletPowerLawHigh",
          },
          {
            onBlockConfirmation: txnReceipt => {
              console.log("📦 Transaction blockHash", txnReceipt.blockHash);
              toast.success("Power Law High Strategy created successfully!");
              onClose();
            },
          },
        );
      }
    } catch (error: any) {
      toast.error(`Failed to create strategy: ${error?.message || "Unknown error"}`);
    }
  };

  // const withdrawUsdc = async (walletAddress,amount) => {
  //   writeWalletContractAsync({
  //     address: walletAddress,
  //     abi: DeployedContracts[84532].wallet.abi,
  //     functionName: "withdraw",
  //     args: [amount],
  //   });

  // };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 p-2 rounded-xl max-w-4xl w-full mx-4 flex flex-col md:flex-row gap-6">
        {/* Image container */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-start">
          <Image
            src="/SLAddStrat.jpg"
            alt="Snow Leapard"
            width={300}
            height={300}
            className="rounded-xl object-cover"
          />
        </div>

        {/* Form container */}
        <div className="w-full md:w-1/2">
          <h3 className="text-2xl font-bold mb-4">Create New Strategy</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">1. Select Strategy</label>
              <select
                className="select select-bordered w-full"
                value={selectedStrategy}
                onChange={e => setSelectedStrategy(e.target.value)}
              >
                <option value="dca">Pure DCA</option>
                <option value="powerLawLow">Easy</option>
                <option value="powerLawHigh">Bold</option>
              </select>
            </div>

            <div className="text-sm text-base-content/70 mb-4">
              {selectedStrategy === "dca" && "Automatically invest a fixed amount at regular intervals."}
              {selectedStrategy === "powerLawLow" &&
                "Lower risk strategy using power law formula for dynamic allocation."}
              {selectedStrategy === "powerLawHigh" &&
                "Higher risk strategy using power law formula for aggressive allocation."}
            </div>

            {selectedStrategy === "dca" && (
              <>
                <div>
                  <label className="label">2. Allocate Funds (USDC)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className="input input-bordered w-full"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className="label">3. Select TimeFrame (seconds)</label>
                  <input
                    type="number"
                    min="1"
                    className="input input-bordered w-full"
                    value={interval}
                    onChange={e => setInterval(e.target.value)}
                    required
                    disabled={isPending}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" className="btn" onClick={onClose} disabled={isPending}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? "Creating..." : "Create Strategy"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const WalletList = ({ wallets }: { wallets: `0x${string}`[] }) => {
  useScaffoldWriteContract("usdc");

  useWriteContract();

  return (
    <div className="space-y-4 overflow-x-auto">
      {wallets.map(wallet => (
        <div key={wallet} className="bg-base-200 p-4 rounded-lg flex items-center gap-2">
          <WalletIcon className="h-5 w-5" />
          <Address address={wallet} />
        </div>
      ))}
    </div>
  );
};

const Dashboard: NextPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address: connectedAddress } = useAccount();

  const [isWalletExist, setWalletExist] = useState(false);

  const { data: userWallets, isLoading } = useScaffoldReadContract({
    contractName: "factory",
    functionName: "getWalletsByUser",
    args: [connectedAddress],
  });

  useEffect(() => {
    if (userWallets && userWallets.length > 0) {
      setWalletExist(true);
    } else {
      setWalletExist(false);
    }
  }, [userWallets]);

  if (!connectedAddress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Please connect your wallet to continue</p>
      </div>
    );
  }

  return (
    <div className="max-w-1xl mx-auto p-4 mt-16 lg:mt-2">
      {/* Oval Header */}
      <div className="bg-base-100 rounded-xl shadow-lg p-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Your Strategies</h1>
        <button
          disabled={isWalletExist}
          className="btn btn-primary w-full sm:w-auto"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusIcon className="h-5 w-5" />
          Add New Strategy
        </button>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          {userWallets && Array.isArray(userWallets) && userWallets.length > 0 ? (
            <div className="space-y-8">
              <WalletList wallets={userWallets as `0x${string}`[]} />

              {/* Portfolio Stats Section */}
              <div className="bg-base-100 rounded-xl p-6 shadow-lg">
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
          ) : (
            <div className="text-center py-12">
              <p className="text-base-content/60 mb-4">No strategies found</p>
              <p className="text-sm">Create your first strategy to get started</p>
            </div>
          )}
        </>
      )}

      <StrategyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
