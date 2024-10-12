import './styles/styles.css';
import React, { useEffect, useState } from 'react';
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

const App: React.FC = () => {
  const [telegramUser, setTelegramUser] = useState(defaultTelegramUser);
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [loading, setLoading] = useState(true); // State for loading user data
  const [error, setError] = useState<string | null>(null); // State for error handling

  useEffect(() => {
    async function fetchTelegramUser() {
      setLoading(true); // Set loading state
      try {
        const telegramData = await getTelegram();
        setTelegramUser(telegramData.user);
      } catch (error) {
        console.error("Error fetching Telegram user:", error);
        setError("Failed to fetch Telegram user. Please try again."); // Set error state
      } finally {
        setLoading(false); // Reset loading state
      }
    }

    fetchTelegramUser();
  }, []);
  
  const handleLogin = () => {
    // Add your logic here for handling Telegram login if needed
  };

  const handleCompleteOnboarding = (chosenName: string, favoriteSport: string[]) => {
    console.log("Onboarding complete with name:", chosenName, "and favorite sports:", favoriteSport);
    setIsOnboarding(false);
  };

  if (loading) {
    return <div>Loading...</div>; // Optional loading state
  }

  if (error) {
    return <div className="text-red-500">{error}</div>; // Show error message
  }

  return (
    <div className="mx-auto">
      {isOnboarding ? (
        <OnboardForm 
          telegramName={telegramUser.first_name} 
          onComplete={handleCompleteOnboarding} 
        />
      ) : (
        <>
          <NavBar telegramUser={telegramUser} onLogin={handleLogin} />
          <Routes>
            <Route path="/" element={<Search />} />
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
  );
};

export default App;
