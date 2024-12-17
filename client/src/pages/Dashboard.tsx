import React, { useContext, useEffect, useState } from "react";
import LoadingScreenDots from "../components/LoadingScreenDots";
import { UserContext } from "../App";
import GameList from "../components/GameList";
import NavBar from "../components/NavBar";

const Dashboard: React.FC = () => {
  const currentUser = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // Adjust this based on your actual user type

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false); // Make sure loading ends when user data is set
  }, [currentUser]);

  return (
    <>
      {loading ? (
        <div className="h-[270px]">
          <LoadingScreenDots />
        </div>
      ) : (
        <div className="flex flex-col items-center animate-fadeIn">
          <NavBar telegramUser={user} />
          <div className="relative w-full">
            <div className="p-1 font-bold w-full">
              <div className="absolute h-[265px] w-full bg-gradient-to-r from-white/10 via-black/20 to-white/10 blur-sm"></div>
              <div className="px-4 py-1 text-center">
                <h1 className="text-2xl font-bold mb-4">Welcome to Your Dashboard!</h1>
                <div className="bg-white p-4 rounded shadow-md">
                  <h2 className="text-xl">Your Information</h2>
                  <p><strong>Handle:</strong> {user?.username || "Not set"}</p>
                  <p><strong>Firstname:</strong> {user?.firstName}</p>
                  <p><strong>Telegram ID:</strong> {user?.telegramid}</p>
                  <p><strong>Score:</strong> {user?.pickScore || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
