import React from 'react';
import { FaEye, FaShoppingCart, FaHandshake } from 'react-icons/fa';
import { SiEthereum } from 'react-icons/si';
import { formatLargeNumberEth } from '../../utils/formatEthNumber';

interface BotCardProps {
  bot: {
    id: string;
    name: string;
    description: string;
    price: number;
    buyPrice: number;
    hirePrice: number;
    image: string;
    stats: { trades: number; winRate: number; uptime: number };
    categories: string[];
    risk: number;
  };
  currency: string;
  onView: (botId: string) => void;
  onBuy: (bot: BotCardProps['bot']) => void;
  onHire: (bot: BotCardProps['bot']) => void;
}

const BotCard: React.FC<BotCardProps> = ({ bot, currency, onView, onBuy, onHire }) => {
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

  const getWinRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-400';
    if (rate >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 95) return 'text-green-400';
    if (uptime >= 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className="relative group bg-[#181a23]/80 border-2 border-[#00ffe7]/30 rounded-xl shadow-[0_0_12px_#00ffe7] hover:shadow-[0_0_24px_#ff005c] transition-shadow overflow-hidden hud-panel p-2 flex flex-col items-center"
      style={{ minHeight: 280 }}
    >
      {/* View Button - Top Left Corner */}
      <button
        onClick={() => onView(bot.id)}
        className="absolute top-2 left-2 z-10 w-8 h-8 hud-btn flex items-center justify-center bg-[#23263a] text-[#e0e7ef] rounded font-bold shadow-[0_0_4px_#00ffe7] hover:bg-[#00ffe7] hover:text-[#181a23] hover:shadow-[0_0_8px_#ff005c] transition-all border border-[#00ffe7]/40"
      >
        <FaEye className="text-xs" />
      </button>

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
      
      {/* Enhanced Stats Section */}
      <div className="flex flex-col gap-1 w-full mt-auto bg-[#23263a]/50 rounded-lg p-2 border border-[#00ffe7]/10">
        <div className="flex justify-between text-[11px]">
          <span className="text-[#b8eaff] font-medium">Trades</span>
          <span className="font-bold text-[#00ffe7]">{bot.stats.trades.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-[#b8eaff] font-medium">Win Rate</span>
          <span className={`font-bold ${getWinRateColor(bot.stats.winRate)}`}>{bot.stats.winRate}%</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-[#b8eaff] font-medium">Uptime</span>
          <span className={`font-bold ${getUptimeColor(bot.stats.uptime)}`}>{bot.stats.uptime}%</span>
        </div>
      </div>

      {/* Action Buttons with Pricing */}
      <div className="flex gap-2 mt-3 w-full">
        <button
          onClick={() => onBuy(bot)}
          className="flex-1 hud-btn flex flex-col items-center justify-center bg-green-500 text-white px-2 py-2 rounded-lg font-bold shadow-[0_0_6px_rgba(34,197,94,0.5)] hover:bg-green-600 hover:shadow-[0_0_12px_rgba(34,197,94,0.7)] transition-all border border-green-400 text-xs"
        >
          <div className="flex items-center gap-1 mb-1">
            <FaShoppingCart />
            <span>BUY</span>
          </div>
          <div className="flex items-center gap-1 text-[13px]">
            <span>{parseFloat(bot.buyPrice.toFixed(4))}</span>
            <SiEthereum className="w-3 h-3 text-[#627eea]" />
          </div>
        </button>
        <button
          onClick={() => onHire(bot)}
          className="flex-1 hud-btn flex flex-col items-center justify-center bg-[#00ffe7] text-[#181a23] px-2 py-2 rounded-lg font-bold shadow-[0_0_6px_rgba(0,255,231,0.5)] hover:bg-[#ff005c] hover:text-white hover:shadow-[0_0_12px_rgba(255,0,92,0.7)] transition-all border border-[#00ffe7] text-xs"
        >
          <div className="flex items-center gap-1 mb-1">
            <FaHandshake />
            <span>HIRE</span>
          </div>
          <span className="text-[13px]">FREE</span>
        </button>
      </div>
      
      <div className="absolute inset-0 pointer-events-none border border-[#00ffe7]/20 rounded-xl hud-glow"></div>
    </div>
  );
};

export default BotCard;
