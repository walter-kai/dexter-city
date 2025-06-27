import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../providers/AuthContext";
import { useSDK } from "@metamask/sdk-react";
import LoadingScreenDots from "../LoadingScreenDots";
import LoginModal from "../LoginModal";

const EnterCityNavBar: React.FC = () => {
  const navigate = useNavigate();
  const { connecting, connected } = useSDK();
  const { triggerLoginModal } = useAuth();

  const handleEnterClick = () => {
    triggerLoginModal();
  };

  return (
    <nav className="fixed top-12 left-0 w-full z-40 bg-black/80 border-b border-[#00ffe7]/30 flex items-center justify-between px-8 py-3 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-4">
        <img src="/logos/dexter3d.svg" alt="DexterCity" className="h-10 w-auto drop-shadow-[0_0_8px_#00ffe7]" />
        <span className="text-[#faafe8] text-lg font-bold tracking-wide hidden sm:block">
          Trading bots on the Ethereum Blockchain
        </span>
      </div>
      <button
        onClick={handleEnterClick}
        disabled={connecting}
        className="btn-special px-8 py-3 text-lg font-bold"
      >
        {connecting ? <LoadingScreenDots size={4} /> : "Enter the city"}
      </button>
    </nav>
  );
};

export default EnterCityNavBar;
