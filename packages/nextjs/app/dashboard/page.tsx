"use client";

import { useState } from "react";
import { NextPage } from "next";
import { toast } from "react-hot-toast";
import { useAccount } from "wagmi";
import { PlusIcon, WalletIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StrategyModal = ({ isOpen, onClose }: StrategyModalProps) => {
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState("");
  const { writeContractAsync: writeFactoryContractAsync, isPending } = useScaffoldWriteContract("factory");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await writeFactoryContractAsync(
        {
          functionName: "newWalletDCA",
          args: [BigInt(amount), BigInt(interval)],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
            toast.success("Strategy created successfully!");
            onClose();
          },
        },
      );
    } catch (error: any) {
      toast.error(`Failed to create strategy: ${error?.message || "Unknown error"}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 p-6 rounded-xl w-96" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4">Create New Strategy</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Amount (ETH)</label>
            <input
              type="number"
              step="0.000000000000000001"
              min="0"
              className="input input-bordered w-full"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <div>
            <label className="label">Interval (seconds)</label>
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
  );
};

const WalletList = ({ wallets }: { wallets: `0x${string}`[] }) => {
  return (
    <div className="space-y-2">
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

  return (
    <div className="max-w-2xl mx-auto p-6 mt-16 lg:mt-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Strategies</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-5 w-5" />
          Add New Strategy
        </button>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          {userWallets && Array.isArray(userWallets) && userWallets.length > 0 ? (
            <WalletList wallets={userWallets as `0x${string}`[]} />
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
