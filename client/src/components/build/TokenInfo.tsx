import React, { useEffect, useState } from "react";
import { Subgraph } from "../../models/Token";
import LoadingScreenDots from "../common/LoadingScreenDots";
import { FaCoins, FaChartLine, FaTags, FaDatabase } from "react-icons/fa";

interface TokenInfoProps {
  tokenAddress: string;
}

const TokenInfo: React.FC<TokenInfoProps> = ({ tokenAddress }) => {
  const [tokenData, setTokenData] = useState<Subgraph.TokenDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showTagsTooltip, setShowTagsTooltip] = useState(false);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!tokenAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/firebase/tokenInfo?tokenAddress=${tokenAddress}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch token info: ${response.statusText}`);
        }
        const data = await response.json();
        setTokenData(data as Subgraph.TokenDetails);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load token information.");
      } finally {
        setLoading(false);
      }
    };

    fetchTokenInfo();
  }, [tokenAddress]);

  if (!tokenAddress) {
    return (
      <div className="bg-[#181a23] border-2 border-[#00ffe7]/20 rounded-xl p-6 w-full">
        <div className="text-center text-[#e0e7ef]/60">
          <FaCoins className="text-4xl mx-auto mb-3 text-[#00ffe7]/40" />
          <p>Select a trading pair to view token details</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-[#181a23] border-2 border-[#00ffe7]/20 rounded-xl p-6 w-full">
        <LoadingScreenDots />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#181a23] border-2 border-red-400/40 rounded-xl p-6 w-full">
        <div className="text-center text-red-400">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="bg-[#181a23] border-2 border-[#00ffe7]/20 rounded-xl p-6 w-full">
        <div className="text-center text-[#e0e7ef]/60">
          <p>No token data available</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number | null | undefined) => {
    if (!num) return "N/A";
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatPercent = (percent: number | null | undefined) => {
    if (percent === null || percent === undefined) return "N/A";
    const isPositive = percent >= 0;
    return (
      <span className={isPositive ? "text-green-400" : "text-red-400"}>
        {isPositive ? "+" : ""}{percent.toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="bg-[#181a23] border-2 border-[#00ffe7]/40 rounded-xl p-4 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#00ffe7]/20">
        <FaCoins className="text-2xl text-[#00ffe7]" />
        <div>
          <h3 className="text-lg font-bold text-[#00ffe7]">
            {tokenData.name || "Unknown Token"}
          </h3>
          <p className="text-sm text-[#e0e7ef]/70 font-mono">
            {tokenData.symbol || "N/A"}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#23263a] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FaChartLine className="text-[#00ffe7] text-sm" />
            <span className="text-xs text-[#e0e7ef]/70">Price</span>
          </div>
          <div className="text-lg font-bold text-[#00ffe7]">
            ${tokenData.price?.toFixed(6) || "N/A"}
          </div>
        </div>
        
        <div className="bg-[#23263a] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FaDatabase className="text-[#00ffe7] text-sm" />
            <span className="text-xs text-[#e0e7ef]/70">Rank</span>
          </div>
          <div className="text-lg font-bold text-[#00ffe7]">
            #{tokenData.cmc_rank || "N/A"}
          </div>
        </div>
      </div>

      {/* Market Data */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#e0e7ef]/70">Market Cap:</span>
          <span className="text-sm font-bold text-[#00ffe7]">
            ${formatNumber(tokenData.quote?.USD?.market_cap)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#e0e7ef]/70">24h Volume:</span>
          <span className="text-sm font-bold text-[#00ffe7]">
            ${formatNumber(tokenData.quote?.USD?.volume_24h)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#e0e7ef]/70">24h Change:</span>
          <span className="text-sm font-bold">
            {formatPercent(tokenData.quote?.USD?.percent_change_24h)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#e0e7ef]/70">Circulating:</span>
          <span className="text-sm font-bold text-[#00ffe7]">
            {formatNumber(tokenData.circulating_supply)}
          </span>
        </div>
      </div>

      {/* Tags */}
      {tokenData.tags && tokenData.tags.length > 0 && (
        <div className="pt-3 border-t border-[#00ffe7]/20">
          <div className="flex items-center gap-2 mb-2">
            <FaTags className="text-[#00ffe7] text-sm" />
            <span className="text-xs text-[#e0e7ef]/70">Tags</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {tokenData.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="bg-[#00ffe7]/10 text-[#00ffe7] px-2 py-1 rounded text-xs font-bold border border-[#00ffe7]/20"
              >
                {tag}
              </span>
            ))}
            {tokenData.tags.length > 4 && (
              <div className="relative">
                <button
                  className="btn-link"
                  onClick={() => setShowTagsTooltip(!showTagsTooltip)}
                  onMouseEnter={() => setShowTagsTooltip(true)}
                  onMouseLeave={() => setShowTagsTooltip(false)}
                >
                  +{tokenData.tags.length - 4} more
                </button>
                
                {/* Tags Tooltip */}
                {showTagsTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 z-50">
                    <div className="bg-[#181a23] border-2 border-[#00ffe7]/40 rounded-lg p-3 shadow-lg min-w-[200px]">
                      <div className="text-xs text-[#00ffe7] font-bold mb-2">All Tags</div>
                      <div className="flex flex-wrap gap-1">
                        {tokenData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-[#00ffe7]/10 text-[#00ffe7] px-2 py-1 rounded text-xs font-bold border border-[#00ffe7]/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#00ffe7]/40"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenInfo;
