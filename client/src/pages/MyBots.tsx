import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToken } from '../services/TokenProvider';
import { BotConfig } from '../models/Bot';
import ShopDetail from './ShopDetail';

const MyBots = () => {
  const { botId } = useParams<{ botId?: string }>();
  const navigate = useNavigate();
  const { publicToken, fetchPublicToken } = useToken();

  const [bots, setBots] = useState<BotConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ walletId: string } | null>(null);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);

  const selectedBot = bots.find((bot) => bot.botName === selectedBotId);

  // Get user from session storage on component mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser && storedUser !== 'undefined') {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  // Fetch bots when the user is available
  useEffect(() => {
    const fetchMyBots = async () => {
      if (!user?.walletId) return; // Skip if user or walletId is not set

      setLoading(true);
      setError(null);

      try {
        const walletId = user.walletId;
        const response = await fetch(`/api/bot/mine?walletId=${walletId}`);

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

  const handleOpenModal = (botId: string) => {
    setSelectedBotId(botId);
  };

  const handleCloseModal = () => {
    setSelectedBotId(null);
  };

  const generateLogoHash = (name: string) => {
    return `https://www.robohash.org/dexter/${btoa(name).substring(0, 8)}`;
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-center mb-8">My Bots</h1>

      {loading && <p className="text-center">Loading your bots...</p>}

      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && bots.length === 0 && (
        <p className="text-gray-700 text-center">You don't have any bots yet.</p>
      )}

      {!loading && !error && bots.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bots.map((bot) => (
            <div
              key={bot.botName}
              className="border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <img src={generateLogoHash(bot.botName)} alt={bot.botName} className="w-full rounded-t-lg" />
              <div className="p-4">
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Cooldown Period:</strong> {bot.cooldownPeriod} seconds</li>
                  {/* <li><strong>Created At:</strong> {new Date(bot.createdAt._seconds * 1000).toLocaleString()}</li> */}
                  <li><strong>Creator:</strong> {bot.creator}</li>
                  <li><strong>Initial Order Size:</strong> {bot.initialOrderSize}</li>
                  <li><strong>Max Drawdown:</strong> {bot.maxDrawdown}%</li>
                  <li><strong>Max Trade Size:</strong> {bot.maxTradeSize}</li>
                  <li><strong>Min Trade Size:</strong> {bot.minTradeSize}</li>
                  <li><strong>Notifications:</strong> {bot.notifications ? 'Enabled' : 'Disabled'}</li>
                  <li><strong>Order Type:</strong> {bot.orderType}</li>
                  <li><strong>Price Deviation:</strong> {bot.priceDeviation}%</li>
                  <li><strong>Safety Order Multiplier:</strong> {bot.safetyOrderMultiplier}</li>
                  <li><strong>Safety Orders:</strong> {bot.safetyOrders}</li>
                  <li><strong>Starting Balance:</strong> ${bot.startingBalance}</li>
                  <li><strong>Stop Loss:</strong> {bot.stopLoss}%</li>
                  <li><strong>Take Profit:</strong> {bot.takeProfit}%</li>
                  <li><strong>Trading Pair:</strong> {bot.tradingPair}</li>
                  <li><strong>Trailing Take Profit:</strong> {bot.trailingTakeProfit}%</li>
                </ul>

                <h2 className="text-xl font-semibold mb-2">{bot.botName}</h2>
                {/* <p className="text-gray-700 mb-4">{bot.description}</p> */}
                <div className="flex items-center justify-between">
                  {/* <span className="text-lg font-bold text-green-600">${bot.price}</span> */}
                  <button
                    onClick={() => handleOpenModal(bot.botName)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedBot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg p-8 relative">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300"
            >
              ✕
            </button>
            {/* ShopDetail Component */}
            {/* <ShopDetail bot={selectedBot} /> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBots;
