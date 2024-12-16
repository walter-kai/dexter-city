import React, { useEffect, useState } from "react";
import { TelegramBiometric } from "../components/TelegramBiometric";
import Profile from "./Profile";
import { getCurrentUser } from "../services/FirestoreUser";
import { useNavigate } from "react-router-dom";
import User from "../models/User";
import LoadingScreenDots from "../components/LoadingScreenDots";
import OnboardForm from "./OnboardForm";

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
        
        const user = await getCurrentUser(); // Await the result of getCurrentUser()
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
  }, []);

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


  const handleBiometricLogin = () => {
    // Call the function to trigger biometric login
  };

  const handleMetamaskLogin = () => {
    // Logic for Metamask connection
  };

  if(isOnboarding){
    return (
      <OnboardForm onComplete={handleCompleteOnboarding} />
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen animate-fadeIn">
      <h1 className="text-2xl font-bold mb-4">Login with Biometric</h1>
      <Profile />
      {currentUser ? (
        // If user is logged in, this part won't be shown
        <div>Redirecting to dashboard...</div>
      ) : (
        <>
          {/* Biometric login button */}
          <button
            onClick={handleBiometricLogin}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
          >
            Login with Biometrics
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
