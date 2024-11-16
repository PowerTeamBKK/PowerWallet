"use client";

import { NextPage } from "next";
import { useAccount } from "wagmi";
import { ArrowTrendingUpIcon, ChartBarIcon, ClockIcon, WalletIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

const Dashboard: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);

  return (
    <div className="flex flex-col gap-8 py-8 px-4 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <WalletIcon className="h-6 w-6" />
          <Address address={connectedAddress} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="ETH Price"
          value={`$${nativeCurrencyPrice?.toFixed(2) || "0.00"}`}
          icon={<ChartBarIcon className="h-8 w-8" />}
        />
        <StatCard title="Balance" value="0.00 ETH" icon={<WalletIcon className="h-8 w-8" />} />
        <StatCard title="24h Change" value="+0.00%" icon={<ArrowTrendingUpIcon className="h-8 w-8" />} />
        <StatCard title="Transactions" value="0" icon={<ClockIcon className="h-8 w-8" />} />
      </div>

      {/* Transaction History */}
      <div className="bg-base-100 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Address</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover">
                <td>Send</td>
                <td>0.1 ETH</td>
                <td>
                  <Address address="0x0000000000000000000000000000000000000000" />
                </td>
                <td>Just now</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => {
  return (
    <div className="bg-base-100 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">{icon}</div>
        <div>
          <p className="text-base-content/60">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
