import { createClient, cacheExchange, fetchExchange, useQuery as urqlUseQuery } from 'urql';

// Create the client to interact with the subgraph
export const client = createClient({
  url: 'https://gateway.thegraph.com/api/cf949c81dc1152037b34ecdea916c0a8/subgraphs/id/A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum',
  exchanges: [cacheExchange, fetchExchange],
});

// Define TypeScript types for queries
interface GlobalStats {
  totalVolumeUSD: string;
  totalLiquidityUSD: string;
  txCount: number;
}

interface PairData {
  token0: {
    id: string;
    symbol: string;
    name: string;
    derivedETH: string;
  };
  token1: {
    id: string;
    symbol: string;
    name: string;
    derivedETH: string;
  };
  reserve0: string;
  reserve1: string;
  reserveUSD: string;
  trackedReserveETH: string;
  token0Price: string;
  token1Price: string;
  volumeUSD: string;
  txCount: number;
}

interface Pair {
  id: string;
  token0: {
    id: string;
    symbol: string;
  };
  token1: {
    id: string;
    symbol: string;
  };
}

interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  derivedETH: string;
  tradeVolumeUSD: string;
  totalLiquidity: string;
}

interface DailyAggregatedData {
  date: string;
  dailyVolumeToken0: string;
  dailyVolumeToken1: string;
  dailyVolumeUSD: string;
  reserveUSD: string;
}

interface ETHPrice {
  ethPrice: string;
}

// Function to fetch the global stats like total volume, liquidity, and transaction count
export const getGlobalStatsQuery = `{
  uniswapFactory(id: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f") {
    totalVolumeUSD
    totalLiquidityUSD
    txCount
  }
}`;

// Function to fetch global historical data at a specific block
export const getGlobalHistoricalStatsQuery = (blockNumber: number): string => `{
  uniswapFactory(id: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", block: {number: ${blockNumber}}) {
    totalVolumeUSD
    totalLiquidityUSD
    txCount
  }
}`;

// Function to fetch the pair data for a specific Uniswap pair
export const getPairDataQuery = (pairId: string): string => `{
  pair(id: "${pairId}") {
    token0 {
      id
      symbol
      name
      derivedETH
    }
    token1 {
      id
      symbol
      name
      derivedETH
    }
    reserve0
    reserve1
    reserveUSD
    trackedReserveETH
    token0Price
    token1Price
    volumeUSD
    txCount
  }
}`;

// Function to fetch all Uniswap pairs with pagination
export const getAllPairsQuery = (skip: number): string => `{
    pairs(first: 1000, skip: $skip, orderBy: volumeUSD, orderDirection: desc) {
      id
    	volumeUSD
    	volumeToken0
      token0Price
        txCount

      token0 {
        symbol
        name
        tradeVolume
        totalLiquidity
        totalSupply
      }
    	volumeToken1
    	token1Price
      token1 {
        symbol
        name
        tradeVolume
        totalLiquidity
        totalSupply
      }
    }
}`;

// Function to fetch the most liquid pairs by reserveUSD
export const getMostLiquidPairsQuery = `{
  pairs(first: 1000, orderBy: reserveUSD, orderDirection: desc) {
    id
      token0Price
      token0 {
        symbol
        name
      }
    	token1Price
      token1 {
        symbol
        name
      }
  }
}`;

// Function to fetch recent swaps within a specific pair, with a skip parameter for pagination
export const getRecentSwapsQuery = (pairId: string, skip: number = 0, first: number = 1000): string => {
  return `{
    swaps(orderBy: timestamp, orderDirection: desc, where: {
      pair: "${pairId}"
    }, skip: ${skip}, first: ${first}) {
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      timestamp
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }

    
  }`;
};


// Function to fetch recent swaps starting from the last update timestamp up until now
export const getRecentSwapsQueryFromLastUpdate = (pairId: string, lastUpdateTimestamp: number, skip: number = 0, first: number = 1000): string => {
  const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
  const convertlastUpdateTimestamp = Math.floor(lastUpdateTimestamp); // Current time in seconds

  return `{
    swaps(orderBy: timestamp, orderDirection: desc, where: {
      pair: "${pairId}"
      timestamp_gte: ${convertlastUpdateTimestamp},
      timestamp_lte: ${currentTimestamp},
    }, skip: ${skip}, first: ${first}) {
        pair {
          token0 {
            symbol
          }
          token1 {
            symbol
          }
        }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
  }`;
};


// Function to fetch daily aggregated data for a specific pair
export const getPairDailyAggregatedQuery = (pairAddress: string, date: string): string => `{
  pairDayDatas(first: 100, orderBy: date, orderDirection: asc, where: {
    pairAddress: "${pairAddress}",
    date_gt: ${date}
  }) {
    date
    dailyVolumeToken0
    dailyVolumeToken1
    dailyVolumeUSD
    reserveUSD
  }
}`;

// Function to fetch token data
export const getTokenDataQuery = (tokenId: string): string => `{
  token(id: "${tokenId}") {
    name
    symbol
    decimals
    derivedETH
    tradeVolumeUSD
    totalLiquidity
  }
}`;

// Function to fetch daily aggregated data for a specific token
export const getTokenDailyAggregatedQuery = (tokenId: string): string => `{
  tokenDayDatas(orderBy: date, orderDirection: asc, where: {
    token: "${tokenId}"
  }) {
    id
    date
    priceUSD
    totalLiquidityToken
    totalLiquidityUSD
    totalLiquidityETH
    dailyVolumeETH
    dailyVolumeToken
    dailyVolumeUSD
  }
}`;

// Function to fetch ETH price in USD
export const getETHPriceQuery = `{
  bundle(id: "1") {
    ethPrice
  }
}`;

// Function to fetch the top tokens by volume
export const getTopTokensQuery = `{
  tokens(first: 15, orderBy: volumeUSD, orderDirection: desc) {
    id
    name
    symbol
    derivedETH
    volumeUSD
    txCount
  }
  bundles(first: 1) {
    ethPriceUSD
  }
}`;



// Custom hook to run the token query
export const useTokensQuery = () => urqlUseQuery<{ tokens: { id: string; name: string; symbol: string; derivedETH: string; volumeUSD: string; txCount: number }[], bundles: { ethPriceUSD: string }[] }>({
  query: getTopTokensQuery,
});


// Custom hook to fetch global stats
export const useGlobalStatsQuery = () =>
  urqlUseQuery<{ uniswapFactory: GlobalStats }>({
    query: getGlobalStatsQuery,
  });

// Custom hook to fetch global historical stats at a specific block
export const useGlobalHistoricalStatsQuery = (blockNumber: number) =>
  urqlUseQuery<{ uniswapFactory: GlobalStats }>({
    query: getGlobalHistoricalStatsQuery(blockNumber),
  });

// Custom hook to fetch data for a specific pair
export const usePairDataQuery = (pairId: string) =>
  urqlUseQuery<{ pair: PairData }>({
    query: getPairDataQuery(pairId),
  });

// Custom hook to fetch all pairs with pagination
export const useAllPairsQuery = (skip: number) =>
  urqlUseQuery<{ pairs: Pair[] }>({
    query: getAllPairsQuery(skip),
  });

// Custom hook to fetch the most liquid pairs
export const useMostLiquidPairsQuery = () =>
  urqlUseQuery<{ pairs: Pair[] }>({
    query: getMostLiquidPairsQuery,
  });

// Custom hook to fetch recent swaps for a specific pair
export const useRecentSwapsQuery = (pairId: string) =>
  urqlUseQuery<{
    swaps: {
      pair: { token0: { symbol: string }; token1: { symbol: string } };
      amount0In: string;
      amount0Out: string;
      amount1In: string;
      amount1Out: string;
      amountUSD: string;
      to: string;
    }[];
  }>({
    query: getRecentSwapsQuery(pairId),
  });

// Custom hook to fetch daily aggregated data for a specific pair
export const usePairDailyAggregatedQuery = (pairAddress: string, date: string) =>
  urqlUseQuery<{ pairDayDatas: DailyAggregatedData[] }>({
    query: getPairDailyAggregatedQuery(pairAddress, date),
  });

// Custom hook to fetch token data
export const useTokenDataQuery = (tokenId: string) =>
  urqlUseQuery<{ token: TokenData }>({
    query: getTokenDataQuery(tokenId),
  });

// Custom hook to fetch daily aggregated data for a specific token
export const useTokenDailyAggregatedQuery = (tokenId: string) =>
  urqlUseQuery<{
    tokenDayDatas: {
      id: string;
      date: string;
      priceUSD: string;
      totalLiquidityToken: string;
      totalLiquidityUSD: string;
      totalLiquidityETH: string;
      dailyVolumeETH: string;
      dailyVolumeToken: string;
      dailyVolumeUSD: string;
    }[];
  }>({
    query: getTokenDailyAggregatedQuery(tokenId),
  });

// Custom hook to fetch the ETH price in USD
export const useETHPriceQuery = () =>
  urqlUseQuery<{ bundle: ETHPrice }>({
    query: getETHPriceQuery,
  });

// Custom hook to fetch the top tokens by volume
export const useTopTokensQuery = () =>
  urqlUseQuery<{
    tokens: {
      id: string;
      name: string;
      symbol: string;
      derivedETH: string;
      volumeUSD: string;
      txCount: number;
    }[];
    bundles: { ethPriceUSD: string }[];
  }>({
    query: getTopTokensQuery,
  });


