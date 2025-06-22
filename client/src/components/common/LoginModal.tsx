import React, { useEffect, useState } from "react";
import { useSDK } from "@metamask/sdk-react";
import { login } from "../../hooks/FirestoreUser";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { sdk, connected, connecting } = useSDK();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(false);
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  // Only close modal when we successfully connect AND login
  useEffect(() => {
    // Don't auto-close just because connected state changes
    // Let the connectWallet function handle closing after successful login
  }, [connected]);

  const connectWallet = async () => {
    try {
      
      if (!sdk) {
        console.error("MetaMask SDK not initialized.");
        return;
      }

      console.log("Attempting to connect wallet...");
      const accounts = await sdk.connect();
      
      if (accounts && accounts.length > 0) {
        const walletId = accounts[0];
        console.log("Connected account:", walletId);

        // Call login API
        console.log("Logging in user...");
        const user = await login(walletId);
        console.log("User logged in:", user);
        
        // Set user in context
        setUser(user);

        // Navigate to dashboard
        navigate("/i/dashboard");
        
        // Close modal only after successful login
        onClose();
      } else {
        console.log("No accounts found.");
      }
    } catch (err) {
      console.error("Failed to connect MetaMask:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-[#23263a] w-full max-w-md rounded-lg p-8 relative border border-[#00ffe7]/30 shadow-[0_0_24px_#00ffe7]">
        <button
          onClick={onClose}
          className="absolute z-10 top-4 right-4 bg-[#181a23] p-2 rounded-full hover:bg-[#00ffe7] hover:text-[#181a23] text-[#00ffe7] shadow-[0_0_8px_#00ffe7] transition"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold text-center text-[#00ffe7] mb-6 drop-shadow-[0_0_8px_#00ffe7]">
          Connect Your Wallet
        </h2>
        
        <div className="text-center mb-6">
          <p className="text-[#e0e7ef] mb-4">
            Connect your MetaMask wallet to access DexterCity's trading bots and features.
          </p>
        </div>
        
        <button
          onClick={connectWallet}
          disabled={connecting}
          className="w-full bg-[#00ffe7] text-[#181a23] font-bold py-3 px-6 rounded hover:bg-[#ff005c] hover:text-white shadow-[0_0_8px_#00ffe7] hover:shadow-[0_0_16px_#ff005c] transition disabled:opacity-50"
        >
          {connecting ? "Connecting..." : "Connect MetaMask"}
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-[#e0e7ef] text-sm">
            Don't have MetaMask? 
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#00ffe7] hover:text-[#ff005c] transition ml-1"
            >
              Download here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
