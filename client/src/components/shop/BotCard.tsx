import React from 'react';
import { FaEye, FaShoppingCart } from 'react-icons/fa';

interface BotCardProps {
  bot: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    stats: { trades: number; winRate: number; uptime: number };
    categories: string[];
    risk: number;
  };
  currency: string;
  onView: (botId: string) => void;
  onAddToCart: (bot: BotCardProps['bot']) => void;
}

const BotCard: React.FC<BotCardProps> = ({ bot, currency, onView, onAddToCart }) => {
  const renderRiskMeter = (risk: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((lvl) => (
        <div
          key={lvl}
          className={`w-2 h-2 rounded-full border ${
            lvl <= risk
              ? lvl >= 4
                ? 'bg-red-500 border-red-400'
                : lvl === 3
                ? 'bg-yellow-400 border-yellow-300'
                : 'bg-green-400 border-green-300'
              : 'bg-gray-700 border-gray-500'
          }`}
        />
      ))}
      <span className="ml-1 text-[10px] text-[#e0e7ef]">Risk: {risk}/5</span>
    </div>
  );

  return (
    <div
      className="relative group bg-[#181a23]/80 border-2 border-[#00ffe7]/30 rounded-xl shadow-[0_0_12px_#00ffe7] hover:shadow-[0_0_24px_#ff005c] transition-shadow overflow-hidden hud-panel p-2 flex flex-col items-center"
      style={{ minHeight: 260 }}
    >
      <img
        src={bot.image}
        alt={bot.name}
        className="w-16 h-16 object-cover rounded-full border-2 border-[#00ffe7]/30 shadow-[0_0_8px_#00ffe7] mb-1"
      />
      <h2 className="text-base font-bold text-[#00ffe7] tracking-wide mb-0.5 text-center">
        {bot.name}
      </h2>
      <div className="flex flex-wrap gap-1 mb-1 justify-center">
        {bot.categories.map((cat) => (
          <span
            key={cat}
            className="bg-[#00ffe7]/10 text-[#00ffe7] px-1 py-0.5 rounded text-[10px] font-bold border border-[#00ffe7]/20"
          >
            {cat}
          </span>
        ))}
      </div>
      {renderRiskMeter(bot.risk)}
      <p className="text-[#e0e7ef] text-xs my-1 text-center line-clamp-2">
        {bot.description}
      </p>
      <div className="flex flex-col gap-0.5 w-full mt-auto">
        <div className="flex justify-between text-[10px] text-[#e0e7ef]">
          <span>Trades</span>
          <span className="font-bold">{bot.stats.trades}</span>
        </div>
        <div className="flex justify-between text-[10px] text-[#e0e7ef]">
          <span>Win</span>
          <span className="font-bold">{bot.stats.winRate}%</span>
        </div>
        <div className="flex justify-between text-[10px] text-[#e0e7ef]">
          <span>Uptime</span>
          <span className="font-bold">{bot.stats.uptime}%</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1 w-full">
        <span className="text-base font-extrabold text-green-400 drop-shadow-[0_0_4px_#00ffe7]">
          {bot.price}{' '}
          <span className="text-[#00ffe7]">{currency}</span>
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onView(bot.id)}
            className="hud-btn flex items-center gap-1 bg-[#00ffe7] text-[#181a23] px-2 py-1 rounded font-bold uppercase shadow-[0_0_4px_#00ffe7] hover:bg-[#ff005c] hover:text-white hover:shadow-[0_0_8px_#ff005c] transition-all border border-[#00ffe7] text-xs"
          >
            <FaEye />
          </button>
          <button
            onClick={() => onAddToCart(bot)}
            className="hud-btn flex items-center gap-1 bg-green-400 text-[#181a23] px-2 py-1 rounded font-bold uppercase shadow-[0_0_4px_#00ffe7] hover:bg-green-600 hover:text-white hover:shadow-[0_0_8px_#00ffe7] transition-all border border-green-400 text-xs"
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none border border-[#00ffe7]/20 rounded-xl hud-glow"></div>
    </div>
  );
};

export default BotCard;
