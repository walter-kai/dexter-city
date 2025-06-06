import React from 'react';
import { BotForSale } from '../models/Bot';

interface ShopDetailProps {
  bot: BotForSale;
}

const ShopDetail: React.FC<ShopDetailProps> = ({ bot }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <img src={bot.image} alt={bot.name} className="w-full h-80 object-cover rounded-lg border-2 border-[#00ffe7]" />
        <div>
          <h1 className="text-4xl font-bold mb-4 text-[#00ffe7]">{bot.name}</h1>
          <p className="text-[#e0e7ef] mb-4">{bot.description}</p>
          <div className="text-2xl font-bold text-green-400 mb-6">${bot.price}</div>
          <button
            className="bg-[#00ffe7] text-[#181a23] px-6 py-3 rounded hover:bg-[#ff005c] hover:text-white shadow-[0_0_8px_#00ffe7] hover:shadow-[0_0_16px_#ff005c] transition"
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
