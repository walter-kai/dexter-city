import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFileSignature, FaUser, FaStar } from 'react-icons/fa';
import { TelegramUser } from '../models/User';
import { useSDK } from "@metamask/sdk-react";

interface NavBarProps {
  telegramUser: TelegramUser | null;
}

const NavBar: React.FC<NavBarProps> = ({ telegramUser }) => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<string | null>(null);
  const { sdk, connected, connecting, chainId } = useSDK();

  const connect = async () => {
    try {
      const accounts = await sdk?.connect();
      setAccount(accounts?.[0] || null);
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  };

  return (
    <div className="fixed bg-[#fdfdfd] z-20 left-0 w-full top-0 flex py-2 items-center justify-between px-4">
      <div className="flex">
        <button className="btn-nav" type="button" onClick={() => navigate('/profile')}>
          <FaUser className="text-xl" />
        </button>
        <button className="btn-nav" type="button" onClick={() => navigate('/trending')}>
          <FaStar className="text-xl" />
        </button>
        <button className="btn-nav" type="button" onClick={() => navigate('/')}>
          <FaSearch className="text-xl" />
        </button>
        <button className="btn-nav" type="button" onClick={() => navigate('/share')}>
          <FaFileSignature className="text-xl" />
        </button>
      </div>

      <div className="flex items-center space-x-4"> {/* Container for connect button and user info */}
        <button onClick={connect} disabled={connecting} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          {connecting ? "Connecting..." : connected ? "Connected" : "Connect Wallet"}
        </button>
        {telegramUser && telegramUser.id && (
          <span className="text-[#b8ec51e6] font-semibold">{telegramUser.first_name} Connected</span>
        )}
      </div>
    </div>
  );
};

export default NavBar;