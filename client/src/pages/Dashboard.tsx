import React, { useState } from "react";
import LoadingScreenDots from "../components/common/LoadingScreenDots";
import { useAuth } from "../contexts/AuthContext";
import { useBalances } from "../contexts/BalanceProvider";
import InvestmentOverview from "../components/dashboard/InvestmentOverview";
import UserInfoCard from "../components/dashboard/UserInfoCard";
import BotsList from "../components/dashboard/BotsList";
import LeaderboardCard from "../components/dashboard/LeaderboardCard";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { balancesLoaded } = useBalances();
  const [statRange, setStatRange] = useState<'1d' | '7d' | '30d'>('1d');

  const [leaderboardData] = useState([
    { rank: 1, name: "CryptoKing", profit: "+125.8 ETH", winRate: 94.2, avatar: "https://robohash.org/cryptoking" },
    { rank: 2, name: "TradeBot", profit: "+98.5 ETH", winRate: 91.7, avatar: "https://robohash.org/tradebot" },
    { rank: 3, name: "AlphaTrader", profit: "+87.3 ETH", winRate: 89.4, avatar: "https://robohash.org/alphatrader" },
    { rank: 4, name: "BotMaster", profit: "+76.1 ETH", winRate: 88.2, avatar: "https://robohash.org/botmaster" },
    { rank: 5, name: "TradingPro", profit: "+65.9 ETH", winRate: 86.5, avatar: "https://robohash.org/tradingpro" },
  ]);

  const [userStats] = useState({
    globalRank: 847,
    totalProfit: "+15.6 ETH",
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-[#00ffe7] drop-shadow-[0_0_8px_#00ffe7] mb-4">
          Welcome to DexterCity
        </h1>
        <p className="text-[#e0e7ef] mb-8">Please connect your wallet to access the dashboard</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center animate-fadeIn w-full">

            {/* Combined User Info and Leaderboard */}
      <div className="relative w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <UserInfoCard user={user} />
          <LeaderboardCard leaderboardData={leaderboardData} userStats={userStats} />
        </div>
      </div>
      {/* Investment Overview with Chart */}
      <InvestmentOverview 
        statRange={statRange}
        onStatRangeChange={setStatRange}
      />

      {/* Bots List with Status Tracking */}
      <BotsList />


    </div>
  );
};

export default Dashboard;
