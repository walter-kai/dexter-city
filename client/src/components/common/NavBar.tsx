import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSDK } from "@metamask/sdk-react";
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../LoginModal';
import { FaChevronDown, FaSignOutAlt, FaTachometerAlt, FaShoppingCart, FaTools, FaCog, FaPlus, FaNewspaper, FaRocket, FaBolt, FaEnvelope } from 'react-icons/fa';
import { SiEthereum } from 'react-icons/si';
import { formatLargeNumberEth } from '../../utils/formatEthNumber';

interface NavBarProps {
  telegramUser: any;
}

const NavBar: React.FC<NavBarProps> = ({ telegramUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [balances, setBalances] = useState<{ balance: string; currency: string; usdValue?: string }[]>([]);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const { sdk, connected, connecting } = useSDK();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();

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

  // Fetch ETH price
  const fetchEthPrice = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await res.json();
      if (data.ethereum && data.ethereum.usd) {
        setEthPrice(data.ethereum.usd);
      }
    } catch (err) {
      console.error('Error fetching ETH price:', err);
    }
  };

  // Fetch balances when user is available
  useEffect(() => {
    if (user && user.walletId && connected && sdk) {
      fetchBalances(user.walletId);
      fetchEthPrice();
    }
  }, [user, connected, sdk]);

  const fetchBalances = async (walletId: string) => {
    try {
      const provider = sdk?.getProvider();
      if (!provider) {
        console.error("Ethereum provider not available.");
        return;
      }

      // Verify wallet connection first
      const accounts = await provider.request({ method: "eth_accounts" }) as string[];
      if (!accounts || accounts.length === 0) {
        console.error("No connected accounts found.");
        return;
      }

      const ethBalance = await provider.request({
        method: "eth_getBalance",
        params: [walletId, "latest"],
      }) as string;

      const ethBalanceInEth = parseFloat((parseInt(ethBalance, 16) / 1e18).toFixed(4));
      const usdValue = ethPrice ? (ethBalanceInEth * ethPrice).toFixed(2) : undefined;
      
      setBalances([{ 
        balance: ethBalanceInEth.toString(), 
        currency: "ETH",
        usdValue 
      }]);
      console.log("Balance fetched successfully:", ethBalanceInEth, "ETH");
    } catch (err) {
      console.error("Error fetching balances:", err);
      console.error("WalletId used:", walletId);
      console.error("Provider available:", !!sdk?.getProvider());
    }
  };

  const disconnectWallet = () => {
    sdk?.disconnect();
    setBalances([]);
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
        { text: 'DASHBOARD', to: '/bots/dashboard', icon: <FaTachometerAlt /> },
        { text: 'SHOP', to: '/shop', icon: <FaShoppingCart /> },
        { text: 'GARAGE', to: '/garage', icon: <FaTools /> },
        { text: 'BUILD BOT', to: '/garage/build', icon: <FaPlus /> },
        { text: 'SETTINGS', to: '/settings', icon: <FaCog /> },
        { text: 'SEPARATOR' }, // Special separator item
        { text: 'BLOG', to: '/blog', icon: <FaNewspaper /> },
        { text: 'GET STARTED', to: '/#getting-started', icon: <FaRocket /> },
        { text: 'FEATURES', to: '/#features', icon: <FaBolt /> },
        { text: 'CONTACT US', to: '/contact', icon: <FaEnvelope /> },
      ];
    }
    
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <>
      <div className="fixed z-20 left-0 w-full top-0 flex py-2 items-center justify-between px-4
        bg-[#181a23] border-b border-[#faafe8] shadow-[0_2px_24px_0_#faafe8] backdrop-blur-md
      ">
        {/* Left section - Title */}
        <div className="flex items-center">
          <button className="" type="button" onClick={() => handleNavigation('/')}>
            <span className="text-2xl font-bold text-[#00ffe7] drop-shadow-[0_0_8px_#00ffe7] tracking-widest">
              DexterCity
            </span>
          </button>
        </div>
        
        {/* Right section - Logo/Profile Dropdown */}
        <div className="flex items-center space-x-4">
          {connected && user ? (
            <div className="relative z-50 dropdown-container">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-[#23263a] hover:bg-[#00ffe7]/20 text-[#00ffe7] font-bold py-2 px-3 rounded border border-[#00ffe7]/40 transition-all duration-200"
              >
                <img src="/logos/dexter.png" className="h-6 drop-shadow-[0_0_8px_#00ffe7]" alt="Profile" />
                {balances.length > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    {(() => {
                      const formatted = formatLargeNumberEth(balances[0].balance);
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
                          {balances[0].usdValue && (
                            <span className="text-[#b8eaff] text-[10px]">${balances[0].usdValue}</span>
                          )}
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
              <img src="/logos/dexter.png" className="h-8 drop-shadow-[0_0_8px_#00ffe7]" alt="DexterCity" />
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

