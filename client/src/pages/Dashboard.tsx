import React, { useState } from "react";
import LoadingScreenDots from "../components/common/LoadingScreenDots";
import { useAuth } from "../contexts/AuthContext";
import { useBalances } from "../contexts/BalanceProvider";
import StatCards from "../components/dashboard/StatCards";
import UserInfoCard from "../components/dashboard/UserInfoCard";
import AccountStatsCard from "../components/dashboard/AccountStatsCard";
import LeaderboardCard from "../components/dashboard/LeaderboardCard";

const statPresets = {
  "1d": {
    pl: "+0.42 ETH",
    botsRunning: 2,
    botsGarage: 5,
    orders: 14,
  },
  "7d": {
    pl: "+2.13 ETH",
    botsRunning: 3,
    botsGarage: 7,
    orders: 82,
  },
  "30d": {
    pl: "+7.88 ETH",
    botsRunning: 4,
    botsGarage: 9,
    orders: 312,
  },
};

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
    totalTrades: 1247,
    winRate: 73.8,
    bestStreak: 12,
    totalProfit: "+15.6 ETH",
    avgTradeSize: "0.85 ETH",
    activeDays: 45,
    favoriteBot: "ScalpMaster Pro"
  });

  // Show loading if balances haven't been loaded yet
  // if (!balancesLoaded && user) {
  //   return (
  //     <div className="h-[270px]">
  //       <LoadingScreenDots />
  //     </div>
  //   );
  // }

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
      {/* Game-style HUD stats */}
      <StatCards 
        statRange={statRange}
        onStatRangeChange={setStatRange}
        statPresets={statPresets}
      />

      {/* User Info */}
      <div className="relative w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <UserInfoCard user={user} />
          <AccountStatsCard userStats={userStats} />
          <LeaderboardCard leaderboardData={leaderboardData} userStats={userStats} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
