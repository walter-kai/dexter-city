import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaShopify, FaRobot, FaTools, FaChartLine, FaTrophy, FaCog, FaExchangeAlt, FaChartPie, FaCrown, FaMedal, FaUser, FaFire } from "react-icons/fa";
import { SiEthereum } from 'react-icons/si';
import LoadingScreenDots from "../components/common/LoadingScreenDots";
import { useSDK } from "@metamask/sdk-react";
import { useAuth } from "../contexts/AuthContext";
import { formatLargeNumberEth } from "../utils/formatEthNumber";

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
  const [loading, setLoading] = useState(true);
  const { sdk, connected, connecting } = useSDK();
  const { user } = useAuth(); // Use the user from AuthContext instead of local state
  const [balances, setBalances] = useState<{ balance: string, currency: string }[]>([]);
  const [statRange, setStatRange] = useState<'1d' | '7d' | '30d'>('1d');
  const [allBalances, setAllBalances] = useState<{ symbol: string, balance: string }[]>([]);
  const [balancesLoaded, setBalancesLoaded] = useState(false);
  const [allBalancesLoaded, setAllBalancesLoaded] = useState(false);
  const [ethPrice, setEthPrice] = useState<number | null>(null);

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

  // Fetch ETH price in USD
  const fetchEthPrice = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await res.json();
      if (data.ethereum && data.ethereum.usd) {
        setEthPrice(data.ethereum.usd);
      }
    } catch (err) {
      setEthPrice(null);
    }
  };

  const fetchBalances = async (walletId: string) => {
    try {
      const provider = sdk?.getProvider();
      if (!provider) {
        console.error("Ethereum provider not available.");
        setBalancesLoaded(true);
        return;
      }

      // Verify wallet connection first
      const accounts = await provider.request({ method: "eth_accounts" }) as string[];
      if (!accounts || accounts.length === 0) {
        console.error("No connected accounts found.");
        setBalancesLoaded(true);
        return;
      }

      // Ensure the walletId matches one of the connected accounts
      const normalizedWalletId = walletId.toLowerCase();
      const accountFound = accounts.some(account => account.toLowerCase() === normalizedWalletId);
      
      if (!accountFound) {
        console.error("Wallet ID not in connected accounts:", walletId);
        console.error("Connected accounts:", accounts);
        setBalancesLoaded(true);
        return;
      }

      const ethBalance = await provider.request({
        method: "eth_getBalance",
        params: [walletId, "latest"],
      }) as string;

      // Always show 4 decimals for ETH
      const ethBalanceInEth = (parseInt(ethBalance, 16) / 1e18).toFixed(4);
      setBalances([{ balance: ethBalanceInEth, currency: "ETH" }]);
      console.log("Dashboard balance fetched successfully:", ethBalanceInEth, "ETH");
    } catch (err) {
      console.error("Error fetching balances:", err);
      console.error("WalletId used:", walletId);
      console.error("Connected:", connected);
      console.error("SDK available:", !!sdk);
    }
    setBalancesLoaded(true);
  };

  // Helper to fetch all token balances (ETH + ERC20s)
  const fetchAllBalances = async (walletId: string) => {
    try {
      const provider = sdk?.getProvider();
      if (!provider) {
        console.error("Provider not available for fetchAllBalances");
        setAllBalancesLoaded(true);
        return;
      }

      // Verify connection first
      const accounts = await provider.request({ method: "eth_accounts" }) as string[];
      if (!accounts || accounts.length === 0) {
        console.error("No accounts for fetchAllBalances");
        setAllBalancesLoaded(true);
        return;
      }

      // ETH balance
      const ethBalance = await provider.request({
        method: "eth_getBalance",
        params: [walletId, "latest"],
      }) as string;
      const ethBalanceInEth = (parseInt(ethBalance, 16) / 1e18).toFixed(4);
      const balancesArr = [{ symbol: "ETH", balance: ethBalanceInEth }];

      // Expanded ERC20 tokens list
      const tokens = [
        { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
        { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
        { symbol: "DAI",  address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
        { symbol: "WBTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
        { symbol: "UNI",  address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18 },
        // SOL is not an ERC20, but for placeholder purposes:
        { symbol: "SOL", address: "0xSolanaTokenAddressPlaceholder", decimals: 9 }, // Placeholder, not real
        { symbol: "LINK", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18 },
        { symbol: "MATIC", address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", decimals: 18 },
        { symbol: "ARB", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18 },
        { symbol: "LDO", address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", decimals: 18 },
        { symbol: "AAVE", address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DdAE9", decimals: 18 },
      ];

      for (const token of tokens) {
        try {
          // Skip SOL as it's not an ERC20, but keep placeholder for UI
          if (token.symbol === "SOL") {
            continue;
          }
          const balance = await provider.request({
            method: "eth_call",
            params: [{
              to: token.address,
              data: "0x70a08231000000000000000000000000" + walletId.replace("0x", "").toLowerCase()
            }, "latest"],
          }) as string;
          const tokenBalance = parseInt(balance, 16) / Math.pow(10, token.decimals);
          if (tokenBalance > 0) {
            balancesArr.push({ symbol: token.symbol, balance: tokenBalance.toFixed(4) });
          }
        } catch (e) {
          // Ignore errors for tokens not held or not ERC20
        }
      }

      setAllBalances(balancesArr);
    } catch (err) {
      console.error("Error fetching all balances:", err);
    }
    setAllBalancesLoaded(true);
  };

  useEffect(() => {
    // Remove the sessionStorage logic since we're using AuthContext
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && user.walletId && connected && sdk) {
      console.log("Fetching balances for user:", user.walletId);
      setBalancesLoaded(false);
      setAllBalancesLoaded(false);
      if (user && user.walletId) {
        fetchBalances(user.walletId);
        fetchAllBalances(user.walletId);
        fetchEthPrice();
      }
    } else {
      console.log("Missing requirements for balance fetch:", {
        user: !!user,
        walletId: user?.walletId,
        connected,
        sdk: !!sdk
      });
    }
  }, [user, connected, sdk]);

  // Save all balances to sessionStorage when they update
  useEffect(() => {
    if (allBalances.length > 0 && ethPrice) {
      const balancesWithUsd = allBalances.map(bal => ({
        ...bal,
        usdValue: bal.symbol === "ETH" ? getUsdValue(bal.symbol, bal.balance) : null,
        timestamp: Date.now()
      }));
      
      sessionStorage.setItem('user_balances', JSON.stringify(balancesWithUsd));
      sessionStorage.setItem('eth_price', JSON.stringify({ price: ethPrice, timestamp: Date.now() }));
    }
  }, [allBalances, ethPrice]);

  const timeSince = (date: string | Date) => {
    const now = new Date();
    const lastLogin = typeof date === "string" ? new Date(date) : date;
    const seconds = Math.floor((now.getTime() - lastLogin.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  // Stat cards config
  const statCards = [
    {
      label: "Total P/L",
      value: statPresets[statRange].pl,
      icon: <FaChartPie />,
      color: "from-green-400/80 to-green-700/60",
      desc: "Profit/Loss",
    },
    {
      label: "Bots Running",
      value: statPresets[statRange].botsRunning,
      icon: <FaRobot />,
      color: "from-blue-400/80 to-blue-700/60",
      desc: "Active bots",
    },
    {
      label: "Bots in Garage",
      value: statPresets[statRange].botsGarage,
      icon: <FaTools />,
      color: "from-purple-400/80 to-purple-700/60",
      desc: "Idle bots",
    },
    {
      label: "Total Orders",
      value: statPresets[statRange].orders,
      icon: <FaExchangeAlt />,
      color: "from-pink-400/80 to-pink-700/60",
      desc: "Orders placed",
    },
  ];

  // Helper to get USD value for a token
  const getUsdValue = (symbol: string, balance: string) => {
    if (!ethPrice) return null;
    // Only ETH is supported for USD conversion here, but you can expand this
    if (symbol === "ETH") {
      const usdValue = (parseFloat(balance) * ethPrice).toFixed(2);
      
      // Save to sessionStorage
      const balanceData = {
        symbol,
        balance,
        usdValue,
        ethPrice,
        timestamp: Date.now()
      };
      sessionStorage.setItem(`balance_${symbol}`, JSON.stringify(balanceData));
      
      return usdValue;
    }
    return null;
  };

  return (
    <>
      {loading ? (
        <div className="h-[270px]">
          <LoadingScreenDots />
        </div>
      ) : connected ? (
        <div className="flex flex-col items-center animate-fadeIn w-full">
          {/* Game-style HUD stats */}
          <div className="w-full max-w-5xl mx-auto mt-10 mb-8">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
              {/* Stat Cards */}
              {statCards.map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`flex-1 min-w-[180px] bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg p-6 mx-2 flex flex-col items-center justify-center border-2 border-[#00ffe7]/30 relative`}
                  style={{ filter: "drop-shadow(0 0 16px #00ffe7aa)" }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#23263a] border-2 border-[#00ffe7]/40 rounded-full w-12 h-12 flex items-center justify-center text-2xl text-[#00ffe7] shadow-lg">
                    {stat.icon}
                  </div>
                  <div className="mt-8 text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-[#b8eaff] text-sm">{stat.label}</div>
                  <div className="text-xs text-[#e0e7ef]/60 mt-1">{stat.desc}</div>
                </div>
              ))}
            </div>
            {/* Stat Range Toggle */}
            <div className="flex justify-center gap-2 mt-6">
              {(['1d', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setStatRange(range)}
                  className={`px-4 py-2 rounded-lg font-bold border border-[#00ffe7]/40 transition-all duration-200 ${
                    statRange === range
                      ? 'bg-[#00ffe7] text-[#181a23] shadow-[0_0_8px_#00ffe7]'
                      : 'bg-[#23263a] text-[#e0e7ef] hover:bg-[#00ffe7]/20'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* User Info */}
          <div className="relative w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* User Info Card */}
              <div className="lg:col-span-1">
                <div className="bg-[#181a23]/80 border-4 border-[#00ffe7]/40 rounded-2xl shadow-[0_0_32px_#00ffe7] p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={user?.photoUrl || undefined} className="h-16 w-16 rounded-full border-2 border-[#00ffe7]/40" alt="your icon" />
                    <div>
                      <div className="text-xl font-bold text-[#00ffe7]">Your Information</div>
                      <div className="text-xs text-[#b8eaff]">Wallet: <span className="font-mono">{user?.walletId?.slice(0, 6)}...{user?.walletId?.slice(-4)}</span></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-[#e0e7ef]"><strong className="text-[#00ffe7]">Handle:</strong> {user?.telegramHandle || "Not set"}</p>
                    <p className="text-[#e0e7ef]"><strong className="text-[#00ffe7]">Name:</strong> {user?.firstName}</p>
                    <p className="text-[#e0e7ef]"><strong className="text-[#00ffe7]">Last Login:</strong> {user?.lastLoggedIn ? timeSince(user.lastLoggedIn) : "Unknown"}</p>
                  </div>

                  <div className="mb-4">
                    <strong className="text-[#00ffe7]">Balances:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {!allBalancesLoaded
                        ? <div className="flex items-center"><LoadingScreenDots /></div>
                        : allBalances.length === 0
                          ? <span className="text-[#faafe8]">No balances found</span>
                          : allBalances.map((bal, idx) => {
                              const formatted = formatLargeNumberEth(bal.balance);
                              const usdValue = bal.symbol === "ETH" && ethPrice 
                                ? (parseFloat(bal.balance) * ethPrice).toFixed(2)
                                : null;
                              
                              return (
                                <span key={idx} className="bg-[#23263a] border border-[#00ffe7]/30 rounded px-3 py-1 text-[#00ffe7] text-sm flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    {formatted.hasSubscript && formatted.subscriptParts ? (
                                      <span className="font-mono">
                                        {formatted.subscriptParts.before}
                                        <sub className="text-[10px]">{formatted.subscriptParts.subscript}</sub>
                                        {formatted.subscriptParts.after}
                                      </span>
                                    ) : (
                                      <span className="font-mono">{formatted.formatted}</span>
                                    )}
                                    {bal.symbol === "ETH" ? (
                                      <SiEthereum className="w-4 h-4 text-[#627eea]" />
                                    ) : (
                                      <span className="font-bold">{bal.symbol}</span>
                                    )}
                                  </div>
                                  {usdValue && (
                                    <span className="text-[#b8eaff] text-xs">
                                      (${usdValue})
                                    </span>
                                  )}
                                </span>
                              );
                            })
                      }
                    </div>
                    {ethPrice && (
                      <div className="text-xs text-[#b8eaff] mt-2">
                        ETH Price: ${ethPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>

                  <button
                    className="w-full btn-hud"
                    onClick={() => {
                      if (user?.walletId && connected && sdk) {
                        setBalancesLoaded(false);
                        setAllBalancesLoaded(false);
                        fetchBalances(user.walletId);
                        fetchAllBalances(user.walletId);
                        fetchEthPrice();
                      } else {
                        console.error("Cannot refresh balances: missing requirements", {
                          hasUser: !!user,
                          hasWalletId: !!user?.walletId,
                          connected,
                          hasSDK: !!sdk
                        });
                      }
                    }}
                  >
                    Refresh Balances
                  </button>
                </div>
              </div>

              {/* Account Stats Card */}
              <div className="lg:col-span-1">
                <div className="bg-[#181a23]/80 border-4 border-[#00ffe7]/40 rounded-2xl shadow-[0_0_32px_#00ffe7] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <FaChartLine className="text-2xl text-[#00ffe7]" />
                    <h3 className="text-xl font-bold text-[#00ffe7]">Account Stats</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">#{userStats.globalRank}</div>
                      <div className="text-xs text-[#e0e7ef]">Global Rank</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#00ffe7]">{userStats.totalTrades}</div>
                      <div className="text-xs text-[#e0e7ef]">Total Trades</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{userStats.winRate}%</div>
                      <div className="text-xs text-[#e0e7ef]">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#faafe8]">{userStats.bestStreak}</div>
                      <div className="text-xs text-[#e0e7ef]">Best Streak</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#e0e7ef]">Total Profit:</span>
                      <span className="text-green-400 font-bold">{userStats.totalProfit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#e0e7ef]">Avg Trade:</span>
                      <span className="text-[#00ffe7] font-bold">{userStats.avgTradeSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#e0e7ef]">Active Days:</span>
                      <span className="text-[#faafe8] font-bold">{userStats.activeDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#e0e7ef]">Favorite Bot:</span>
                      <span className="text-[#ff005c] font-bold text-sm">{userStats.favoriteBot}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard Card */}
              <div className="lg:col-span-1">
                <div className="bg-[#181a23]/80 border-4 border-[#00ffe7]/40 rounded-2xl shadow-[0_0_32px_#00ffe7] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <FaTrophy className="text-2xl text-[#00ffe7]" />
                    <h3 className="text-xl font-bold text-[#00ffe7]">Top Traders</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {leaderboardData.map((trader, idx) => (
                      <div key={trader.rank} className="flex items-center gap-3 p-2 rounded-lg bg-[#23263a]/50">
                        <div className="flex items-center gap-2">
                          {trader.rank === 1 && <FaCrown className="text-yellow-400" />}
                          {trader.rank === 2 && <FaMedal className="text-gray-400" />}
                          {trader.rank === 3 && <FaMedal className="text-amber-600" />}
                          {trader.rank > 3 && <span className="text-[#e0e7ef] font-bold">#{trader.rank}</span>}
                        </div>
                        <img 
                          src={trader.avatar} 
                          alt={trader.name}
                          className="w-8 h-8 rounded-full border border-[#00ffe7]/40"
                        />
                        <div className="flex-1">
                          <div className="text-[#00ffe7] font-bold text-sm">{trader.name}</div>
                          <div className="text-xs text-green-400">{trader.profit}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-[#e0e7ef]">{trader.winRate}%</div>
                          <div className="text-xs text-[#b8eaff]">win rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-[#00ffe7]/20">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-[#00ffe7]/10">
                      <FaUser className="text-[#00ffe7]" />
                      <div className="flex-1">
                        <div className="text-[#00ffe7] font-bold text-sm">You</div>
                        <div className="text-xs text-green-400">{userStats.totalProfit}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#e0e7ef]">#{userStats.globalRank}</div>
                        <div className="text-xs text-[#b8eaff]">rank</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* <div className="w-full">
              <WrappedTokenTable />
            </div> */}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-3xl font-bold text-[#00ffe7] drop-shadow-[0_0_8px_#00ffe7] mb-4">
            Welcome to DexterCity
          </h1>
          <p className="text-[#e0e7ef] mb-8">Please connect your wallet to access the dashboard</p>
        </div>
      )}
    </>
  );
};

export default Dashboard;
