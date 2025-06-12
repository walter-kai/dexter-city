import React from 'react';
import { BotConfig } from '../../models/Bot';
import { generateLogoHash } from '../../hooks/Robohash';
import { FaTag, FaTrash } from 'react-icons/fa';

interface SellingTabProps {
  myBots: BotConfig[];
  myListings: any[];
  onSellBot: (bot: BotConfig) => void;
  onRemoveListing: (listingId: string) => void;
}

const SellingTab: React.FC<SellingTabProps> = ({
  myBots,
  myListings,
  onSellBot,
  onRemoveListing,
}) => {
  return (
    <div className="space-y-6">
      {/* My Bots Available to Sell */}
      <div>
        <h2 className="text-2xl font-bold text-[#00ffe7] mb-4">My Bots Available to Sell</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {myBots.map((bot) => (
            <div
              key={bot.botName}
              className="relative group bg-[#181a23]/80 border-2 border-[#00ffe7]/30 rounded-xl shadow-[0_0_12px_#00ffe7] hover:shadow-[0_0_24px_#ff005c] transition-shadow overflow-hidden p-2 flex flex-col items-center"
              style={{ minHeight: 200 }}
            >
              <img
                src={generateLogoHash(bot.botName)}
                alt={bot.botName}
                className="w-16 h-16 object-cover rounded-full border-2 border-[#00ffe7]/30 shadow-[0_0_8px_#00ffe7] mb-2"
              />
              <h3 className="text-sm font-bold text-[#00ffe7] text-center mb-2">{bot.botName}</h3>
              <p className="text-xs text-[#e0e7ef] text-center mb-2">
                {bot.tradingPool || 'No trading pair'}
              </p>
              <div className="mt-auto w-full">
                <button
                  onClick={() => onSellBot(bot)}
                  className="w-full btn-hud bg-green-500 text-white border-green-400 hover:bg-green-600 text-xs py-1 px-2"
                >
                  <FaTag /> Sell Bot
                </button>
              </div>
            </div>
          ))}
          {myBots.length === 0 && (
            <div className="col-span-full text-center text-[#e0e7ef] py-8">
              No bots available to sell. Create some bots first!
            </div>
          )}
        </div>
      </div>

      {/* My Active Listings */}
      <div>
        <h2 className="text-2xl font-bold text-[#00ffe7] mb-4">My Active Listings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {myListings.map((listing) => (
            <div
              key={listing.id}
              className="relative group bg-[#181a23]/80 border-2 border-green-400/30 rounded-xl shadow-[0_0_12px_green] hover:shadow-[0_0_24px_green] transition-shadow overflow-hidden p-2 flex flex-col items-center"
              style={{ minHeight: 220 }}
            >
              <img
                src={generateLogoHash(listing.bot.botName)}
                alt={listing.bot.botName}
                className="w-16 h-16 object-cover rounded-full border-2 border-green-400/30 shadow-[0_0_8px_green] mb-2"
              />
              <h3 className="text-sm font-bold text-green-400 text-center mb-1">{listing.bot.botName}</h3>
              <div className="flex flex-wrap gap-1 mb-2 justify-center">
                {listing.categories.slice(0, 2).map((cat: string) => (
                  <span
                    key={cat}
                    className="bg-green-400/10 text-green-400 px-1 py-0.5 rounded text-[10px] font-bold border border-green-400/20"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#e0e7ef] text-center mb-2 line-clamp-2">
                {listing.description}
              </p>
              <div className="text-lg font-bold text-green-400 mb-2">
                {listing.price} DCX
              </div>
              <div className="mt-auto w-full">
                <button
                  onClick={() => onRemoveListing(listing.id)}
                  className="w-full btn-hud bg-red-500 text-white border-red-400 hover:bg-red-600 text-xs py-1 px-2"
                >
                  <FaTrash /> Remove
                </button>
              </div>
            </div>
          ))}
          {myListings.length === 0 && (
            <div className="col-span-full text-center text-[#e0e7ef] py-8">
              No active listings. List some bots for sale!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellingTab;
