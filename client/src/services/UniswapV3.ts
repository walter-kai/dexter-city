import { createClient, cacheExchange, fetchExchange } from 'urql';
import { PublicClient } from 'viem';
import { Subgraph } from '../models/Token';

interface uniswapV3Pair { 
  id: number; 
  volumeUSD: number; 
  token0Price: number; 
  token1Price: number;
  token0: { 
    id: number; 
    symbol: number; 
    name: number; 
    volumeUSD: number; 
  }; 
  token1: { 
    id: number; 
    symbol: number; 
    name: number; 
    volumeUSD: number; 
  }; 
}

const poolAbi = [
  {
    inputs: [],
    name: 'fee',
    outputs: [{ internalType: 'uint24', name: '', type: 'uint24' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tickSpacing',
    outputs: [{ internalType: 'int24', name: '', type: 'int24' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'sqrtPriceX96',
    outputs: [{ internalType: 'uint160', name: '', type: 'uint160' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'liquidity',
    outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tick',
    outputs: [{ internalType: 'int24', name: '', type: 'int24' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// Create the client to interact with the subgraph
const client = createClient({
  url: 'https://gateway.thegraph.com/api/cf949c81dc1152037b34ecdea916c0a8/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
  exchanges: [cacheExchange, fetchExchange],
});

const sanitizeDocId = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9:-]/g, "_"); // Replace illegal characters
};

export const getPoolImmutables = async (poolAddress: `0x${string}`, client: PublicClient) => {
  const fee = await client.readContract({
    address: poolAddress,
    abi: poolAbi,
    functionName: 'fee',
  });

  const tickSpacing = await client.readContract({
    address: poolAddress,
    abi: poolAbi,
    functionName: 'tickSpacing',
  });

  return { fee, tickSpacing };
};

export const getPoolState = async (poolAddress: `0x${string}`, client: PublicClient) => {
  const sqrtPriceX96 = await client.readContract({
    address: poolAddress,
    abi: poolAbi,
    functionName: 'sqrtPriceX96',
  });

  const liquidity = await client.readContract({
    address: poolAddress,
    abi: poolAbi,
    functionName: 'liquidity',
  });

  const tick = await client.readContract({
    address: poolAddress,
    abi: poolAbi,
    functionName: 'tick',
  });

  return { sqrtPriceX96, liquidity, tick };
};

export const fetchSwapsV3 = async (
  poolAddress: string,
  skip: number = 0,
  startTime?: Date,
  endTime?: Date,
): Promise<Subgraph.SwapDataV3[]> => {
  const startTimestamp = startTime ? Math.floor(startTime.getTime() / 1000) : Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
  const endTimestamp = endTime ? Math.floor(endTime.getTime() / 1000) : Math.floor(Date.now() / 1000);

  const query = `{
    swaps(first: 1000, skip: ${skip}, orderBy: timestamp, orderDirection: desc, where: { pool: "${poolAddress}", timestamp_gte: ${startTimestamp}, timestamp_lte: ${endTimestamp} }) {
      timestamp
      amount0
      amount1
      amountUSD
    }
  }`;

  try {
    const result = await client.query(query, { skip }).toPromise();
    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data?.swaps || [];
  } catch (error) {
    console.error("Error fetching recent swaps:", error);
    throw error;
  }
};

export const fetchTopPools = async (skip: number = 0, first: number = 1000): Promise<Subgraph.PoolData[]> => {
  const query = `{
    pools(first: ${first}, skip: ${skip}, orderBy: txCount, orderDirection: desc) {
      id
      txCount
      volumeUSD
      token0Price
      token0 {
        id
        symbol
        name
        volumeUSD
      }
      token1Price
      token1 {
        id
        symbol
        name
        volumeUSD
      }
    }
  }`;

  try {
    const result = await client.query(query, { skip }).toPromise();
    if (result.error) {
      throw new Error(result.error.message);
    }

    const pools: Subgraph.PoolData[] = result.data?.pools.map((pool: uniswapV3Pair) => ({
      address: pool.id,
      name: sanitizeDocId(`ETH:${pool.token0.symbol}:${pool.token1.symbol}`),
      lastUpdated: new Date(),
      network: "Ethereum",
      volumeUSD: pool.volumeUSD,
      token0: {
        address: pool.token0.id, 
        symbol: pool.token0.symbol,
        name: pool.token0.name,
        volume: pool.token0.volumeUSD,
        price: pool.token0Price,
      },
      token1: {
        address: pool.token1.id, 
        symbol: pool.token1.symbol,
        name: pool.token1.name,
        volume: pool.token1.volumeUSD,
        price: pool.token1Price,
      },
    })) || [];

    return pools;
  } catch (error) {
    console.error('Error fetching recent swaps:', error);
    throw error;
  }
};
