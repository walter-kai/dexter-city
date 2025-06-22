import React, { useEffect } from "react";
import { FaChevronCircleUp } from 'react-icons/fa';
import LoadingScreenDots from '../LoadingScreenDots';

interface OfflineNavbarProps {
  navigate: (path: string) => void;
  toggleButtonRef: React.RefObject<HTMLButtonElement>;
  showFooterMenu: boolean;
  setShowFooterMenu: React.Dispatch<React.SetStateAction<boolean>>;
  menuRef: React.RefObject<HTMLDivElement>;
}

const OfflineNavbar: React.FC<OfflineNavbarProps> = ({ navigate, toggleButtonRef, showFooterMenu, setShowFooterMenu, menuRef }) => {
  useEffect(() => {
    if (!showFooterMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (
        (menuRef.current && menuRef.current.contains(e.target as Node)) ||
        (toggleButtonRef.current && toggleButtonRef.current.contains(e.target as Node))
      ) {
        return;
      }
      setShowFooterMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showFooterMenu, menuRef, toggleButtonRef, setShowFooterMenu]);

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full px-4 z-30 flex justify-between items-center gap-6 py-4 bg-black/60 backdrop-blur-md border-t border-[#00ffe7]/20">
        {/* Start Menu Button */}
        <button
          type="button"
          ref={toggleButtonRef}
          className="bottom-6 left-6 z-40 bg-[#23263a] border border-[#00ffe7]/40 rounded-full p-4 shadow-lg hover:bg-[#181a23] transition"
          onClick={e => { e.stopPropagation(); setShowFooterMenu(v => !v); }}
          aria-label="Open Start Menu"
        >
          <FaChevronCircleUp
            className={`text-[#00ffe7] text-2xl transition-transform duration-300 ${showFooterMenu ? 'rotate-0' : 'rotate-90'}`}
          />
        </button>
        <div className='gap-4 flex'>
          <button
            onClick={() => navigate('/x/blog')}
            className="btn-link px-8 py-3 text-lg"
          >
            Blog
          </button>
          <button
            onClick={() => navigate('/x/about')}
            className="btn-link px-8 py-3 text-lg"
          >
            About
          </button>
          <button
            onClick={() => navigate('/x/how-it-works')}
            className="btn-link px-8 py-3 text-lg"
          >
            How this works
          </button>
          <button
            onClick={() => navigate('/x/contact')}
            className="btn-link px-8 py-3 text-lg"
          >
            Contact
          </button>
          <button
            onClick={() => navigate('/x/telegram')}
            className="btn-link px-8 py-3 text-lg"
          >
            Telegram
          </button>
          <button
            onClick={() => navigate('/x/commissions')}
            className="btn-link px-8 py-3 text-lg"
          >
            Commissions
          </button>
        </div>
      </div>
      {/* Drop-up Start Menu Footer */}
      {showFooterMenu && (
        <div ref={menuRef} className="fixed left-6 bottom-24 z-50 w-80 bg-[#181a23]/95 border border-[#00ffe7]/30 rounded-2xl shadow-2xl p-6 animate-fadeInUp">
          <img src="/logos/dexter3d.svg" className="h-10 mb-4" alt="DexterCity" />
          <p className="text-[#e0e7ef] text-sm mb-4">Trading made easy in the city.</p>
          <p className="text-[#e0e7ef] text-sm mb-4">© 2025 Dexter City. All rights reserved.</p>
          
          <div>
            <h3 className="text-[#00ffe7] font-bold mb-2">Documentation</h3>
            <div className="space-y-2">
              <a href="https://docs.dextercity.com/whitepaper" target="_blank" rel="noopener noreferrer" className="flex items-center text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">
                Whitepaper
              </a>
              <button onClick={() => {navigate('/legal/privacy-policy'); setShowFooterMenu(false);}} className="block text-left w-full text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">Privacy Policy</button>
              <button onClick={() => {navigate('/legal/terms-of-service'); setShowFooterMenu(false);}} className="block text-left w-full text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">Terms of Service</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineNavbar;
