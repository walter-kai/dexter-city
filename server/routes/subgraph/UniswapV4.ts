import { createClient, cacheExchange, fetchExchange } from 'urql';

import { PoolData, PoolDayDataResponse, PoolResponse } from '.types/subgraph/Pools';
import { SwapDataV4 } from '.types/subgraph/Swaps';

// Define the interface for the returned pool day data

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
): Promise<SwapDataV4[]> => {
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


export const fetchTopDailyPools = async (skip: number = 0, first: number = 1000): Promise<PoolDayDataResponse[]> => {
  const query = `{
    poolDayDatas(first: ${first}, skip: ${skip}, orderBy: date, orderDirection: desc) {
      __typename
      date
      txCount
      pool {
        __typename
        id
        token0 {
          __typename
          symbol
          id
          name
          txCount
          volumeUSD
        }
        token1 {
          __typename
          symbol
          id
          name
          txCount
          volumeUSD
        }
        
        feeTier
        volumeUSD
        token0Price
        token1Price
        liquidity
        createdAtTimestamp
      }
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

export const fetchPools = async (
  skip: number = 0,
  first: number = 1000
): Promise<PoolResponse[]> => {
  const query = `{
    pools(
      first: ${first}
      skip: ${skip}
      orderBy: volumeUSD
      orderDirection: desc
      where: {
        totalValueLockedUSD_gt: 100000
        feeTier_in: [500, 3000]
      }
    ) {
      id
      feeTier
      totalValueLockedUSD
      volumeUSD
      txCount
      token0 {
        id
        symbol
        decimals
      }
      token1 {
        id
        symbol
        decimals
      }
    }
  }`;

  try {
    const result = await getClient().query(query, { skip }).toPromise();
    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data?.pools || [];
  } catch (error) {
    console.error('Error fetching pools:', error);
    throw error;
  }
};
