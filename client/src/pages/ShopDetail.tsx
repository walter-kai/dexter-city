import React from 'react';
import { Bot } from '../models/Bot';

interface ShopDetailProps {
  bot: Bot;
}

const ShopDetail: React.FC<ShopDetailProps> = ({ bot }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <img src={bot.image} alt={bot.name} className="w-full h-80 object-cover rounded-lg" />
        <div>
          <h1 className="text-4xl font-bold mb-4">{bot.name}</h1>
          <p className="text-gray-700 mb-4">{bot.description}</p>
          <div className="text-2xl font-bold text-green-600 mb-6">${bot.price}</div>
          <button
            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition"
            onClick={() => alert(`Purchased ${bot.name}!`)}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;
