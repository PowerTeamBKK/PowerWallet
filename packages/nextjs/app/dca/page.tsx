"use client";

import { NextPage } from "next";
import { useAccount } from "wagmi";
import { WalletIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-base-content/100">Strategy Address</span>
            <Address address={firstWallet} />
          </div>
        </div>
      </div>

      {/* Portfolio Stats Section */}
      <div className="bg-base-100 rounded-xl p-6 shadow-lg mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-base-200 rounded-full p-6 text-center">
            <h3 className="text-lg text-base-content/60 mb-2">Pure DCA Value</h3>
            <p className="text-2xl font-bold">$6,000.00</p>
          </div>
          <div className="bg-base-200 rounded-full p-6 text-center">
            <h3 className="text-lg text-base-content/60 mb-2">Return on Investment</h3>
            <p className="text-2xl font-bold text-success">+6.5%</p>
          </div>
          <div className="bg-base-200 rounded-full p-6 text-center">
            <h3 className="text-lg text-base-content/60 mb-2">Your Assets</h3>
            <div className="space-y-2">
              <p className="font-medium">
                <span className="text-base-content/60">USDC:</span> 5,000
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

export default DollarCostAverage;
