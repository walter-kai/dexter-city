import React, { useState, useEffect } from "react";
import { useAuth } from "../../../providers/AuthContext";
import { useSDK } from "@metamask/sdk-react";
import LoadingScreenDots from "../LoadingScreenDots";

const EnterCityNavBar: React.FC = () => {
  const [isTriggering, setIsTriggering] = useState(false);

  const { connecting, connected } = useSDK();
  const { triggerLoginModal } = useAuth();

  useEffect(() => {
    if (connected && isTriggering) {
      setIsTriggering(false);
    }
  }, [connected, isTriggering]);

  useEffect(() => {
    if (isTriggering) {
      // Reset after 10 seconds if still triggering (modal closed manually)
      const timeout = setTimeout(() => {
        setIsTriggering(false);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [isTriggering]);

  useEffect(() => {
    // Reset when connecting goes from true to false (connection attempt ended)
    if (!connecting && isTriggering) {
      setIsTriggering(false);
    }
  }, [connecting, isTriggering]);

  const handleEnterClick = () => {
    setIsTriggering(true);
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
        {isTriggering ? <LoadingScreenDots size={4} /> : "Enter the city"}
      </button>
    </nav>
  );
};

export default EnterCityNavBar;
