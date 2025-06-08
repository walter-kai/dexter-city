import React, { useState } from 'react';
import { FaSearch, FaEthereum, FaFire, FaCoins, FaChartLine } from 'react-icons/fa';

interface TokenPair {
  symbol: string;
  name: string;
  category: 'eth' | 'meme' | 'defi' | 'stable' | 'gaming';
  pair: string;
  volume24h: string;
  liquidity: string;
  apy: string;
  trending?: boolean;
}

const tokenPairs: TokenPair[] = [
  // Ethereum pairs
  { symbol: 'ETH', name: 'Ethereum', category: 'eth', pair: 'ETH/USDC', volume24h: '$1.2B', liquidity: '$500M', apy: '12.5%' },
  { symbol: 'WETH', name: 'Wrapped Ethereum', category: 'eth', pair: 'WETH/USDT', volume24h: '$890M', liquidity: '$320M', apy: '11.8%' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', category: 'eth', pair: 'WBTC/ETH', volume24h: '$650M', liquidity: '$280M', apy: '14.2%', trending: true },
  
  // Meme coins
  { symbol: 'PEPE', name: 'Pepe', category: 'meme', pair: 'PEPE/ETH', volume24h: '$420M', liquidity: '$180M', apy: '28.5%', trending: true },
  { symbol: 'SHIB', name: 'Shiba Inu', category: 'meme', pair: 'SHIB/ETH', volume24h: '$380M', liquidity: '$160M', apy: '22.1%' },
  { symbol: 'DOGE', name: 'Dogecoin', category: 'meme', pair: 'DOGE/ETH', volume24h: '$290M', liquidity: '$120M', apy: '18.7%' },
  { symbol: 'FLOKI', name: 'Floki Inu', category: 'meme', pair: 'FLOKI/ETH', volume24h: '$180M', liquidity: '$85M', apy: '35.2%' },
  { symbol: 'BONK', name: 'Bonk', category: 'meme', pair: 'BONK/ETH', volume24h: '$150M', liquidity: '$70M', apy: '42.1%' },
  
  // DeFi tokens
  { symbol: 'UNI', name: 'Uniswap', category: 'defi', pair: 'UNI/ETH', volume24h: '$320M', liquidity: '$140M', apy: '16.8%' },
  { symbol: 'LINK', name: 'Chainlink', category: 'defi', pair: 'LINK/ETH', volume24h: '$280M', liquidity: '$125M', apy: '15.3%' },
  { symbol: 'AAVE', name: 'Aave', category: 'defi', pair: 'AAVE/ETH', volume24h: '$240M', liquidity: '$110M', apy: '17.9%' },
  { symbol: 'SUSHI', name: 'SushiSwap', category: 'defi', pair: 'SUSHI/ETH', volume24h: '$190M', liquidity: '$95M', apy: '19.4%' },
  { symbol: 'CRV', name: 'Curve DAO', category: 'defi', pair: 'CRV/ETH', volume24h: '$170M', liquidity: '$80M', apy: '21.2%' },
  
  // Stablecoins
  { symbol: 'USDC', name: 'USD Coin', category: 'stable', pair: 'USDC/ETH', volume24h: '$1.8B', liquidity: '$800M', apy: '8.5%' },
  { symbol: 'USDT', name: 'Tether', category: 'stable', pair: 'USDT/ETH', volume24h: '$1.5B', liquidity: '$650M', apy: '7.8%' },
  { symbol: 'DAI', name: 'Dai', category: 'stable', pair: 'DAI/ETH', volume24h: '$420M', liquidity: '$180M', apy: '9.2%' },
  { symbol: 'FRAX', name: 'Frax', category: 'stable', pair: 'FRAX/ETH', volume24h: '$280M', liquidity: '$120M', apy: '10.1%' },
  
  // Gaming tokens
  { symbol: 'AXS', name: 'Axie Infinity', category: 'gaming', pair: 'AXS/ETH', volume24h: '$120M', liquidity: '$60M', apy: '24.6%' },
  { symbol: 'SAND', name: 'The Sandbox', category: 'gaming', pair: 'SAND/ETH', volume24h: '$110M', liquidity: '$55M', apy: '26.3%' },
  { symbol: 'MANA', name: 'Decentraland', category: 'gaming', pair: 'MANA/ETH', volume24h: '$95M', liquidity: '$45M', apy: '23.8%' },
  { symbol: 'ENJ', name: 'Enjin Coin', category: 'gaming', pair: 'ENJ/ETH', volume24h: '$80M', liquidity: '$40M', apy: '27.1%' },
  
  // Additional popular tokens
  { symbol: 'ARB', name: 'Arbitrum', category: 'eth', pair: 'ARB/ETH', volume24h: '$380M', liquidity: '$160M', apy: '18.5%', trending: true },
  { symbol: 'OP', name: 'Optimism', category: 'eth', pair: 'OP/ETH', volume24h: '$250M', liquidity: '$110M', apy: '20.1%' },
  { symbol: 'MATIC', name: 'Polygon', category: 'eth', pair: 'MATIC/ETH', volume24h: '$340M', liquidity: '$150M', apy: '16.7%' },
  { symbol: 'LDO', name: 'Lido DAO', category: 'defi', pair: 'LDO/ETH', volume24h: '$180M', liquidity: '$85M', apy: '22.4%' },
  { symbol: 'MKR', name: 'Maker', category: 'defi', pair: 'MKR/ETH', volume24h: '$140M', liquidity: '$70M', apy: '19.8%' },
  { symbol: 'COMP', name: 'Compound', category: 'defi', pair: 'COMP/ETH', volume24h: '$120M', liquidity: '$60M', apy: '21.5%' },
];

const TokenPairs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'volume' | 'apy' | 'liquidity'>('volume');

  const categories = [
    { id: 'all', name: 'All Tokens', icon: <FaCoins /> },
    { id: 'eth', name: 'Ethereum & L2', icon: <FaEthereum /> },
    { id: 'meme', name: 'Meme Coins', icon: <FaFire /> },
    { id: 'defi', name: 'DeFi Tokens', icon: <FaChartLine /> },
    { id: 'stable', name: 'Stablecoins', icon: <FaCoins /> },
    { id: 'gaming', name: 'Gaming', icon: <FaCoins /> },
  ];

  const filteredTokens = tokenPairs
    .filter(token => {
      const matchesSearch = token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           token.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || token.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'volume':
          return parseFloat(b.volume24h.replace(/[$BM]/g, '')) - parseFloat(a.volume24h.replace(/[$BM]/g, ''));
        case 'apy':
          return parseFloat(b.apy.replace('%', '')) - parseFloat(a.apy.replace('%', ''));
        case 'liquidity':
          return parseFloat(b.liquidity.replace(/[$BM]/g, '')) - parseFloat(a.liquidity.replace(/[$BM]/g, ''));
        default:
          return 0;
      }
    });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'eth': return 'border-blue-500/50 bg-blue-500/10';
      case 'meme': return 'border-orange-500/50 bg-orange-500/10';
      case 'defi': return 'border-green-500/50 bg-green-500/10';
      case 'stable': return 'border-gray-500/50 bg-gray-500/10';
      case 'gaming': return 'border-purple-500/50 bg-purple-500/10';
      default: return 'border-[#00ffe7]/50 bg-[#00ffe7]/10';
    }
  };

  return (
    <div className="min-h-screen py-10 text-[#e0e7ef]">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-[#23263a] border border-[#00ffe7]/30 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-[#00ffe7] mb-6 text-center">
            <FaCoins className="inline mr-3" />
            Supported Trading Pairs
          </h1>
          
          <p className="text-center text-[#e0e7ef] mb-8 text-lg max-w-3xl mx-auto">
            Choose from over 50 popular trading pairs on Uniswap. Each pair includes real-time volume data,
            liquidity metrics, and estimated APY for automated trading strategies.
          </p>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00ffe7]" />
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#181a23] border border-[#00ffe7]/30 rounded-lg text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7]"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'volume' | 'apy' | 'liquidity')}
                className="px-4 py-3 bg-[#181a23] border border-[#00ffe7]/30 rounded-lg text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7]"
              >
                <option value="volume">Sort by Volume</option>
                <option value="apy">Sort by APY</option>
                <option value="liquidity">Sort by Liquidity</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-[#00ffe7] text-[#181a23] border-[#00ffe7]'
                      : 'bg-[#181a23] text-[#e0e7ef] border-[#00ffe7]/30 hover:border-[#00ffe7]/60'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Token Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTokens.map((token) => (
              <div
                key={token.symbol}
                className={`relative bg-[#181a23] border rounded-lg p-6 hover:shadow-[0_0_16px_#00ffe7]/30 transition-all duration-300 ${getCategoryColor(token.category)}`}
              >
                {token.trending && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    🔥 TRENDING
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#00ffe7] rounded-full flex items-center justify-center text-[#181a23] font-bold text-lg">
                    {token.symbol.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-[#00ffe7] font-bold text-lg">{token.symbol}</h3>
                    <p className="text-[#e0e7ef] text-sm">{token.name}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#b8eaff]">Trading Pair:</span>
                    <span className="text-[#00ffe7] font-semibold">{token.pair}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[#b8eaff]">24h Volume:</span>
                    <span className="text-green-400 font-semibold">{token.volume24h}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[#b8eaff]">Liquidity:</span>
                    <span className="text-blue-400 font-semibold">{token.liquidity}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[#b8eaff]">Est. APY:</span>
                    <span className="text-[#faafe8] font-semibold">{token.apy}</span>
                  </div>
                </div>

                <button className="w-full mt-4 bg-[#00ffe7] text-[#181a23] py-2 rounded font-semibold hover:bg-[#faafe8] transition-colors duration-200">
                  Select Pair
                </button>
              </div>
            ))}
          </div>

          {filteredTokens.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#e0e7ef] text-lg">No tokens found matching your criteria.</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-[#b8eaff] text-sm">
              Don't see a token you want to trade? <a href="/contact" className="text-[#00ffe7] hover:underline">Contact us</a> to request new trading pairs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenPairs;
