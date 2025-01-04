import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToken } from '../services/TokenProvider';
import { BotConfig } from '../models/Bot';
import CreateDCABot from './Build';

const MyBots = () => {
  const { botId } = useParams<{ botId?: string }>();
  const { publicToken, fetchPublicToken } = useToken();
  const navigate = useNavigate(); // Hook for navigation

  const [bots, setBots] = useState<BotConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ walletId: string } | null>(null);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [triggerBuildModal, setBuildModal] = useState<boolean | null>(null);
  const [botToDelete, setBotToDelete] = useState<string | null>(null);

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

  const handleOpenModal = (botId: string) => {
    setSelectedBotId(botId);
  };

  const handleCloneBot = (botId: string) => {
    const selectedBot = bots.find((bot) => bot.botName === botId);
    if (selectedBot) {
      const editBot = {
        ...selectedBot,
        botName: 'Clone of ' + selectedBot.botName
      }
      // Navigate to /build with the bot config as state
      navigate('/build', { state: { botConfig: editBot } });
    }
  };

  const handleTriggerBuildModal = () => {
    setBuildModal(!triggerBuildModal);
  };

  const handleCloseModal = () => {
    setSelectedBotId(null);
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

  const generateLogoHash = (name: string) => {
    return `https://www.robohash.org/dexter/${name}`;
  };

  const renderBotStats = (bot: BotConfig) => {
    return (
      <div className="justify-between my-4 text-gray-700">
        <div>
        9879 <strong># Completed Transactions (1D):</strong> 
        </div>
        <div>
        8659 <strong>Total Earnings (1D):</strong> 
        </div>
        <div>
        6587  <strong>Average Earnings/Txn (1D):</strong> 
        </div>
        <div>
         5 <strong>Age:</strong> 
        </div>
        <div>
        568 <strong>Avg Time Between Txns (1D):</strong> 
        </div>
      </div>
    );
  };

  return (
    <div className="py-12 h-full">

      {loading && <p className="text-center">Loading your bots...</p>}

      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && bots.length === 0 && (
        <p className="text-gray-700 text-center">You don't have any bots yet.</p>
      )}

      {!loading && !error && bots.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Create Bot Tile */}
                    <div
            onClick={handleTriggerBuildModal}
            className="flex flex-col items-center justify-center border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow bg-white cursor-pointer"
          >
            <div className="p-4 text-center">
              <div className="w-16 h-16 bg-blue-500 text-white text-4xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                +
              </div>
              <h2 className="text-lg font-semibold">Create Bot</h2>
            </div>
          </div>

          {bots.map((bot) => (
            <div
              key={bot.botName}
              className="border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow bg-white"
            >
              <div className="p-4">
                <img
                  src={generateLogoHash(bot.botName)}
                  alt={bot.botName}
                  className="w-32 h-32 mx-auto mb-4 rounded-full"
                />
                <h2 className="text-xl font-semibold text-center">{bot.botName}</h2>
                {renderBotStats(bot)}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 justify-between my-4">
                  {bot.status !== 'Running' ? (
                    <button
                      onClick={() => handleStartBot(bot.botName)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                    >
                      Start
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStopBot(bot.botName)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                    >
                      Stop
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenModal(bot.botName)} // Now opens the modal and navigates
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleCloneBot(bot.botName)} // Now opens the modal and navigates
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
                  >
                    Clone
                  </button>
                  <button
                    onClick={() => handleDeleteModalOpen(bot.botName)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Build Modal */}
      {triggerBuildModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <button
              onClick={handleTriggerBuildModal}
              className="absolute top-4 right-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300"
            >
              ✕
            </button>
          <CreateDCABot />
        </div>
      )}

      {/* View Modal */}
      {selectedBot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-4xl rounded-lg p-8 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">{selectedBot.botName}</h2>
            <img
              src={generateLogoHash(selectedBot.botName)}
              alt={selectedBot.botName}
              className="w-32 h-32 mx-auto rounded-full mb-6"
            />
            {renderBotStats(selectedBot)}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700 mt-6">
              <div><strong>Cooldown Period:</strong> {selectedBot.cooldownPeriod} seconds</div>
              <div><strong>Max Transactions (1D):</strong>5</div>
              <div><strong>Max Earnings (1D):</strong> 53</div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {botToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg p-8 relative">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Are you sure you want to delete {botToDelete}?
            </h2>
            <div className="flex justify-between">
              <button
                onClick={handleDeleteBot}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Yes
              </button>
              <button
                onClick={handleDeleteModalClose}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBots;
