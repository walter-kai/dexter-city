import { createClient, cacheExchange, fetchExchange, useQuery as urqlUseQuery } from 'urql';
import { Subgraph } from '../../client/src/models/Token';


interface uniswapV3Pair { 
  id: any; 
  volumeUSD: any; 
  token0Price: any; 
  token1Price: any;
  token0: { 
    id: any; 
    symbol: any; 
    name: any; 
    volumeUSD: any; 
  }; 
  token1: { 
    id: any; 
    symbol: any; 
    name: any; 
    volumeUSD: any; 
  }; 
}

// Create the client to interact with the subgraph
const client = createClient({
  url: 'https://gateway.thegraph.com/api/cf949c81dc1152037b34ecdea916c0a8/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
  exchanges: [cacheExchange, fetchExchange],
});

const sanitizeDocId = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9:-]/g, "_"); // Replace illegal characters
};

export const fetchSwapsV3 = async (
  poolAddress: string,
  skip: number = 0,
  first: number = 1000
): Promise<Subgraph.SwapDataV3[]> => {
  const query = `{
    swaps(first: ${first}, skip: ${skip}, orderBy: timestamp, orderDirection: desc, where: { pool: "${poolAddress}" }) {
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


// Function to fetch recent swaps with a specific pairId and skip parameter
export const fetchTopPools = async (skip: number = 0, first: number = 1000): Promise<Subgraph.PoolData[]> => {
  
  const query = `{
    pools(first: ${first}, skip: ${skip}, orderBy: volumeUSD, orderDirection: desc) {
      id
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
