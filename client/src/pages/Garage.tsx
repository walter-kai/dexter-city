import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BotConfig } from '../models/Bot';
import BuildBot from './Build';
import { generateLogoHash } from "../hooks/Robohash";
import { FaPlay, FaStop, FaClone, FaTrash, FaPlus, FaCopy } from 'react-icons/fa';
import { Line, Pie } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, ArcElement, Tooltip, Legend } from 'chart.js';
import StatusFooter from '../components/StatusFooter';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, ArcElement, Tooltip, Legend);

function truncateMiddle(str: string, frontLen = 6, backLen = 4) {
  if (!str || str.length <= frontLen + backLen + 3) return str;
  return `${str.slice(0, frontLen)}...${str.slice(-backLen)}`;
}

const Garage = () => {
  const navigate = useNavigate();

  const [bots, setBots] = useState<BotConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ walletId: string } | null>(null);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [botToDelete, setBotToDelete] = useState<string | null>(null);
  const [statusFooter, setStatusFooter] = useState<{ type: 'success' | 'error' | 'loading', message: string } | null>(null);

  const selectedBot = bots.find((bot) => bot.botName === selectedBotId);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser && storedUser !== 'undefined') {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    const fetchMyBots = async () => {
      if (!user?.walletId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/bot/mine?walletId=${user.walletId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch bots: ${response.statusText}`);
        }

        const data = await response.json();
        setBots(data);
      } catch (error) {
        console.error('Error fetching bots:', error);
        setError('Failed to load your bots. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyBots();
  }, [user]);

  const handleCloneBot = (botId: string) => {
    const selectedBot = bots.find((bot) => bot.botName === botId);
    if (selectedBot) {
      const editBot = {
        ...selectedBot,
        botName: 'Clone of ' + selectedBot.botName
      }
      navigate('/build', { state: { botConfig: editBot } });
    }
  };

  const handleTriggerBuildModal = () => {
    navigate('/build');
  };

  const handleDeleteModalOpen = (botName: string) => {
    setBotToDelete(botName);
  };

  const handleDeleteModalClose = () => {
    setBotToDelete(null);
  };

  const handleDeleteBot = async () => {
    if (!botToDelete) return;

    try {
      const response = await fetch(`/api/bot?botName=${botToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete bot: ${response.statusText}`);
      }

      setBots(bots.filter((bot) => bot.botName !== botToDelete));
      handleDeleteModalClose();
    } catch (error) {
      console.error('Error deleting bot:', error);
      setError('Failed to delete the bot. Please try again later.');
    }
  };

  const handleStartBot = async (botName: string) => {
    try {
      const response = await fetch(`/api/bot/start?botName=${botName}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`Failed to start bot: ${response.statusText}`);
      }

      setBots((prevBots) =>
        prevBots.map((bot) =>
          bot.botName === botName ? { ...bot, status: 'Running' } : bot
        )
      );
    } catch (error) {
      console.error('Error starting bot:', error);
      setError('Failed to start the bot. Please try again later.');
    }
  };

  const handleStopBot = async (botName: string) => {
    try {
      const response = await fetch(`/api/bot/stop?botName=${botName}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`Failed to stop bot: ${response.statusText}`);
      }

      setBots((prevBots) =>
        prevBots.map((bot) =>
          bot.botName === botName ? { ...bot, status: 'Stopped' } : bot
        )
      );
    } catch (error) {
      console.error('Error stopping bot:', error);
      setError('Failed to stop the bot. Please try again later.');
    }
  };

  const handleCopyWallet = (wallet: string) => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet);
    setStatusFooter({ type: 'success', message: 'Wallet address copied!' });
    setTimeout(() => setStatusFooter(null), 1500);
  };

  const renderBotStats = (bot: BotConfig) => (
    <div className="my-2 text-[#00ffe7] text-xs grid grid-cols-2 gap-1 font-mono">
      <div>
        <span className="text-[#ff005c] font-bold">9879</span> <span className="opacity-70">#Txns (1D)</span>
      </div>
      <div>
        <span className="text-green-400 font-bold">8659</span> <span className="opacity-70">Earnings (1D)</span>
      </div>
      <div>
        <span className="text-[#00ffe7] font-bold">6587</span> <span className="opacity-70">Avg/Txn (1D)</span>
      </div>
      <div>
        <span className="text-[#faafe8] font-bold">5</span> <span className="opacity-70">Age</span>
      </div>
      <div>
        <span className="text-[#ff005c] font-bold">568</span> <span className="opacity-70">Avg Time/Txn</span>
      </div>
    </div>
  );

  // Fake data for charts
  const fakeLineData = {
    labels: Array.from({ length: 10 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: 'Earnings',
        data: Array.from({ length: 10 }, () => Math.floor(Math.random() * 1000 + 1000)),
        fill: false,
        borderColor: '#00ffe7',
        backgroundColor: '#00ffe7',
        tension: 0.3,
      },
    ],
  };
  const fakePieData = {
    labels: ['ETH', 'USDT', 'BTC'],
    datasets: [
      {
        data: [40, 30, 30],
        backgroundColor: ['#00ffe7', '#ff005c', '#faafe8'],
        borderColor: '#23263a',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center pt-24 pb-12 font-lato">
      <div className="w-full max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Left: Bot Gallery */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-5xl font-extrabold text-[#00ffe7] drop-shadow-[0_0_16px_#00ffe7] tracking-widest hud-title">
              BOT GARAGE
            </h1>
            <div className="hud-bar bg-[#00ffe7]/30 border-2 border-[#00ffe7] rounded-lg px-6 py-2 shadow-[0_0_24px_#00ffe7] text-[#181a23] font-bold text-lg uppercase tracking-wider">
              <span className="text-[#00ffe7]">BOTS:</span> <span className="text-green-400"> {bots.length}</span>
            </div>
          </div>
          {loading && <p className="text-center text-[#00ffe7]">Loading your bots...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!loading && !error && bots.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-16">
              <p className="text-[#e0e7ef] text-lg mb-6">You don't have any bots yet.</p>
              <button
                onClick={handleTriggerBuildModal}
                className="btn-hud"
              >
                <FaPlus className="inline-block" />
                Create Bot
              </button>
            </div>
          )}
          {!loading && !error && bots.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Create Bot Tile */}
              <div
                onClick={handleTriggerBuildModal}
                className="relative flex flex-col items-center justify-center min-h-[180px] cursor-pointer"
                style={{
                  background: "#181a23",
                  borderRadius: "1rem",
                  border: "4px solid #00ffe7",
                  boxShadow: "0 0 32px #00ffe7",
                  overflow: "hidden"
                }}
              >
                <div className="p-2 text-center">
                  <div className="w-12 h-12 bg-[#00ffe7] text-[#181a23] text-3xl font-extrabold rounded-full flex items-center justify-center mx-auto mb-2 shadow-[0_0_8px_#00ffe7] border-4 border-[#00ffe7]/60">
                    <FaPlus />
                  </div>
                  <h2 className="text-base font-bold text-[#00ffe7]">Create Bot</h2>
                </div>
              </div>
              {bots.map((bot) => (
                <div
                  key={bot.botName}
                  onClick={() => setSelectedBotId(bot.botName)}
                  className={`relative flex flex-col items-center min-h-[180px] p-3 cursor-pointer hover:scale-105 transition-all duration-300 ease-in-out`}
                  style={{
                  background: "#181a23",
                  borderRadius: "1rem",
                  border: "4px solid #00ffe7",
                  boxShadow: selectedBotId === bot.botName
                    ? "0 0 32px #ff005c"
                    : "0 0 16px #00ffe7",
                  overflow: "hidden"
                  }}
                >
                  <img
                  src={generateLogoHash(bot.botName)}
                  alt={bot.botName}
                  className="w-14 h-14 mx-auto mb-2 rounded-full border-2 border-[#00ffe7]/40 shadow-[0_0_8px_#00ffe7]"
                  />
                  <h2 className="text-base font-bold text-center text-[#00ffe7] mb-1">{bot.botName}</h2>
                  {renderBotStats(bot)}
                  <div className="grid grid-cols-1 gap-1 w-full mt-2">
                  {bot.status !== 'Running' ? (
                    <button
                    onClick={e => { e.stopPropagation(); handleStartBot(bot.botName); }}
                    className="btn-hud bg-green-500 text-white border-green-400 hover:bg-green-600"
                    >
                    <FaPlay />
                    Start
                    </button>
                  ) : (
                    <button
                    onClick={e => { e.stopPropagation(); handleStopBot(bot.botName); }}
                    className="btn-hud bg-yellow-500 text-white border-yellow-400 hover:bg-yellow-600"
                    >
                    <FaStop />
                    Stop
                    </button>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); handleCloneBot(bot.botName); }}
                    className="btn-hud bg-purple-500 text-white border-purple-400 hover:bg-purple-600"
                  >
                    <FaClone />
                    Clone
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteModalOpen(bot.botName); }}
                    className="btn-hud bg-red-500 text-white border-red-400 hover:bg-red-600"
                  >
                    <FaTrash />
                    Delete
                  </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Right: Bot Details and Charts */}
        <div className="w-full md:w-[500px] flex-shrink-0">
          {selectedBot ? (
            <div
              className="mb-8 flex flex-col items-center"
              style={{
                background: "#181a23",
                borderRadius: "1rem",
                border: "4px solid #00ffe7",
                boxShadow: "0 0 32px #00ffe7",
                padding: "2rem",
                overflow: "hidden"
              }}
            >
              <img
                src={generateLogoHash(selectedBot.botName)}
                alt={selectedBot.botName}
                className="w-32 h-32 mx-auto rounded-full mb-4 border-4 border-[#00ffe7]/60 shadow-[0_0_16px_#00ffe7]"
              />
              <h2 className="text-3xl font-bold text-[#00ffe7] mb-2 text-center">{selectedBot.botName}</h2>
              <div className="flex flex-wrap gap-4 justify-center mb-6">
                <div className="bg-[#23263a] rounded-lg px-4 py-2 flex flex-col items-center min-w-[120px]">
                  <span className="text-xs text-[#e0e7ef]">Status</span>
                  <span className="font-bold text-[#00ffe7]">{selectedBot.status || "N/A"}</span>
                </div>
                <div className="bg-[#23263a] rounded-lg px-4 py-2 flex flex-col items-center min-w-[120px]">
                  <span className="text-xs text-[#e0e7ef]">Trading Pair</span>
                  <span className="font-bold text-[#00ffe7]">{selectedBot.tradingPool || "N/A"}</span>
                </div>
                <div className="bg-[#23263a] rounded-lg px-4 py-2 flex flex-col items-center min-w-[120px]">
                  <span className="text-xs text-[#e0e7ef]">Creator</span>
                  <span className="font-bold text-[#00ffe7]">{selectedBot.creatorName || "N/A"}</span>
                </div>
                <div className="bg-[#23263a] rounded-lg px-4 py-2 flex flex-col items-center min-w-[180px]">
                  <span className="text-xs text-[#e0e7ef]">Wallet</span>
                  <span className="font-mono font-bold text-[#00ffe7] flex items-center gap-2">
                    {truncateMiddle(selectedBot.creatorWalletId || "N/A")}
                    {selectedBot.creatorWalletId && (
                      <button
                        className="ml-1 text-[#00ffe7] hover:text-[#ff005c] transition"
                        onClick={() => handleCopyWallet(selectedBot.creatorWalletId!)}
                        title="Copy wallet address"
                        type="button"
                      >
                        <FaCopy />
                      </button>
                    )}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-[#e0e7ef] mb-6 w-full">
                {[
                  { label: "Trigger Type", value: selectedBot.triggerType || "N/A" },
                  { label: "Initial Order Size", value: selectedBot.initialOrderSize || "N/A" },
                  { label: "Price Deviation", value: `${selectedBot.priceDeviation || 0}%` },
                  { label: "Safety Orders", value: selectedBot.safetyOrders || "N/A" },
                  { label: "Safety Order Gap Multiplier", value: `${selectedBot.safetyOrderGapMultiplier || 0}x` },
                  { label: "Safety Order Size Multiplier", value: selectedBot.safetyOrderSizeMultiplier || "N/A" },
                  { label: "Take Profit", value: `${selectedBot.takeProfit || 0}%` },
                  { label: "Trailing Take Profit", value: selectedBot.trailingTakeProfit ? "Enabled" : "Disabled" },
                  { label: "Order Type", value: selectedBot.orderType || "N/A" },
                  { label: "Cooldown Period", value: `${selectedBot.cooldownPeriod || 0} seconds` },
                  { label: "Notifications", value: selectedBot.notifications ? "Enabled" : "Disabled" },
                  {
                    label: "Created At",
                    value: selectedBot.createdAt ? new Date(selectedBot.createdAt).toLocaleString() : "N/A",
                  },
                ].map((detail, index) => (
                  <div key={index}>
                    <strong className="text-[#00ffe7]">{detail.label}:</strong> {detail.value}
                  </div>
                ))}
              </div>
              <div className="mt-8 w-full">
                <h3 className="text-lg font-bold text-[#00ffe7] mb-2">Earnings History</h3>
                <div className="bg-[#23263a] rounded-lg p-4 mb-6">
                  <Line
                    data={fakeLineData}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { ticks: { color: '#00ffe7' }, grid: { color: '#23263a' } },
                        y: { ticks: { color: '#00ffe7' }, grid: { color: '#23263a' } }
                      },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                    height={120}
                  />
                </div>
                <h3 className="text-lg font-bold text-[#00ffe7] mb-2">Asset Allocation</h3>
                <div className="bg-[#23263a] rounded-lg p-4">
                  <Pie
                    data={fakePieData}
                    options={{
                      plugins: {
                        legend: {
                          labels: { color: '#e0e7ef', font: { size: 14 } }
                        }
                      },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                    height={120}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center h-full min-h-[320px]"
              style={{
                background: "#181a23",
                borderRadius: "1rem",
                border: "4px solid #00ffe7",
                boxShadow: "0 0 16px #00ffe7",
                padding: "2rem",
                overflow: "hidden"
              }}
            >
              <span className="text-[#e0e7ef] text-lg">Select a bot to view details and stats.</span>
            </div>
          )}
        </div>
      </div>
      {/* Delete Modal */}
      {botToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-[#23263a] w-full max-w-md rounded-2xl p-10 relative border-4 border-[#00ffe7]/40 shadow-[0_0_48px_#00ffe7] hud-panel">
            <h2 className="text-2xl font-bold mb-6 text-center text-[#ff005c]">
              Are you sure you want to delete <span className="text-[#00ffe7]">{botToDelete}</span>?
            </h2>
            <div className="flex justify-between gap-4">
              <button
                onClick={handleDeleteBot}
                className="btn-hud bg-red-500 text-white border-red-400 hover:bg-red-600"
              >
                <FaTrash />
                Yes
              </button>
              <button
                onClick={handleDeleteModalClose}
                className="btn-hud bg-gray-500 text-white border-gray-400 hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {statusFooter && (
        <StatusFooter
          type={statusFooter.type}
          message={statusFooter.message}
          onClose={() => setStatusFooter(null)}
        />
      )}
    </div>
  );
};

export default Garage;
