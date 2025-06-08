import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaShopify, FaRobot, FaTools, FaChartLine, FaTrophy, FaCog, FaExchangeAlt, FaChartPie } from "react-icons/fa";
import LoadingScreenDots from "../components/LoadingScreenDots";
import { useSDK } from "@metamask/sdk-react";
import { WrappedTokenTable } from "../components/TokenTable";

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
  const [user, setUser] = useState<any>(null);
  const { sdk, connected, connecting } = useSDK();
  const [balances, setBalances] = useState<{ balance: string, currency: string }[]>([]);
  const [statRange, setStatRange] = useState<'1d' | '7d' | '30d'>('1d');
  const [allBalances, setAllBalances] = useState<{ symbol: string, balance: string }[]>([]);
  const [balancesLoaded, setBalancesLoaded] = useState(false);
  const [allBalancesLoaded, setAllBalancesLoaded] = useState(false);
  const [ethPrice, setEthPrice] = useState<number | null>(null);

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
        setBalancesLoaded(true);
        return;
      }
      const accounts = await provider.request({ method: "eth_accounts" }) as string[];
      if (!accounts || accounts.length === 0) {
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
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
    setBalancesLoaded(true);
  };

  // Helper to fetch all token balances (ETH + ERC20s)
  const fetchAllBalances = async (walletId: string) => {
    try {
      const provider = sdk?.getProvider();
      if (!provider) {
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
    const storedUser = sessionStorage.getItem("currentUser");
    if (storedUser && storedUser !== 'undefined') {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      setBalancesLoaded(false);
      setAllBalancesLoaded(false);
      fetchBalances(user.walletId);
      fetchAllBalances(user.walletId);
      fetchEthPrice();
    }
  }, [user]);

  const timeSince = (date: string) => {
    const now = new Date();
    const lastLogin = new Date(date);
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
      return (parseFloat(balance) * ethPrice).toFixed(2);
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
          <div className="relative w-full max-w-3xl mx-auto">
            <div className="m-3 text-center">
              <div className="bg-black/50 p-3 rounded shadow-md text-left text-white">
                <div className="flex items-center gap-4 mb-4">
                  <img src={user?.photoUrl} className="h-12 w-12 rounded-full border-2 border-[#00ffe7]/40" alt="your icon" />
                  <div>
                    <div className="text-xl font-bold text-[#00ffe7]">Your Information</div>
                    <div className="text-xs text-[#b8eaff]">Wallet: <span className="font-mono">{user?.walletId}</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div>
                    <p><strong>Handle:</strong> {user?.telegramHandle || "Not set"}</p>
                    <p><strong>Firstname:</strong> {user?.firstName}</p>
                    <p><strong>Telegram ID:</strong> {user?.telegramId}</p>
                    <p><strong>Last Logged In:</strong> {user?.lastLoggedIn ? timeSince(user.lastLoggedIn) : "Unknown"}</p>
                  </div>
                  <div>
                    <div className="mb-2">
                      <strong>Balances:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {!allBalancesLoaded
                          ? <span className="text-[#faafe8]">Loading...</span>
                          : allBalances.length === 0
                            ? <span className="text-[#faafe8]">No balances found</span>
                            : allBalances.map((bal, idx) => (
                                <span key={idx} className="bg-[#23263a] border border-[#00ffe7]/30 rounded px-3 py-1 text-[#00ffe7] font-mono text-sm flex items-center gap-2">
                                  {/* Show ETH and tokens with 4 decimals */}
                                  {parseFloat(bal.balance).toFixed(4)} {bal.symbol}
                                  {bal.symbol === "ETH" && ethPrice && (
                                    <span className="text-[#b8eaff] text-xs ml-2">
                                      (${getUsdValue(bal.symbol, bal.balance)})
                                    </span>
                                  )}
                                </span>
                              ))
                        }
                      </div>
                      {ethPrice && (
                        <div className="text-xs text-[#b8eaff] mt-2">
                          ETH Price: ${ethPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="mt-4 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                  onClick={() => {
                    setBalancesLoaded(false);
                    setAllBalancesLoaded(false);
                    fetchBalances(user.walletId);
                    fetchAllBalances(user.walletId);
                    fetchEthPrice();
                  }}
                >
                  Refresh Balances
                </button>
              </div>
              <WrappedTokenTable />
            </div>
          </div>
          {/* Do NOT render a local subnav here. SubNavBar is global and should be customized for /bots/dashboard route. */}
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
