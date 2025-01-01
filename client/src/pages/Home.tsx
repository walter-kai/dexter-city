import React, { useContext, useState } from "react";
import { useSDK } from "@metamask/sdk-react";
import NavBar from "../components/NavBar";
import { UserContext } from "../App";
import Dashboard from "./Dashboard";
import User, { TelegramUser } from '../models/User';
import { login } from "../services/FirestoreUser";


const Home: React.FC = () => {
  // const currentUser = useContext(UserContext);
  const { sdk, connected, connecting } = useSDK();
    const [account, setAccount] = useState<string | null>(null);
  

    const connectWallet = async () => {
      try {
        if (!sdk) {
          console.error("MetaMask SDK not initialized.");
          return;
        }
        const accounts = await sdk.connect();
        if (accounts && accounts.length > 0) {
          const walletId = accounts[0];
          console.log("Connected account:", walletId);
          setAccount(walletId);
          fetchBalances(walletId);
    
          const user = await login(walletId); // Pass true to create user if it doesn't exist
          sessionStorage.setItem("currentUser", JSON.stringify(user)); // Store user in session storage
        } else {
          console.log("No accounts found.");
          setAccount(null);
        }
      } catch (err) {
        console.error("Failed to connect MetaMask:", err);
      }
    };
    
    const fetchBalances = async (walletId: string) => {
      try {
        const provider = sdk?.getProvider();
        if (!provider) {
          console.error("Ethereum provider not available.");
          return;
        }
    
        // Fetch ETH balance
        const ethBalance = await provider.request({
          method: "eth_getBalance",
          params: [walletId, "latest"],
        }) as string;
    
        // Convert balance from wei to ETH
        const ethBalanceInEth = parseFloat((parseInt(ethBalance, 16) / 1e18).toFixed(4));
        const balances = [{ balance: ethBalanceInEth.toString(), currency: "ETH" }];
    
        // Store balances in sessionStorage
        sessionStorage.setItem("balances", JSON.stringify(balances));
    
        // You can add support for fetching token balances (ERC-20) here if needed.
      } catch (err) {
        console.error("Error fetching balances:", err);
      }
    };
    

  return (
    <div className="flex flex-col items-center bg-gradient-to-bl from-[#343949] to-[#7c8aaf] h-screen">
      {/* <NavBar telegramUser={currentUser} /> */}
      {connected ? (
        <Dashboard />
      ) : (
        <div className="font-montserrat flex flex-col items-center justify-center h-full space-y-4">
          <h1 className="text-white text-2xl font-bold">Welcome to Dexter City</h1>
          <h2 className="text-white text-md">Start your journey</h2>
          <img src="./dexter.png" className="h-48" alt="dexter icon"></img>
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
