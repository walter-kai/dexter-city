import React, { useState } from "react";
import { Subgraph } from "../../models/Uniswap";
import LoadingScreenDots from "../common/LoadingScreenDots";
import { FaSearch, FaChevronDown } from "react-icons/fa";

interface PoolDropdownProps {
  availablePools: Subgraph.PoolData[] | null;
  selectedPool: Subgraph.PoolData | undefined;
  onSelect: (pool: Subgraph.PoolData) => void;
  formData: any;
}

const PoolDropdown: React.FC<PoolDropdownProps> = ({
  availablePools,
  selectedPool,
  onSelect,
  formData,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [pairSearch, setPairSearch] = useState("");

  // Filtered pools
  const filteredPools =
    availablePools?.filter(
      (pool) =>
        pool.token0.symbol.toLowerCase().includes(pairSearch.toLowerCase()) ||
        pool.token1.symbol.toLowerCase().includes(pairSearch.toLowerCase())
    ) || [];

  // Use CoinMarketCap for dropdown icons
  const getCmcIcon = (imgId: number | undefined) =>
    imgId
      ? `https://s2.coinmarketcap.com/static/img/coins/32x32/${imgId}.png`
      : "/logos/dexter.svg";

  // When a pool is selected, just call onSelect
  const handleSelect = (pool: Subgraph.PoolData) => {
    onSelect(pool);
    setShowDropdown(false);
    setPairSearch("");
  };

  const selectedPoolDisplay = selectedPool
    ? `${selectedPool.token0.symbol} ↔️ ${selectedPool.token1.symbol}`
    : "Select Trading Pair";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full h-12 bg-[#23263a] border-2 border-[#00ffe7]/40 text-[#e0e7ef] rounded px-3 font-bold flex items-center justify-between hover:border-[#00ffe7] transition-colors"
      >
        <span>{selectedPoolDisplay}</span>
        <FaChevronDown className={`transition-transform ${showDropdown ? "rotate-180" : ""}`} />
      </button>
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#23263a] border-2 border-[#00ffe7]/40 rounded-lg shadow-lg z-20">
          {/* Search Bar */}
          <div className="p-3 border-b border-[#00ffe7]/20">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ffe7]/60" />
              <input
                type="text"
                placeholder="Search pairs..."
                value={pairSearch}
                onChange={(e) => setPairSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#181a23] border border-[#00ffe7]/20 rounded text-[#e0e7ef] text-sm focus:outline-none focus:border-[#00ffe7]"
              />
            </div>
          </div>
          {/* Dropdown Content */}
          <div className="max-h-48 overflow-y-auto">
            {availablePools ? (
              filteredPools.length > 0 ? (
                filteredPools.map((pool) => (
                  <div
                    key={pool.address}
                    className={`flex items-center p-3 cursor-pointer transition-all ${
                      formData.tradingPool === pool.name.split(":")[1]
                        ? "bg-[#00ffe7]/20 border-l-4 border-[#00ffe7]"
                        : "hover:bg-[#00ffe7]/10"
                    }`}
                    onClick={() => handleSelect(pool)}
                  >
                    <img
                      src={getCmcIcon(pool.token0.imgId)}
                      alt={`${pool.token0.symbol} icon`}
                      className="w-6 h-6 mr-2 rounded-full"
                    />
                    <span className="text-[#e0e7ef] font-bold">{pool.token0.symbol}</span>
                    <span className="text-[#00ffe7] mx-2">↔️</span>
                    <img
                      src={getCmcIcon(pool.token1.imgId)}
                      alt={`${pool.token1.symbol} icon`}
                      className="w-6 h-6 mx-2 rounded-full"
                    />
                    <span className="text-[#e0e7ef] font-bold">{pool.token1.symbol}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-[#e0e7ef]/60">
                  No pairs found matching "{pairSearch}"
                </div>
              )
            ) : (
              <div className="p-4">
                <LoadingScreenDots />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PoolDropdown;
