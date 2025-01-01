import React, { useState, useEffect } from 'react';
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
  const [balances, setBalances] = useState<{ balance: string; currency: string }[]>([]);
  const { sdk, connected, connecting } = useSDK();
  const [updatedUser, setUpdatedUser] = useState<TelegramUser | null>(null);
  const [updateUserError, setUpdateUserError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      if (!sdk) {
        console.error("MetaMask SDK not initialized.");
        return;
      }
      const accounts = await sdk.connect();
      if (accounts && accounts.length > 0) {
        const walletId = accounts[0];
        console.log("Connected account:", walletId);
        setAccount(walletId);
        fetchBalances(walletId);

        if (telegramUser) {
          await updateUserWalletId(walletId);
        }
      } else {
        console.log("No accounts found.");
        setAccount(null);
      }
    } catch (err) {
      console.error("Failed to connect MetaMask:", err);
    }
  };

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
    updateUserWalletId(null);
    setAccount(null);
    setBalances([]);
    console.log("Wallet disconnected");
  };

  const updateUserWalletId = async (walletId: string | null) => {
    if (telegramUser) {
      try {
        const userDataToUpdate = {
          ...telegramUser,
          lastLoggedIn: new Date().toISOString(),
          walletId,
        };

        const response = await fetch('/api/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userDataToUpdate),
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData?.message || `Update failed with status ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setUpdatedUser(data.user);
        setUpdateUserError(null);
      } catch (error: any) {
        console.error("Error updating user:", error);
        setUpdateUserError(error.message);
      }
    }
  };

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        fetchBalances(accounts[0]);
      }
    };

    sdk?.on("accountsChanged" as any, handleAccountsChanged);

    return () => {
      sdk?.off("accountsChanged" as any, handleAccountsChanged);
    };
  }, [sdk]);



  const truncateAddress = (address: string) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}`: "";
  };

  return (
    <div className="fixed bg-transparent z-20 left-0 w-full top-0 flex py-2 items-center justify-between px-4">
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
      <div className="flex items-center space-x-4">
        {!connected ? (
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>

        ) : (
          <div className="flex items-center space-x-4">
            <button
              onClick={disconnectWallet}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Disconnect
            </button>
            <span className="text-blue-600 font-bold">
              {truncateAddress(account!)}
            </span>
          </div>
        )}
        {balances.length > 0 && (
          <div className="text-green-500 font-semibold">
            {balances.map((balance, index) => (
              <div key={index}>
                {balance.balance} {balance.currency}
              </div>
            ))}
          </div>
        )}
        {updateUserError && (
          <span className="text-red-500 font-semibold">Error: {updateUserError}</span>
        )}
      </div>
    </div>
  );
};

export default NavBar;
