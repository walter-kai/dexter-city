import { db } from "../firebase/firebase.config";
import admin from "firebase-admin";
import logger from "../../utils/logger";
import { fetchSwaps, fetchPools } from "./UniswapV4";
import { updateSwapsToPools } from "../firebase/firebase.service";
import { SwapDataV4 } from ".types/subgraph/Swaps";
import { PoolData } from ".types/subgraph/Pools";


/**
 * Get top pools from Uniswap subgraph, filtered by liquidity and fee tiers.
 * Similar to getSwapsV4, this fetches data directly from the subgraph.
 */
const getPoolsUniswap = async (): Promise<PoolData[] | null> => {
  try {
    /**
     * Fetch pools from the subgraph.
     * This will attempt to fetch the data multiple times if needed.
     */
    const fetchPoolsFromSubgraph = async (): Promise<PoolData[]> => {
      let skip = 0;
      let allPools: PoolData[] = [];

      try {
        // Fetch pools (can be done multiple times if needed)
        for (let i = 0; i < 1; i++) {
          const pools = await fetchPools(skip, 1000);

          // Convert the subgraph response to our PoolData format
          const convertedPools: PoolData[] = pools.map((pool: any) => ({
            name: `${pool.token0.symbol}/${pool.token1.symbol}`,
            lastUpdated: new Date().toISOString(),
            createdAtTimestamp: Date.now().toString(),
            network: "Ethereum" as const,
            address: pool.id,
            volumeUSD: pool.volumeUSD || "0",
            txCount: pool.txCount || "0",
            date: new Date().toISOString().split('T')[0],
            feeTier: pool.feeTier || "0",
            liquidity: pool.totalValueLockedUSD || "0",
            token0Price: "0", // Not available in this query
            token0: {
              address: pool.token0.id,
              symbol: pool.token0.symbol,
              name: pool.token0.symbol, // Using symbol as name fallback
              decimals: Number(pool.token0.decimals) || 18,
              txCount: 0, // Not available in this query
              imgId: 0, // Will be populated by preloadTokenImages if needed
              volume: 0, // Not available in this query
              price: 0, // Not available in this query
              date_added: new Date().toISOString(),
              tags: [],
            },
            token1Price: "0", // Not available in this query
            token1: {
              address: pool.token1.id,
              symbol: pool.token1.symbol,
              name: pool.token1.symbol, // Using symbol as name fallback
              decimals: Number(pool.token1.decimals) || 18,
              txCount: 0, // Not available in this query
              imgId: 0, // Will be populated by preloadTokenImages if needed
              volume: 0, // Not available in this query
              price: 0, // Not available in this query
              date_added: new Date().toISOString(),
              tags: [],
            },
          }));

          allPools = allPools.concat(convertedPools);

          // Stop fetching if fewer than 1000 items are returned
          if (pools.length < 1000) {
            break;
          }

          skip += 1000;
          logger.info(`Downloading pools: ${skip} of 5000`);
        }

        return allPools;
      } catch (err: unknown) {
        if (err instanceof Error) {
          logger.error(`Error fetching pools from subgraph: ${err.message}`);
        } else {
          logger.error("Unknown error occurred while fetching pools from subgraph.");
        }
        return [];
      }
    };

    // Fetch all pools directly from the subgraph
    const pools = await fetchPoolsFromSubgraph();

    if (!pools || pools.length === 0) {
      logger.warn("No pools found from the subgraph.");
      return [];
    }

    // Sort pools by volumeUSD in descending order, then take top 500
    const sortedByVolume = pools.sort((a, b) => Number(b.volumeUSD) - Number(a.volumeUSD));
    const top500Pools = sortedByVolume.slice(0, 500);

    logger.info(`Successfully fetched ${top500Pools.length} pools from subgraph`);
    return top500Pools;
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Error fetching pools from subgraph: ${err.message}`);
    } else {
      logger.error("Unknown error occurred while fetching pools from subgraph.");
    }
    return null;
  }
};

/**
 * Preload token symbols and their imgIds from tokens-cmc collection.
 * If multiple tokens have the same symbol, also index by name for fallback.
 */
export const preloadTokenImages = async (): Promise<{
  symbolMap: Map<string, number[]>;
  nameMap: Map<string, number>;
}> => {
  const symbolMap = new Map<string, number[]>();
  const nameMap = new Map<string, number>();
  const tokensCmcCollection = db.collection("tokens-cmc");
  const snapshot = await tokensCmcCollection.get();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.symbol) {
      const imgId = Number(data.id);
      if (!isNaN(imgId)) {
        // Map symbol to array of imgIds (for non-unique symbols)
        const upperSymbol = data.symbol.toUpperCase();
        if (!symbolMap.has(upperSymbol)) symbolMap.set(upperSymbol, []);
        symbolMap.get(upperSymbol)!.push(imgId);
        // Map name to imgId for fallback
        if (data.name) nameMap.set(data.name, imgId);
      }
    }
  });

  return { symbolMap, nameMap };
};

// Function to fetch recent swaps from the subgraph
export const getSwapsV4 = async (contractAddress: string): Promise<SwapDataV4[] | null> => {
  try {
    /**
     * Fetch recent swaps from the subgraph for a specific pair.
     * This will attempt to fetch the data 5 times, similar to the previous pairs fetching logic.
     */
    const fetchSwapsFromSubgraph = async (contractAddress: string): Promise<SwapDataV4[]> => {
      let skip = 0;
      let allSwaps: SwapDataV4[] = [];

      try {
        // Fetch swaps 5 times
        for (let i = 0; i < 1; i++) {
          const swaps = await fetchSwaps(contractAddress, skip);

          // Convert string fields to numbers
          const parsedSwaps = swaps.map((swap: any) => ({
            amount0: parseFloat(swap.amount0),
            amount1: parseFloat(swap.amount1),
            amountUSD: parseFloat(swap.amountUSD),
            timestamp: parseInt(swap.timestamp, 10),
          }));

          allSwaps = allSwaps.concat(parsedSwaps);

          // Stop fetching if fewer than 1000 items are returned
          if (swaps.length < 1000) {
            break;
          }

          skip += 1000;
          logger.info(`Downloading swaps: ${skip} of 5000`);
        }

        return allSwaps;
      } catch (err: unknown) {
        if (err instanceof Error) {
          logger.error(`Error fetching recent swaps from subgraph: ${err.message}`);
        } else {
          logger.error("Unknown error occurred while fetching recent swaps from subgraph.");
        }
        return [];
      }
    };
    // Fetch all swaps directly from the subgraph
    const swaps = await fetchSwapsFromSubgraph(contractAddress);

    if (!swaps || swaps.length === 0) {
      logger.warn("No swaps found for the given contract address.");
      return [];
    }

    // Sort swaps by timestamp in descending order
    const sortedSwaps = swaps.sort((a, b) => b.timestamp - a.timestamp);

    if(await updateSwapsToPools(contractAddress, sortedSwaps)){
      logger.info(`Updated swaps to pool: ${contractAddress}`);

    }

    return sortedSwaps;
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Error reloading swaps: ${err.message}`);
    } else {
      logger.error("Unknown error occurred while reloading swaps.");
    }
    return null;
  }
};



export default {
  getPoolsUniswap,
  getSwapsV4,
  preloadTokenImages
};
