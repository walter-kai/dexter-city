import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFileSignature, FaUser, FaStar, FaHome } from 'react-icons/fa';
import User, { TelegramUser } from '../models/User';
import { useSDK } from "@metamask/sdk-react";
import { login } from '../hooks/FirestoreUser';

interface NavBarProps {
  telegramUser: TelegramUser | null;
}

const NavBar: React.FC<NavBarProps> = ({ telegramUser }) => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<string | null>(null);
  const [balances, setBalances] = useState<{ balance: string; currency: string }[]>([]);
  const { sdk, connected, connecting } = useSDK();
  // const [updatedUser, setUpdatedUser] = useState<TelegramUser | null>(null);
  const [updateUserError, setUpdateUserError] = useState<string | null>(null);

  const fetchBalances = async (walletId: string) => {
    try {
      const provider = sdk?.getProvider();
      if (!provider) {
        console.error("Ethereum provider not available.");
        return;
      }

      // Fetch ETH balance
      const ethBalance = await provider.request({
        method: "eth_getBalance",
        params: [walletId, "latest"],
      })as string;

      // Convert balance from wei to ETH
      const ethBalanceInEth = parseFloat((parseInt(ethBalance, 16) / 1e18).toFixed(4));
      setBalances([{ balance: ethBalanceInEth.toString(), currency: "ETH" }]);

      // You can add support for fetching token balances (ERC-20) here if needed.
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  };


  const disconnectWallet = () => {
    sdk?.disconnect();
    // updateUserWalletId(null);
    setAccount(null);
    setBalances([]);
    console.log("Wallet disconnected");
    navigate('/');
  };

  const truncateAddress = (address: string) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}`: "";
  };

  return (
    <div className="fixed z-20 left-0 w-full top-0 flex py-2 items-center justify-between px-4
      bg-[#181a23] border-b border-[#faafe8] shadow-[0_2px_24px_0_#faafe8] backdrop-blur-md
    ">
      {/* Left section */}
      <div className="flex">
      <button className="" type="button" onClick={() => navigate('/dash')}>
        <img src="logos/dexter.png" className="h-10 -my-4 drop-shadow-[0_0_8px_#00ffe7]" alt="DexterCity" />
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
      <div className="flex items-center space-x-4">
        <button
        onClick={disconnectWallet}
        className="bg-[#ff005c] hover:bg-[#ff3380] text-white font-bold py-2 px-4 rounded shadow-[0_0_8px_#ff005c] transition"
        >
        Disconnect
        </button>
        <span className="text-[#00ffe7] font-bold drop-shadow-[0_0_4px_#00ffe7]">
        {truncateAddress(account!)}
        </span>
      </div>
      {/* {balances.length > 0 && (
        <div className="text-green-500 font-semibold">
        {balances.map((balance, index) => (
          <div key={index}>
          {balance.balance} {balance.currency}
          </div>
        ))}
        </div>
      )} */}
      {updateUserError && (
        <span className="text-red-500 font-semibold">Error: {updateUserError}</span>
      )}
      </div>
    </div>
  );
};

export default NavBar;
function setCurrentUser(user: User) {
  throw new Error('Function not implemented.');
}

