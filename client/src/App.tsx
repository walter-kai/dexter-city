import './styles/styles.css';
import React, { createContext, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Search from './pages/Search';
import Trending from './pages/Trending';
import Share from './pages/Share';
import UserGuide from './pages/UserGuide';
import Support from './pages/Support';
import NotFound from './pages/NotFound';
import Quit from './pages/Quit';
import Profile from './pages/Profile';
import NavBar from './components/NavBar';
import OnboardForm from './pages/OnboardForm';
import { getTelegram, defaultTelegramUser } from './services/Telegram';
import Dashboard from './pages/Dashboard';
import { login } from './services/user'; // Import newUser function
import User from "./models/User";

export const UserContext = createContext<User | null>(null);

const App: React.FC = () => {
  const [telegramUser, setTelegramUser] = useState(defaultTelegramUser);
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [loading, setLoading] = useState(true); // State for loading user data
  const [error, setError] = useState<string | null>(null); // State for error handling
  const [currentUser, setCurrentUser] = useState<User | null>(null); // State for current user

  useEffect(() => {
    async function fetchTelegramUser() {
      setLoading(true); // Set loading state
      try {
        const telegramData = await getTelegram();
        setTelegramUser(telegramData.user);
        
        // Try to get the current user using their Telegram ID
        const user = await login(); // Pass true to create user if it doesn't exist

        setCurrentUser(user); // Set the current user state
      } catch (error) {
        console.error("Error fetching Telegram user:", error);
        setError("Failed to fetch Telegram user. Please try again."); // Set error state
      } finally {
        setLoading(false); // Reset loading state
      }
    }
  
    fetchTelegramUser();
  }, []);
  

  const handleLogin = async () => {
// leave this blank
  };

  const handleCompleteOnboarding = (chosenName: string, favoriteSport: string[]) => {
    console.log("Onboarding complete with name:", chosenName, "and favorite sports:", favoriteSport);
    setIsOnboarding(false); // Update the onboarding state
  };

  if (loading) {
    return <div>Loading...</div>; // Optional loading state
  }

  if (error) {
    return <div className="text-red-500">{error}</div>; // Show error message
  }

  return (
    <UserContext.Provider value={currentUser}>
      <div className="mx-auto">
        {isOnboarding ? (
          <OnboardForm 
            telegramName={currentUser?.firstname || ''} 
            onComplete={handleCompleteOnboarding} 
          />
        ) : (
          <>
            <NavBar telegramUser={telegramUser} onLogin={handleLogin} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/share" element={<Share />} />
              <Route path="/user-guide" element={<UserGuide />} />
              <Route path="/support" element={<Support />} />
              <Route path="/quit" element={<Quit />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </>
        )}
      </div>
    </UserContext.Provider>
  );
};

export default App;
