import React, { useEffect, useState } from "react";
import { TelegramBiometric } from "../components/TelegramBiometric";
import Profile from "./Profile";
import { getTelegramUser, getWalletUser } from "../services/FirestoreUser";
import { useNavigate } from "react-router-dom";
import User from "../models/User";
import LoadingScreenDots from "../components/LoadingScreenDots";
import OnboardForm from "./OnboardForm";

declare global {
  interface Window {
    ethereum: any; // Declare the ethereum property
  }
}


const Login: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null); // State to store user information
  const navigate = useNavigate(); // Initialize the navigate function
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [loading, setLoading] = useState(true); // State for loading user data
  const [error, setError] = useState<string | null>(null); // State for error handling


  useEffect(() => {
    async function fetchTelegramUser() {
      setLoading(true); // Set loading state
      try {
        // Try to get the current user using their Telegram ID
        
        const user = await getTelegramUser(); // Await the result of getCurrentUser()
        if (user) {
          // If a user is logged in, navigate to the dashboard
          sessionStorage.setItem('currentUser', JSON.stringify(user)); 
          setCurrentUser(user); // Set the current user state
          setIsOnboarding(false);
          navigate("/dash");
        }
        
        // Store the user in sessionStorage
      } catch (error) {
        console.error("Error fetching Telegram user:", error);
        setError("Failed to fetch Telegram user. Please try again."); // Set error state
      } finally {
        setLoading(false); // Reset loading state
      }
    }

    // Check if user exists in sessionStorage
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser)); // Set the stored user from sessionStorage
      setIsOnboarding(false); // Skip onboarding if user exists
      setLoading(false); // Set loading to false
    } else {
      fetchTelegramUser(); // Fetch user if not found in sessionStorage
    }
  }, [navigate]);

  const handleCompleteOnboarding = (chosenName: string, favoriteSport: string[]) => {
    console.log("Onboarding complete with name:", chosenName, "and favorite sports:", favoriteSport);
    setIsOnboarding(false); // Update the onboarding state
  };

  if (loading) {
    return <LoadingScreenDots />; // Optional loading state
  }

  if (error) {
    return <div className="text-red-500">{error}</div>; // Show error message
  }


  const handleHowitworks = () => {
    // Call the function to trigger biometric login
    navigate('/howitworks')
  };

  const handleMetamaskLogin = async () => {
    if (window.ethereum) {
      try {
        // Request the user to connect their wallet
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts"
        });
        if (accounts && accounts.length > 0) {
          // If accounts are returned, store the wallet address and navigate
          const walletId = accounts[0];
          sessionStorage.setItem("walletId", walletId);
          // Optionally, store the user's walletId in your backend or update the user state
          setCurrentUser({ walletId } as User); // Assuming the User model has a walletId property
          navigate("/dash"); // Navigate to the dashboard after successful login
        } else {
          setError("No wallet accounts found.");
        }
      } catch (error) {
        console.error("Error connecting to Metamask:", error);
        setError("Failed to connect to Metamask. Please try again.");
      }
    } else {
      setError("Metamask is not installed.");
    }
  };

  if(isOnboarding){
    return (
      <OnboardForm onComplete={handleCompleteOnboarding} />
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen animate-fadeIn">
      {currentUser ? (
        // If user is logged in, this part won't be shown
        <div>Redirecting to dashboard...</div>
      ) : (
        <>
          {/* Biometric login button */}
          <button
            onClick={handleHowitworks}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
          >
            How it works
          </button>
          <div className="mt-4">
            {/* Metamask login button */}
            <button
              onClick={handleMetamaskLogin}
              className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-700 transition duration-300"
            >
              Connect with Metamask
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Login;
