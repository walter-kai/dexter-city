import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BotForSale } from '../models/Bot';
import ShopDetail from './ShopDetail';

const defaultBots: BotForSale[] = [
  {
    id: '1',
    name: 'Crypto Bot',
    description: 'Automates cryptocurrency trades with advanced strategies.',
    price: 299,
    image: `https://robohash.org/crypto-bot`,
  },
  {
    id: '2',
    name: 'Stock Bot',
    description: 'Optimizes stock trades for maximum gains.',
    price: 399,
    image: `https://robohash.org/stock-bot`,
  },
  {
    id: '3',
    name: 'Fantasy Football Bot',
    description: 'Manage your fantasy football league like a pro.',
    price: 199,
    image: `https://robohash.org/fantasy-football-bot`,
  },
];

// interface ShopProps {
//   initialBots?: BotForSale[]; // Optionally provide a custom set of bots
// }

const Shop = () => {
  const { botId } = useParams<{ botId?: string }>(); // Get the botId from the URL
  const navigate = useNavigate();

  // Use initialBots if provided; otherwise, fall back to defaultBots
  const [bots, setBots] = useState<BotForSale[]>(defaultBots);

  const selectedBot = bots.find((bot) => bot.id === botId);

  const handleCloseModal = () => {
    navigate('/shop'); // Navigate back to /shop to close the modal
  };

  const handleOpenModal = (botId: string) => {
    navigate(`/shop/${botId}`); // Navigate to /shop/:botId to open the modal
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Bot Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {bots.map((bot) => (
          <div
            key={bot.id}
            className="border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <img src={bot.image} alt={bot.name} className="w-full rounded-t-lg" />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{bot.name}</h2>
              <p className="text-gray-700 mb-4">{bot.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-green-600">${bot.price}</span>
                <button
                  onClick={() => handleOpenModal(bot.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
            <ShopDetail bot={selectedBot} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
