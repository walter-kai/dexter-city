import React, { useState } from 'react';
import { SiEthereum } from 'react-icons/si';
import { FaCopy, FaChartLine } from 'react-icons/fa';
import LoadingScreenDots from '../common/LoadingScreenDots';
import StatusFooter from '../common/StatusFooter';
import { useBalances } from '../../contexts/BalanceProvider';
import { formatLargeNumberEth } from '../../utils/formatEthNumber';
import User from '../../models/User';

interface UserInfoCardProps {
  user: User | null;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user }) => {
  const { balances, balancesLoaded, showLoadingTooltip, tooltipFading, refreshBalances } = useBalances();
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | 'loading', message: string} | null>(null);

  const [userStats] = useState({
    globalRank: 847,
    totalTrades: 1247,
    dealsPerDay: 8.5,
    avgTimeBetweenTrades: 4.2, // hours
    totalProfit: "+15.6 ETH",
    activeDays: 45,
    favoriteBot: "ScalpMaster Pro"
  });

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

  const copyToClipboard = async () => {
    if (!user?.walletId) return;
    
    try {
      await navigator.clipboard.writeText(user.walletId);
      setStatusMessage({
        type: 'success',
        message: 'Wallet address copied to clipboard!'
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        message: 'Failed to copy wallet address'
      });
    }
  };

  const closeStatusMessage = () => {
    setStatusMessage(null);
  };

  return (
    <>
      <div className="lg:col-span-2">
        <div className="bg-[#181a23]/80 border-4 border-[#00ffe7]/40 rounded-2xl shadow-[0_0_32px_#00ffe7] p-6 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* User Info Section */}
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <img src={user?.photoUrl || undefined} className="h-16 w-16 rounded-full border-2 border-[#00ffe7]/40" alt="your icon" />
                  <div>
                    <div className="text-xl font-bold text-[#00ffe7]">{user?.firstName || "Unknown User"}</div>
                    <div className="text-xs text-[#b8eaff] flex items-center gap-2">
                      Wallet: <span className="font-mono">{user?.walletId?.slice(0, 6)}...{user?.walletId?.slice(-4)}</span>
                      <button
                        onClick={copyToClipboard}
                        className="text-[#00ffe7] hover:text-[#ff005c] transition-colors"
                        title="Copy full address"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-[#e0e7ef]"><strong className="text-[#00ffe7]">Username:</strong> {user?.telegramHandle || "Not set"}</p>
                  <p className="text-[#e0e7ef]"><strong className="text-[#00ffe7]">Full Name:</strong> {user?.firstName} {user?.lastName || ""}</p>
                  <p className="text-[#e0e7ef]"><strong className="text-[#00ffe7]">Last Login:</strong> {user?.lastLoggedIn ? timeSince(user.lastLoggedIn) : "Unknown"}</p>
                  <p className="text-[#e0e7ef]"><strong className="text-[#00ffe7]">Member Since:</strong> {user?.dateCreated ? timeSince(user.dateCreated) : "Unknown"}</p>
                </div>

                <div className="mb-6">
                  <strong className="text-[#00ffe7]">Balances:</strong>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {!balancesLoaded
                      ? (
                        <div className="relative flex items-center mx-auto">
                          <LoadingScreenDots size={3} />
                          {showLoadingTooltip && (
                            <div className={`absolute left-full ml-4 bg-[#23263a] border-2 border-[#faafe8]/40 rounded-lg p-3 shadow-[0_0_16px_#faafe8] min-w-[280px] transition-all duration-300 ${
                              tooltipFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-fadeIn'
                            }`}>
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
              </div>

              <button
                className="w-full btn-hud mt-auto"
                onClick={refreshBalances}
              >
                Refresh Balances
              </button>
            </div>

            {/* Account Stats Section */}
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <FaChartLine className="text-xl text-[#00ffe7]" />
                <h3 className="text-xl font-bold text-[#00ffe7]">Account Stats</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center bg-[#23263a]/50 rounded-lg p-3 border border-[#00ffe7]/10">
                  <div className="text-lg font-bold text-green-400">#{userStats.globalRank}</div>
                  <div className="text-xs text-[#e0e7ef]">Global Rank</div>
                </div>
                <div className="text-center bg-[#23263a]/50 rounded-lg p-3 border border-[#00ffe7]/10">
                  <div className="text-lg font-bold text-[#00ffe7]">{userStats.totalTrades}</div>
                  <div className="text-xs text-[#e0e7ef]">Total Trades</div>
                </div>
                <div className="text-center bg-[#23263a]/50 rounded-lg p-3 border border-[#00ffe7]/10">
                  <div className="text-lg font-bold text-green-400">{userStats.dealsPerDay}</div>
                  <div className="text-xs text-[#e0e7ef]">Deals/Day</div>
                </div>
                <div className="text-center bg-[#23263a]/50 rounded-lg p-3 border border-[#00ffe7]/10">
                  <div className="text-lg font-bold text-[#faafe8]">{userStats.avgTimeBetweenTrades}h</div>
                  <div className="text-xs text-[#e0e7ef]">Avg Trade Time</div>
                </div>
              </div>

              <div className="flex-1 space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-[#e0e7ef]">Total Profit:</span>
                  <span className="text-green-400 font-bold">{userStats.totalProfit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#e0e7ef]">Active Days:</span>
                  <span className="text-[#faafe8] font-bold">{userStats.activeDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#e0e7ef]">Favorite Bot:</span>
                  <span className="text-[#ff005c] font-bold text-sm">{userStats.favoriteBot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#e0e7ef]">Risk Tolerance:</span>
                  <span className="text-yellow-400 font-bold">Medium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#e0e7ef]">Portfolio Value:</span>
                  <span className="text-[#00ffe7] font-bold">2.87 ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#e0e7ef]">Success Rate:</span>
                  <span className="text-green-400 font-bold">73.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#e0e7ef]">Avg Win/Loss:</span>
                  <span className="text-green-400 font-bold">2.3:1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <StatusFooter
          type={statusMessage.type}
          message={statusMessage.message}
          onClose={closeStatusMessage}
        />
      )}
    </>
  );
};

export default UserInfoCard;
