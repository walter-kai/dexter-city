import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSDK } from "@metamask/sdk-react";
import { useAuth } from '../../contexts/AuthContext';
import { useBalances } from '../../contexts/BalanceProvider';
import LoginModal from './LoginModal';
import NeonText from './NeonText';
import { FaChevronDown, FaSignOutAlt, FaTachometerAlt, FaShoppingCart, FaTools, FaCog, FaPlus, FaNewspaper, FaRocket, FaBolt, FaEnvelope, FaChartLine, FaChevronLeft } from 'react-icons/fa';
import { SiEthereum } from 'react-icons/si';
import { formatLargeNumberEth } from '../../utils/formatEthNumber';
import { FaCity } from 'react-icons/fa6';

interface NavBarProps {
  telegramUser: any;
}

const featureSections = [
  { id: 'bot-shop', title: 'Bot Shop Marketplace', icon: <FaShoppingCart /> },
  { id: 'bot-garage', title: 'Bot Garage Workshop', icon: <FaTools /> },
  { id: 'analytics', title: 'Advanced Analytics', icon: <FaChartLine /> },
];

const NavBar: React.FC<NavBarProps> = ({ telegramUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sdk, connected, connecting } = useSDK();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFeaturesSubDropdown, setShowFeaturesSubDropdown] = useState(false);
  const { user, logout } = useAuth();
  const { balances, ethPrice } = useBalances();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDropdown && !target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const disconnectWallet = () => {
    sdk?.disconnect();
    logout();
    setShowDropdown(false);
    console.log("Wallet disconnected");
    navigate('/');
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  const handleNavigation = (path: string) => {
    if (!path.startsWith('#')) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    setShowDropdown(false);
    navigate(path);
  };

  // Get navigation options based on authentication status
  const getNavLinks = () => {
    // Only show app navigation links if user is logged in
    if (connected && user) {
      return [
        { text: 'DASHBOARD', to: '/i/dashboard', icon: <FaTachometerAlt /> },
        { text: 'SHOP', to: '/i/shop', icon: <FaShoppingCart /> },
        { text: 'GARAGE', to: '/i/garage', icon: <FaTools /> },
        { text: 'BUILD BOT', to: '/i/garage/build', icon: <FaPlus /> },
        { text: 'SETTINGS', to: '/settings', icon: <FaCog /> },
        { text: 'SEPARATOR' }, // Special separator item
        { text: 'BLOG', to: '/x/blog', icon: <FaNewspaper /> },
        { text: 'GET STARTED', to: '/#getting-started', icon: <FaRocket /> },
        { text: 'FEATURES', to: '/#features', icon: <FaBolt /> },
        { text: 'CONTACT US', to: '/x/contact', icon: <FaEnvelope /> },
      ];
    }
    
    return [];
  };

  const navLinks = getNavLinks();
  
  // Check if we're on an /i/ route
  const isOnAppRoute = location.pathname.startsWith('/i/');

  // Add handler for feature click (scroll or navigate)
  const handleFeatureClick = (featureId: string) => {
    setShowDropdown(false);
    setShowFeaturesSubDropdown(false);
    // Same logic as SubNavBar
    if (location.pathname === '/') {
      setTimeout(() => {
        const element = document.getElementById(featureId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const elementTop = rect.top + scrollTop;
          const offsetTop = elementTop - 180;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        } else {
          const featuresSection = document.getElementById('features');
          if (featuresSection) {
            const rect = featuresSection.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const elementTop = rect.top + scrollTop;
            const offsetTop = elementTop - 150;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
        }
      }, 150);
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(featureId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const elementTop = rect.top + scrollTop;
          const offsetTop = elementTop - 180;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        } else {
          const featuresSection = document.getElementById('features');
          if (featuresSection) {
            const rect = featuresSection.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const elementTop = rect.top + scrollTop;
            const offsetTop = elementTop - 150;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
        }
      }, 1000);
    }
  };

  return (
    <>
      <div className="fixed z-20 left-0 w-full top-0 flex py-2 items-center justify-between px-4
        bg-[#181a23] border-b border-[#faafe8] shadow-[0_2px_24px_0_#faafe8] backdrop-blur-md
      ">
        {/* Left section - Title */}
        <div className="flex items-center">
          <button className="" type="button" onClick={() => handleNavigation('/')}>
            <NeonText 
              className="text-2xl tracking-widest font-savate"
              intensity="high"
              
            >
              DexterCity
            </NeonText>
          </button>
        </div>
        
        {/* Right section - Logo/Profile Dropdown */}
        <div className="flex items-center space-x-4">
          {/* Dashboard button for non-/i/ routes when user is connected */}
          {connected && user && !isOnAppRoute && (
            <button
              onClick={() => handleNavigation('/i/dashboard')}
              className="bg-[#00ffe7]/10 hover:bg-[#00ffe7]/20 text-[#00ffe7] py-1 px-4 rounded border border-[#00ffe7]/40 transition-all duration-200 flex items-center gap-2"
            >
              <FaCity className="text-sm" />
              <span>Enter the city</span>
            </button>
          )}
          
          {connected && user ? (
            <div className="relative z-50 dropdown-container">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-[#23263a] hover:bg-[#00ffe7]/20 text-[#00ffe7] font-bold py-2 px-3 rounded border border-[#00ffe7]/40 transition-all duration-200"
              >
                <img src="/logos/dexter.svg" className="h-4 drop-shadow-[0_0_8px_#00ffe7]" alt="Profile" />
                {balances.length > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    {(() => {
                      const ethBalance = balances.find(b => b.symbol === "ETH");
                      if (!ethBalance) return null;
                      
                      const formatted = formatLargeNumberEth(ethBalance.balance);
                      return (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1">
                            {formatted.hasSubscript && formatted.subscriptParts ? (
                              <span className="font-mono">
                                {formatted.subscriptParts.before}
                                <sub className="text-[8px]">{formatted.subscriptParts.subscript}</sub>
                                {formatted.subscriptParts.after}
                              </span>
                            ) : (
                              <span className="font-mono">{formatted.formatted}</span>
                            )}
                            <SiEthereum className="w-3 h-3 text-[#627eea]" />
                          </div>
                          {/* {ethBalance.usdValue && (
                            <span className="text-[#b8eaff] text-[10px]">${ethBalance.usdValue}</span>
                          )} */}
                        </div>
                      );
                    })()}
                  </div>
                )}
                <FaChevronDown className={`text-xs transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#23263a] border border-[#00ffe7]/30 rounded-lg shadow-lg z-[200]">
                  <div className="py-2">
                    {/* Navigation Links */}
                    {navLinks.map((link, index) => (
                      link.text === 'SEPARATOR' ? (
                        <div key={index} className="border-t border-[#00ffe7]/20 my-2"></div>
                      ) : link.text === 'FEATURES' ? (
                        <div
                          key={index}
                          className="relative group"
                          onMouseEnter={() => setShowFeaturesSubDropdown(true)}
                          onMouseLeave={() => setShowFeaturesSubDropdown(false)}
                        >
                          <button
                            onClick={() => setShowFeaturesSubDropdown((v) => !v)}
                            className={`w-full px-4 py-3 text-left hover:bg-[#00ffe7]/20 transition-colors duration-200 flex items-center gap-3 ${
                              location.pathname === '/#features' ? 'bg-[#00ffe7]/10 text-[#00ffe7]' : 'text-[#e0e7ef]'
                            }`}
                            type="button"
                          >
                            <div className="text-[#00ffe7] text-sm">
                              <FaBolt />
                            </div>
                            <span className="font-medium text-sm">FEATURES</span>
                            <FaChevronLeft className={`ml-auto text-xs transition-transform duration-200 ${showFeaturesSubDropdown ? '-rotate-90' : ''}`} />
                          </button>
                          {/* Subdropdown */}
                          <div
                            className={`absolute top-0 right-full mr-2 w-72 bg-[#23263a] border border-[#00ffe7]/30 rounded-lg shadow-lg transition-all duration-300 z-[201]
                              ${showFeaturesSubDropdown ? 'opacity-100 translate-x-0 visible' : 'opacity-0 -translate-x-2 invisible'}
                            `}
                            style={{ minWidth: '18rem' }}
                          >
                            <div className="py-2">
                              <div className="px-4 py-2 border-b border-[#00ffe7]/20">
                                <span className="text-[#00ffe7] font-semibold text-xs uppercase tracking-wider">
                                  Platform Features
                                </span>
                              </div>
                              {featureSections.map((feature) => (
                                <button
                                  key={feature.id}
                                  onClick={() => handleFeatureClick(feature.id)}
                                  className="w-full px-4 py-3 text-left hover:bg-[#00ffe7]/20 transition-colors duration-200 flex items-center gap-3"
                                >
                                  <div className="text-[#00ffe7] text-lg">
                                    {feature.icon}
                                  </div>
                                  <span className="text-[#e0e7ef] font-medium">
                                    {feature.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          key={index}
                          onClick={() => handleNavigation(link.to ?? '')}
                          className={`w-full px-4 py-3 text-left hover:bg-[#00ffe7]/20 transition-colors duration-200 flex items-center gap-3 ${
                            location.pathname === link.to ? 'bg-[#00ffe7]/10 text-[#00ffe7]' : 'text-[#e0e7ef]'
                          }`}
                        >
                          <div className="text-[#00ffe7] text-sm">
                            {link.icon}
                          </div>
                          <span className="font-medium text-sm">{link.text}</span>
                        </button>
                      )
                    ))}
                    
                    {navLinks.length > 0 && (
                      <div className="border-t border-[#00ffe7]/20 my-2"></div>
                    )}
                    
                    {/* Logout Button */}
                    <button
                      onClick={disconnectWallet}
                      className="w-full px-4 py-3 text-left hover:bg-[#ff005c]/20 transition-colors duration-200 flex items-center gap-3 text-[#ff005c]"
                    >
                      <FaSignOutAlt />
                      <span className="font-medium">Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <img src="/logos/dexter.svg" className="h-4 drop-shadow-[0_0_8px_#00ffe7]" alt="DexterCity" />
              <button
                onClick={handleLoginClick}
                disabled={connecting}
                className="bg-[#00ffe7] text-[#181a23] font-bold py-2 px-4 rounded hover:bg-[#ff005c] hover:text-white shadow-[0_0_8px_#00ffe7] hover:shadow-[0_0_16px_#ff005c] transition disabled:opacity-50"
              >
                {connecting ? "Connecting..." : "Login"}
              </button>
            </div>
          )}
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={handleCloseModal} 
      />
    </>
  );
};

export default NavBar;

