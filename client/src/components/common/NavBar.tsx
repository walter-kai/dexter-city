import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSDK } from "@metamask/sdk-react";
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../LoginModal';

interface NavBarProps {
  telegramUser: any;
}

const NavBar: React.FC<NavBarProps> = ({ telegramUser }) => {
  const navigate = useNavigate();
  const [balances, setBalances] = useState<{ balance: string; currency: string }[]>([]);
  const { sdk, connected, connecting } = useSDK();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, logout } = useAuth();

  const fetchBalances = async (walletId: string) => {
    try {
      const provider = sdk?.getProvider();
      if (!provider) {
        console.error("Ethereum provider not available.");
        return;
      }

      const ethBalance = await provider.request({
        method: "eth_getBalance",
        params: [walletId, "latest"],
      }) as string;

      const ethBalanceInEth = parseFloat((parseInt(ethBalance, 16) / 1e18).toFixed(4));
      setBalances([{ balance: ethBalanceInEth.toString(), currency: "ETH" }]);
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  };

  const disconnectWallet = () => {
    sdk?.disconnect();
    setBalances([]);
    logout();
    console.log("Wallet disconnected");
    navigate('/');
  };

  const truncateAddress = (address: string) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}`: "";
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  const handleNavigation = (path: string) => {
    // Reset scroll position for route changes (not hash links)
    if (!path.startsWith('#')) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    navigate(path);
  };

  return (
    <>
      <div className="fixed z-20 left-0 w-full top-0 flex py-2 items-center justify-between px-4
        bg-[#181a23] border-b border-[#faafe8] shadow-[0_2px_24px_0_#faafe8] backdrop-blur-md
      ">
        {/* Left section */}
        <div className="flex">
          <button className="" type="button" onClick={() => handleNavigation('/')}>
            <img src="/logos/dexter.png" className="h-10 -my-4 drop-shadow-[0_0_8px_#00ffe7]" alt="DexterCity" />
          </button>
        </div>
        
        {/* Centered title using absolute positioning */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none w-max">
          <span className="text-2xl font-bold text-[#00ffe7] drop-shadow-[0_0_8px_#00ffe7] tracking-widest">
            DexterCity
          </span>
        </div>
        
        {/* Right section */}
        <div className="flex items-center space-x-4">
          {connected && user ? (
            <div className="flex items-center space-x-4">
              {/* <button
                onClick={() => navigate('/bots/dashboard')}
                className="bg-[#00ffe7] hover:bg-[#00ccb8] text-[#181a23] font-bold py-2 px-4 rounded shadow-[0_0_8px_#00ffe7] transition"
              >
                Dashboard
              </button> */}
              <button
                onClick={disconnectWallet}
                className="bg-[#ff005c] hover:bg-[#ff3380] text-white font-bold py-2 px-4 rounded shadow-[0_0_8px_#ff005c] transition"
              >
                Log Out
              </button>
              <span className="text-[#00ffe7] font-bold drop-shadow-[0_0_4px_#00ffe7]">
                {truncateAddress(user.walletId)}
              </span>
            </div>
          ) : (
            <button
              onClick={handleLoginClick}
              disabled={connecting}
              className="bg-[#00ffe7] text-[#181a23] font-bold py-2 px-4 rounded hover:bg-[#ff005c] hover:text-white shadow-[0_0_8px_#00ffe7] hover:shadow-[0_0_16px_#ff005c] transition disabled:opacity-50"
            >
              {connecting ? "Connecting..." : "Login"}
            </button>
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

