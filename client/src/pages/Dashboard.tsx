import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaShopify, FaRobot, FaTools, FaChartLine, FaTrophy, FaCog } from "react-icons/fa";
import LoadingScreenDots from "../components/LoadingScreenDots";
import { UserContext } from "../App";
import NavBar from "../components/NavBar";
import { useSDK } from "@metamask/sdk-react";

const Dashboard: React.FC = () => {
  const currentUser = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // Adjust this based on your actual user type
  const { sdk, connected, connecting } = useSDK();
  

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false); // Ensure loading ends when user data is set
  }, [currentUser]);

  const features = [
    { title: "Bot Shop", description: "Sell, explore and purchase pre-built bots.", icon: <FaShopify />, link: "/bot-shop" },
    { title: "Build a Bot", description: "Design and customize your own bot with easy-to-use tools.", icon: <FaRobot />, link: "/build-a-bot" },
    { title: "My Bots", description: "View, edit, and manage all the bots you've created.", icon: <FaTools />, link: "/my-bots" },
    { title: "Stats", description: "Analyze and track the performance and activity of your bots.", icon: <FaChartLine />, link: "/stats" },
    { title: "Leaderboard", description: "View rankings and compare your bot's performance!", icon: <FaTrophy />, link: "/leaderboard" },
    { title: "Settings", description: "Manage your account and bot configurations.", icon: <FaCog />, link: "/settings" },
  ];

  return (
    <>
      {loading ? (
        <div className="h-[270px]">
          <LoadingScreenDots />
        </div>
      ) : connected ? (
        <div className="flex flex-col items-center animate-fadeIn bg-gradient-to-bl from-[#343949] to-[#7c8aaf]">
          <NavBar telegramUser={user} />
          <div 
            className="relative w-full" 
            style={{
              backgroundImage: "url('./bg.jpeg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="p-1 font-bold w-full">
              <div className="px-4 py-1 text-center">
                <div className="bg-black/50 mt-16 rounded shadow-md text-left text-white">
                  <div className="text-xl">Your Information</div>
                  <p><strong>Handle:</strong> {user?.username || "Not set"}</p>
                  <p><strong>Firstname:</strong> {user?.firstName}</p>
                  <p><strong>Telegram ID:</strong> {user?.telegramid}</p>
                  <p><strong>Score:</strong> {user?.pickScore || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="flex flex-col justify-start items-center self-stretch flex-grow gap-3 p-2 mt-6">
            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-[191px] relative">
              <img src="skylar-2.png" className="flex-grow-0 flex-shrink-0 w-[27px] h-8 object-none" alt="DexterCity" />
              <p className="flex-grow-0 flex-shrink-0 text-xl text-left text-[#ededed]">DexterCity</p>
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
        <>
          <NavBar telegramUser={user} />
          <div 
            className="absolute top w-full blur-sm" 
            style={{
              backgroundImage: "url('./bg.jpeg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
          </div>

            <div className="p-1 font-bold w-full ">
              <div className="px-4 py-1 text-center">
                <div className="bg-black/50 mt-16 rounded shadow-md text-left text-white">
                  <div className="text-xl blur-none">Your Information</div>
                  <p><strong>Handle:</strong> {user?.username || "Not set"}</p>
                  <p><strong>Firstname:</strong> {user?.firstName}</p>
                  <p><strong>Telegram ID:</strong> {user?.telegramid}</p>
                  <p><strong>Score:</strong> {user?.pickScore || 0}</p>
                </div>
              </div>
            </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
