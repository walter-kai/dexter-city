import React, { useEffect, useState } from "react";
import { useSDK } from "@metamask/sdk-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
// import NavBar from "../components/NavBar";
import { login } from "../hooks/FirestoreUser";

const Home: React.FC = () => {
  const { sdk, connected, connecting } = useSDK();
  // const [account, setAccount] = useState<string | null>(null);
  const navigate = useNavigate(); // Initialize the navigate hook

    useEffect(() => {
      connectWallet();
    }, []);

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
        // fetchBalances(walletId);

        const user = await login(walletId); // Pass true to create user if it doesn't exist
        sessionStorage.setItem("currentUser", JSON.stringify(user)); // Store user in session storage
        // setAccount(walletId);

        // Navigate to the /dash route
        navigate("/dash");
      } else {
        console.log("No accounts found.");
        // setAccount(null);
      }
    } catch (err) {
      console.error("Failed to connect MetaMask:", err);
    }
  };

  return (
    <div className="flex flex-col items-center h-screen">
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h1 className="text-white text-2xl font-bold">Welcome to Dexter City</h1>
        <h2 className="text-white text-md">Start your journey</h2>
        <img src="./logos/dexter.png" className="h-48" alt="dexter icon"></img>
        <button
          onClick={connectWallet}
          disabled={connecting}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
};

export default Home;
