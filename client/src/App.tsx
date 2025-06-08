import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { MetaMaskProvider, useSDK } from '@metamask/sdk-react';
import { AuthProvider } from './contexts/AuthContext';
import { login } from './hooks/FirestoreUser';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import SubNavBar from './components/guide/SubNavBar';
// Import components
// import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import MyBots from './pages/MyBots';
import BuildBot from './pages/Build';
import Guide from './pages/Guide';
import Support from './pages/Support';
import Blog from './pages/Blog';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import NotFound from './pages/NotFound';
import Quit from './pages/Quit';
import TokenPairs from './pages/TokenPairs';

// Main App component inside MetaMask context
const AppContent: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const { connected, sdk } = useSDK();
  const navigate = useNavigate();
  const location = useLocation();

  // Reset scroll position on route change (except for hash navigation)
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser && storedUser !== 'undefined') {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!sdk) {
        console.error('MetaMask SDK not initialized.');
        return;
      }
      const accounts = await sdk.connect();
      if (accounts && accounts.length > 0) {
        const walletId = accounts[0];
        console.log('Connected account:', walletId);

        const user = await login(walletId);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        setUser(user);
        navigate('/bots/dashboard');
      } else {
        console.log('No accounts found.');
      }
    } catch (err) {
      console.error('Failed to connect MetaMask:', err);
    }
  };

  return (
    <AuthProvider>
      <div className="App min-h-screen relative">
        {/* Background Container */}
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('./bg/city.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan via-neon-darker to-neon-purple opacity-90" />
        </div>
        
        {/* Content Container */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <NavBar telegramUser={user} />
          <SubNavBar />
          
          <main className="flex-1 pt-32">
            <Routes>
              <Route path="/" element={<Guide />} />
              
              {/* Bot-related routes under /bots/ */}
              <Route path="/bots/dashboard" element={<Dashboard />} />
              <Route path="/bots/garage" element={<MyBots />} />
              <Route path="/bots/build" element={<BuildBot />} />
              
              {/* Backward compatibility routes */}
              <Route path="/dash" element={<Dashboard />} />
              <Route path="/build" element={<BuildBot />} />
              <Route path="/bots" element={<MyBots />} />
              
              {/* Other routes */}
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:botId" element={<Shop />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/support" element={<Support />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/tokens" element={<TokenPairs />} />
              <Route path="/quit" element={<Quit />} />
              
              {/* Legal routes under /legal/ */}
              <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/legal/terms-of-service" element={<TermsOfService />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </div>
    </AuthProvider>
  );
};

// Root App component with MetaMaskProvider
const App: React.FC = () => {
  return (
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "DexterCity",
          url: window.location.href,
        },
        // infuraAPIKey: process.env.REACT_APP_INFURA_API_KEY,
      }}
    >
      <AppContent />
    </MetaMaskProvider>
  );
};

export default App;
