import './styles/styles.css';
import React, { createContext, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Trending from './pages/Trending';
import Share from './pages/Share';
import UserGuide from './pages/UserGuide';
import Support from './pages/Support';
import NotFound from './pages/NotFound';
import Quit from './pages/Quit';
import Profile from './pages/Profile';
import OnboardForm from './pages/OnboardForm';
import Dashboard from './pages/Dashboard';
// import { login } from './services/FirestoreUser'; // Import newUser function
import User from "./models/User";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import LoadingScreenDots from './components/LoadingScreenDots';
export const UserContext = createContext<User | null>(null);

const App: React.FC = () => {

  const [isOnboarding, setIsOnboarding] = useState(true);
  const [loading, setLoading] = useState(true); // State for loading user data
  const [error, setError] = useState<string | null>(null); // State for error handling
  const [currentUser, setCurrentUser] = useState<User | null>(null); // State for current user

  // if (loading) {
  //   return <LoadingScreenDots />; // Optional loading state
  // }

  if (error) {
    return <div className="text-red-500">{error}</div>; // Show error message
  }

  return (
    <UserContext.Provider value={currentUser}>
      <div className="mx-auto">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/share" element={<Share />} />
          <Route path="/user-guide" element={<UserGuide />} />
          <Route path="/support" element={<Support />} />
          <Route path="/quit" element={<Quit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </UserContext.Provider>
  );
};

export default App;
