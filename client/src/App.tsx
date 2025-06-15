import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { MetaMaskProvider, useSDK } from '@metamask/sdk-react';
import { AuthProvider } from './contexts/AuthContext';
import { login } from './hooks/FirestoreUser';
import NavBar from './components/common/NavBar';
import Footer from './components/common/Footer';
import SubNavBar from './components/common/SubNavBar';
import Dashboard from './pages/i/Dashboard';
import Shop from './pages/i/Shop';
import Garage from './pages/i/Garage';
import BuildBot from './pages/i/Build';
import Guide from './pages/x/Guide';
import Blog from './pages/x/Blog';
import ContactUs from './pages/x/ContactUs';
import PrivacyPolicy from './pages/x/legal/PrivacyPolicy';
import TermsOfService from './pages/x/legal/TermsOfService';
import NotFound from './pages/NotFound';

import Settings from './pages/i/Settings';
import { BalanceProvider } from './contexts/BalanceProvider';

// Main App component inside MetaMask context
const AppContent: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const { connected, sdk } = useSDK();
  const navigate = useNavigate();
  const location = useLocation();
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

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

  // Preload garage background image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBackgroundLoaded(true);
    img.src = '/bg/i/garage.png';
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
        navigate('/i/dashboard');
      } else {
        console.log('No accounts found.');
      }
    } catch (err) {
      console.error('Failed to connect MetaMask:', err);
    }
  };

  // Handle scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine background image based on current route
  const getBackgroundImage = () => {
    if (location.pathname === '/i/garage' || location.pathname === '/bots') {
      return backgroundLoaded ? "url('/bg/i/garage.png')" : "url('/bg/city.jpg')";
    }
    return "url('/bg/city.jpg')";
  };

  // Calculate parallax transform with bounds
  const getParallaxTransform = (multiplier: number) => {
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const maxScroll = documentHeight - windowHeight;
    
    // Prevent division by zero and ensure we have scrollable content
    if (maxScroll <= 0) return 'translateY(0px)';
    
    // Calculate scroll progress (0 to 1)
    const scrollProgress = Math.min(scrollY / maxScroll, 1);
    
    // Limit transform to a small percentage of viewport height
    const maxTransform = windowHeight * 0.1; // Reduced from 0.3 to 0.1
    const transform = scrollProgress * maxTransform * multiplier;
    
    return `translateY(${transform}px)`;
  };

  return (
    <AuthProvider>
      <BalanceProvider>
        <div className="App min-h-screen relative">
          {/* Background Container with Parallax */}
          <div className="fixed inset-0 z-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
              style={{
                backgroundImage: getBackgroundImage(),
                transform: getParallaxTransform(0.5),
                willChange: 'transform',
                height: '110%', // Slightly larger to accommodate transform
                top: '-5%',
              }}
            />
            <div 
              className="absolute inset-0 bg-gradient-to-br from-neon-cyan via-neon-darker to-neon-purple opacity-90"
              style={{
                transform: getParallaxTransform(0.3),
                willChange: 'transform',
              }}
            />
          </div>
          
          {/* Content Container */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <NavBar telegramUser={user} />
            <SubNavBar />
            
            <main className="flex-1 pt-32">
              <Routes>
                <Route path="/" element={<Guide />} />
                
                {/* Bot-related routes under /bots/ */}
                <Route path="/i/dashboard" element={<Dashboard />} />
                <Route path="/i/garage" element={<Garage />} />
                <Route path="/i/garage/build" element={<BuildBot />} />
                
                {/* Backward compatibility routes */}
                <Route path="/dash" element={<Dashboard />} />
                <Route path="/build" element={<BuildBot />} />
                <Route path="/bots" element={<Garage />} />
                
                {/* Other routes */}
                <Route path="/i/shop" element={<Shop />} />
                <Route path="/i/shop/:botId" element={<Shop />} />
                {/* <Route path="/guide" element={<Guide />} /> */}
                <Route path="/x/blog" element={<Blog />} />
                <Route path="/x/contact" element={<ContactUs />} />
                <Route path="/settings" element={<Settings />} />
                
                {/* Legal routes under /legal/ */}
                <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/legal/terms-of-service" element={<TermsOfService />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </div>
      </BalanceProvider>
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
