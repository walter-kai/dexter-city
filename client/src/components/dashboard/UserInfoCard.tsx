import React from 'react';
import { SiEthereum } from 'react-icons/si';
import LoadingScreenDots from '../common/LoadingScreenDots';
import { useBalances } from '../../contexts/BalanceProvider';
import { formatLargeNumberEth } from '../../utils/formatEthNumber';
import User from '../../models/User';

interface UserInfoCardProps {
  user: User | null;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user }) => {
  const { balances, balancesLoaded, showLoadingTooltip, refreshBalances } = useBalances();

  const timeSince = (date: string | Date) => {
    const now = new Date();
    const lastLogin = typeof date === "string" ? new Date(date) : date;
    const seconds = Math.floor((now.getTime() - lastLogin.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-[#181a23]/80 border-4 border-[#00ffe7]/40 rounded-2xl shadow-[0_0_32px_#00ffe7] p-6">
        <div className="flex items-center gap-4 mb-4">
          <img src={user?.photoUrl || undefined} className="h-16 w-16 rounded-full border-2 border-[#00ffe7]/40" alt="your icon" />
          <div>
            <div className="text-xl font-bold text-[#00ffe7]">Your Information</div>
            <div className="text-xs text-[#b8eaff]">Wallet: <span className="font-mono">{user?.walletId?.slice(0, 6)}...{user?.walletId?.slice(-4)}</span></div>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-[#e0e7ef]"><strong className="text-[#00ffe7]">Handle:</strong> {user?.telegramHandle || "Not set"}</p>
          <p className="text-[#e0e7ef]"><strong className="text-[#00ffe7]">Name:</strong> {user?.firstName}</p>
          <p className="text-[#e0e7ef]"><strong className="text-[#00ffe7]">Last Login:</strong> {user?.lastLoggedIn ? timeSince(user.lastLoggedIn) : "Unknown"}</p>
        </div>

        <div className="mb-4">
          <strong className="text-[#00ffe7]">Balances:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {!balancesLoaded
              ? (
                <div className="relative flex items-center mx-auto">
                  <LoadingScreenDots size={3} />
                  {showLoadingTooltip && (
                    <div className="absolute left-full ml-4 bg-[#23263a] border-2 border-[#faafe8]/40 rounded-lg p-3 shadow-[0_0_16px_#faafe8] z-10 min-w-[280px] animate-fadeIn">
                      <div className="text-[#faafe8] text-sm font-bold mb-2">
                        ⏱️ Taking longer than expected...
                      </div>
                      <div className="text-[#e0e7ef] text-xs">
                        If you logged in with <strong className="text-[#ff005c]">MetaMask Mobile</strong>, 
                        please open the MetaMask app to refresh the balance.
                      </div>
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
                        <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-r-[8px] border-t-transparent border-b-transparent border-r-[#faafe8]/40"></div>
                      </div>
                    </div>
                  )}
                </div>
              )
              : balances.length === 0
                ? <span className="text-[#faafe8]">No balances found</span>
                : balances.map((bal, idx) => {
                    const formatted = formatLargeNumberEth(bal.balance);
                    
                    return (
                      <span key={idx} className="bg-[#23263a] border border-[#00ffe7]/30 rounded px-3 py-1 text-[#00ffe7] text-sm flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {formatted.hasSubscript && formatted.subscriptParts ? (
                            <span className="font-mono">
                              {formatted.subscriptParts.before}
                              <sub className="text-[10px]">{formatted.subscriptParts.subscript}</sub>
                              {formatted.subscriptParts.after}
                            </span>
                          ) : (
                            <span className="font-mono">{formatted.formatted}</span>
                          )}
                          {bal.symbol === "ETH" ? (
                            <SiEthereum className="w-4 h-4 text-[#627eea]" />
                          ) : (
                            <span className="font-bold">{bal.symbol}</span>
                          )}
                        </div>
                        {bal.usdValue && (
                          <span className="text-[#b8eaff] text-xs">
                            (${bal.usdValue})
                          </span>
                        )}
                      </span>
                    );
                  })
            }
          </div>
        </div>

        <button
          className="w-full btn-hud"
          onClick={refreshBalances}
        >
          Refresh Balances
        </button>
      </div>
    </div>
  );
};

export default UserInfoCard;
