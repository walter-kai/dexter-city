import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaShopify, FaRobot, FaTools, FaChartLine, FaTrophy, FaCog, FaReact } from "react-icons/fa";
import LoadingScreenDots from "../components/LoadingScreenDots";
import { useSDK } from "@metamask/sdk-react";
import { WrappedTokenTable } from "../components/TokenTable";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // Adjust this based on your actual user type
  const { sdk, connected, connecting } = useSDK();
  const [balances, setBalances] = useState<{ balance: string, currency: string }[]>([]);

  const fetchBalances = async (walletId: string) => {
    try {
      const provider = sdk?.getProvider();
      if (!provider) {
        console.error("Ethereum provider not available.");
        return;
      }
  
      // Ensure the provider is still connected
      const accounts = await provider.request({ method: "eth_accounts" }) as string[];
      if (!accounts || accounts.length === 0) {
        console.error("No connected accounts. Please reconnect MetaMask.");
        return;
      }
  
      // Fetch ETH balance
      const ethBalance = await provider.request({
        method: "eth_getBalance",
        params: [walletId, "latest"],
      }) as string;
  
      console.log("Fetched ETH balance in wei:", ethBalance);
  
      // Convert balance from wei (BigInt) to ETH
      const ethBalanceInEth = parseFloat((parseInt(ethBalance, 16) / 1e18).toFixed(4));
      console.log("ETH balance in ETH:", ethBalanceInEth);
  
      setBalances([{ balance: ethBalanceInEth.toFixed(4), currency: "ETH" }]);
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  };
  
  
  useEffect(() => {
    // Check if the user is in sessionStorage
    const storedUser = sessionStorage.getItem("currentUser");
    if (storedUser && storedUser !== 'undefined') {
      setUser(JSON.parse(storedUser)); // Parse and set user from sessionStorage
    }
    setLoading(false); // Ensure loading ends when user data is set
  }, []);

  useEffect(() => {
    // Fetch balances once the account is available and connected
    if (user) {
      fetchBalances(user.walletId);
    }
  }, [user]); // Fetch balances when connected or user changes

  const features = [
    { title: "How this works", description: "How to and getting started guides.", icon: <FaReact />, link: "/guide" },
    { title: "Bot Shop", description: "Sell, explore and purchase pre-built bots.", icon: <FaShopify />, link: "/shop" },
    { title: "Bot Garage", description: "Build, view, edit, and manage all the bots you've created.", icon: <FaTools />, link: "/bots" },
    { title: "Stats", description: "Analyze and track the performance and activity of your bots.", icon: <FaChartLine />, link: "/stats" },
    { title: "Leaderboard", description: "View rankings and compare your bot's performance!", icon: <FaTrophy />, link: "/leaderboard" },
    { title: "Settings", description: "Manage your account and bot configurations.", icon: <FaCog />, link: "/settings" },
  ];

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
  

  return (
    <>
      {loading ? (
        <div className="h-[270px]">
          <LoadingScreenDots />
        </div>
      ) : connected ? (
        <div className="flex flex-col items-center animate-fadeIn">
          <div className="relative w-full">
            <div className="mt-8 font-bold w-full">
              <div className="m-3 text-center">
                <div className="bg-black/50 p-3 rounded shadow-md text-left text-white">
                  <div className="text-xl">Your Information</div>
                  <img src={user?.photoUrl} className="h-10" alt="your icon" />
                  <p><strong>Handle:</strong> {user?.telegramHandle || "Not set"}</p>
                  <p><strong>Firstname:</strong> {user?.firstName}</p>
                  <p><strong>Telegram ID:</strong> {user?.telegramId}</p>
                  <p><strong>Balance:</strong>
                    {balances.length > 0 && (
                      <div className="text-green-500 font-semibold">
                        {balances.map((balance, index) => (
                          <div key={index}>
                            {balance.balance} {balance.currency}
                          </div>
                        ))}
                      </div>
                    )}
                  </p>
                  <p><strong>Last Logged In:</strong> {user?.lastLoggedIn ? timeSince(user.lastLoggedIn) : "Unknown"}</p>

                  {/* Refresh Button */}
                  <button
                    className="mt-4 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                    onClick={() => fetchBalances(user.walletId)}
                  >
                    Refresh Balance
                  </button>
                </div>

                <WrappedTokenTable />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="flex flex-col justify-start items-center self-stretch flex-grow gap-3 p-2 mt-6">
            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-[191px] relative">
              {/* <p className="flex-grow-0 flex-shrink-0 text-xl text-left text-[#ededed]">DexterCity</p> */}
            </div>
            <div className="flex flex-wrap justify-center items-start gap-5">
              {features.map((item, index) => (
                <Link
                  to={item.link}
                  key={index}
                  className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-[400px] gap-2.5 px-3.5 pt-3.5 pb-3 rounded-2xl bg-[#76657d]/[0.55] hover:bg-[#76657d]/[0.8] transition"
                >
                  <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 h-[72px] p-[7px] rounded-[100px] bg-[#8c8c8c] backdrop-blur-[150px] text-white text-2xl">
                    {item.icon}
                  </div>
                  <div className="flex flex-col justify-start items-start self-stretch flex-grow relative">
                    <p className="text-[15px] text-center text-neutral-100 font-bold">{item.title}</p>
                    <p className="text-xs text-center text-neutral-100">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
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
