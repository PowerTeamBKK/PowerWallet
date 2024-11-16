"use client";

import { NextPage } from "next";
import { useAccount } from "wagmi";
import { ArrowTrendingUpIcon, ChartBarIcon, ClockIcon, WalletIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, icon }: StatCardProps) => (
  <div className="bg-base-100 rounded-xl p-4 shadow-lg w-full">
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 p-2 rounded-lg shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base-content/60 truncate">{title}</p>
        <p className="text-xl font-bold truncate">{value}</p>
      </div>
    </div>
  </div>
);

const Dashboard: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);

  return (
    <div className="flex flex-col items-center min-h-screen w-full mt-16 lg:mt-0 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col gap-2 text-center lg:text-left">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2 justify-center lg:justify-start">
            <WalletIcon className="h-6 w-6" />
            <Address address={connectedAddress} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 w-full">
          <StatCard
            title="ETH Price"
            value={`$${nativeCurrencyPrice?.toFixed(2) || "0.00"}`}
            icon={<ChartBarIcon className="h-6 w-6" />}
          />
          <StatCard 
            title="Balance" 
            value="0.00 ETH" 
            icon={<WalletIcon className="h-6 w-6" />} 
          />
          <StatCard 
            title="24h Change" 
            value="+0.00%" 
            icon={<ArrowTrendingUpIcon className="h-6 w-6" />} 
          />
          <StatCard 
            title="Transactions" 
            value="0" 
            icon={<ClockIcon className="h-6 w-6" />} 
          />
        </div>

        {/* Transaction History */}
        <div className="bg-base-100 rounded-xl p-6 shadow-lg mt-8 w-full">
          <h2 className="text-2xl font-bold mb-4 text-center lg:text-left">Recent Transactions</h2>
          <div className="w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="w-1/6 text-left">Type</th>
                  <th className="w-1/6 text-left">Amount</th>
                  <th className="w-1/2 text-left">Address</th>
                  <th className="w-1/6 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover">
                  <td className="whitespace-nowrap">Send</td>
                  <td className="whitespace-nowrap">0.1 ETH</td>
                  <td className="max-w-0 overflow-hidden text-ellipsis">
                    <Address address="0x0000000000000000000000000000000000000000" />
                  </td>
                  <td className="whitespace-nowrap">Just now</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;