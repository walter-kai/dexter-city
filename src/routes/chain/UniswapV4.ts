import { createClient, cacheExchange, fetchExchange } from 'urql';
import { Subgraph } from '../../../client/src/models/Token';

// Don't create the client immediately - create it lazily when needed
let client: any = null;

const getClient = () => {
  if (!client) {
    const apiKey = process.env.THEGRAPH_API_KEY;
    if (!apiKey) {
      throw new Error('THEGRAPH_API_KEY environment variable is not set');
    }
    
    client = createClient({
      url: `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/DiYPVdygkfjDWhbxGSqAQxwBKmfKnkWQojqeM2rkLb3G`,
      exchanges: [cacheExchange, fetchExchange],
    });
  }
  return client;
};

const sanitizeDocId = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9:-]/g, "_"); // Replace illegal characters
};

export const fetchSwaps = async (
  poolAddress: string,
  skip: number = 0,
  startTime?: Date,
  endTime?: Date,
): Promise<Subgraph.SwapDataV4[]> => {
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
    const result = await getClient().query(query, { skip }).toPromise();
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
export const fetchTopAlltimePools = async (skip: number = 0, first: number = 100): Promise<Subgraph.PoolData[]> => {

    const query = `{
    pools(first: ${first}, skip: ${skip}, orderBy: txCount, orderDirection: desc, where: { token0: "0x0000000000000000000000000000000000000000" }) {
      id
      token0 {
        symbol
        id
        name
        volumeUSD
      }
      token1 {
        symbol
        id
        name
        volumeUSD
      }
      feeTier
      volumeUSD
      token0Price
      token1Price
      liquidity
    }
  }`;

  try {
    const result = await getClient().query(query, { skip }).toPromise();
    if (result.error) {
      throw new Error(result.error.message);
    }

    const pools: Subgraph.PoolData[] = result.data?.pools.map((pool: Subgraph.PairData) => ({
      address: pool.id,
      name: sanitizeDocId(`ETH:${pool.token0.symbol}:${pool.token1.symbol}`),
      lastUpdated: new Date(),
      network: "Ethereum",
      volumeUSD: pool.volumeUSD,
      token0: {
        address: pool.token0.id, 
        symbol: pool.token0.symbol,
        name: pool.token0.name,
        // volume: pool.token0.volumeUSD,
        // price: pool.token0Price,
      },
      token1: {
        address: pool.token1.id, 
        symbol: pool.token1.symbol,
        name: pool.token1.name,
        // volume: pool.token1.,
        // price: pool.token1Price,
      },
    })) || [];

    return pools;
  } catch (error) {
    console.error('Error fetching recent swaps:', error);
    throw error;
  }
};

export const fetchTopDailyPools = async (skip: number = 0, first: number = 1000): Promise<any[]> => {
  const query = `{
    poolDayDatas(first: ${first}, skip: ${skip}, orderBy: date, orderDirection: desc) {
      pool {
        id
        token0 {
          symbol
          id
          name
          volumeUSD
        }
        token1 {
          symbol
          id
          name
          volumeUSD
        }
        feeTier
        volumeUSD
        token0Price
        token1Price
        liquidity
      }
      txCount
      volumeUSD
      date
    }
  }`;

  try {
    const result = await getClient().query(query, { skip }).toPromise();
    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data?.poolDayDatas || [];
  } catch (error) {
    console.error('Error fetching daily pools data:', error);
    throw error;
  }
};
