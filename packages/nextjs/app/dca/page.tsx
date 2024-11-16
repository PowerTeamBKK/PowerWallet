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
    <div className="flex flex-col items-center min-h-screen w-full mt-16 lg:mt-0">
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Oval Header */}
        <div className="bg-base-100 rounded-full shadow-lg p-6 mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dollar Cost Average</h1>
          <div className="flex items-center gap-2">
            <WalletIcon className="h-5 w-5" />
            <Address address={connectedAddress} size="lg" />
          </div>
        </div>

        {/* Strategy Details */}
        <div className="bg-base-100 rounded-xl p-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Strategy Address</span>
              <Address address={firstWallet} />
            </div>
            {/* Add more strategy details here once available */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DollarCostAverage;
