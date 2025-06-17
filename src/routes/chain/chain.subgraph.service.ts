import { db } from "../../config/firebase";
import admin from "firebase-admin";
import logger from "../../config/logger";
import { CoinMarketCap, Subgraph } from "../../../client/src/models/Token";
import coinMarketCapService from "./chain.coinmarketcap.service";
import { fetchSwaps, fetchTopAlltimePools, fetchTopDailyPools } from "./UniswapV4";
import { updateSwapsToPools } from "../firebase/firebase.service";

/**
 * Preload token symbols and their imgIds from tokens-cmc collection
 * Centralized function to avoid code duplication
 */
const preloadTokenImages = async (): Promise<Map<string, number | null>> => {
  const tokenMap = new Map<string, number | null>();
  const tokensCmcCollection = db.collection("tokens-cmc");
  const snapshot = await tokensCmcCollection.get();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.symbol) {
      const imgId = Number(data.id); // Ensure it's a number
      tokenMap.set(data.symbol, isNaN(imgId) ? null : imgId);
    }
  });

  return tokenMap;
};

// Function to fetch recent swaps from the subgraph
export const getSwapsV4 = async (contractAddress: string): Promise<Subgraph.SwapDataV4[] | null> => {
  try {
    /**
     * Fetch recent swaps from the subgraph for a specific pair.
     * This will attempt to fetch the data 5 times, similar to the previous pairs fetching logic.
     */
    const fetchSwapsFromSubgraph = async (contractAddress: string): Promise<Subgraph.SwapDataV4[]> => {
      let skip = 0;
      let allSwaps: Subgraph.SwapDataV4[] = [];

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


/**
 * Reload pairs from the subgraph and write to Firestore.
 */
const reloadPools = async (): Promise<Subgraph.PoolData[] | null> => {
  try {
    const tokensCollection = db.collection("pools-uniswap");
  
    /**
     * Fetch recent pairs from the subgraph and get the corresponding token images
     */
    const fetchPoolsFromSubgraph = async (): Promise<Subgraph.PoolData[]> => {
      let skip = 0;
      let allPools: Subgraph.PoolData[] = [];

      try {
        // Load token images once before looping
        const tokenImageMap = await preloadTokenImages();

        for (let i = 0; i < 1; i++) {
          const pools = await fetchTopAlltimePools(skip);
          const batch = db.batch();

          for (const pool of pools) {
            const token0ImgId = tokenImageMap.get(pool.token0.symbol.toUpperCase()) ?? 0;
            const token1ImgId = tokenImageMap.get(pool.token1.symbol.toUpperCase()) ?? 0;

            // Construct the pair document using interfaces
            const poolData: Subgraph.PoolData = {
              ...pool,
              lastUpdated: new Date(),
              network: "Ethereum",
              token0: {
                ...pool.token0,
                imgId: token0ImgId,
              },
              token1: {
                ...pool.token1,
                imgId: token1ImgId,
              },
            };

            const poolDocRef = tokensCollection.doc(pool.name);
            batch.set(poolDocRef, poolData, { merge: true });

            allPools.push(poolData);
          }

          // Commit all Firestore writes in a batch
          await batch.commit();

          if (pools.length < 1000) break;

          skip += 1000;
          logger.info(`Downloading pools: ${skip} of 1000`);
        }

        return allPools;
      } catch (err: unknown) {
        logger.error(
          `Error fetching pools from subgraph: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        return [];
      }
    };

    // Fetch pairs from the subgraph and store them
    const pools = await fetchPoolsFromSubgraph();
  
    if (pools.length === 0) {
      logger.warn("No pairs found for the given query.");
      return [];
    }
  
    return pools;
  } catch (err: unknown) {
    logger.error(
      `Error reloading pairs: ${err instanceof Error ? err.message : "Unknown error"}`
    );
    return null;
  }
  
};

/**
 * Reload daily pool stats from the subgraph and write to Firestore.
 * Filters for today's data only and stores all pools for today in a single document.
 * Ensures each pool address is only included once (most recent data).
 */
const reloadPoolsDay = async (): Promise<any | null> => {
  try {
    const dayPoolsCollection = db.collection("dayPools-uniswap");
  
    /**
     * Fetch daily pool data from the subgraph
     */
    const fetchDailyPoolsFromSubgraph = async (): Promise<any> => {
      const tokenImageMap = await preloadTokenImages();
      let skip = 0;
      
      try {
        const dailyPoolData = await fetchTopDailyPools(skip);
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        logger.info(`Filtering pool data for today: ${today}`);
        
        // Filter for today's data only
        const todayData = dailyPoolData.filter((dayData: any) => {
          const date = new Date(dayData.date * 1000);
          return date.toISOString().split('T')[0] === today;
        });
        
        if (todayData.length === 0) {
          logger.info(`No pool data found for today (${today})`);
          return { dateCount: 0, poolCount: 0, date: today };
        }
        
        logger.info(`Found ${todayData.length} pool entries for today`);
        
        // Use a map to track the latest data for each pool address
        // This ensures we only keep the most recent data when duplicates exist
        const poolsMap = new Map<string, Subgraph.PoolData>();
        
        // Process all pools for today
        for (const dayData of todayData) {
          // Convert pool data to the right format
          const pool = dayData.pool;
          const token0ImgId = tokenImageMap.get(pool.token0.symbol) ?? 0;
          const token1ImgId = tokenImageMap.get(pool.token1.symbol) ?? 0;
          
          const poolData: Subgraph.PoolData = {
            address: pool.id,
            name: `ETH:${pool.token0.symbol}:${pool.token1.symbol}`.replace(/[^a-zA-Z0-9:-]/g, "_"),
            lastUpdated: new Date(),
            network: "Ethereum",
            volumeUSD: parseFloat(dayData.volumeUSD || 0),
            txCount: parseInt(dayData.txCount || 0),
            date: today, // Include date in each pool data record
            token0: {
              address: pool.token0.id,
              symbol: pool.token0.symbol,
              name: pool.token0.name,
              imgId: token0ImgId,
            } as Subgraph.TokenDetails,
            token1: {
              address: pool.token1.id, 
              symbol: pool.token1.symbol,
              name: pool.token1.name,
              imgId: token1ImgId,
            } as Subgraph.TokenDetails,
          };
          
          // Store in map, overwriting any previous entry with the same address
          poolsMap.set(pool.id, poolData);
        }
        
        // Convert map values to array
        const uniquePools = Array.from(poolsMap.values());
        
        logger.info(`Processed ${uniquePools.length} unique pools for today (removed ${todayData.length - uniquePools.length} duplicates)`);
        
        // Store all of today's pools in a single document
        const docRef = dayPoolsCollection.doc(today);
        
        // Check if document already exists
        const existingDoc = await docRef.get();
        if (existingDoc.exists) {
          logger.info(`Updating existing document for ${today}`);
          
          // Merge with existing data if needed
          const existingData = existingDoc.data();
          const existingPools = existingData?.pools || [];
          
          // Create a map of existing pools by address for quick lookup
          const existingPoolsMap = new Map<string, Subgraph.PoolData>();
          existingPools.forEach((pool: Subgraph.PoolData) => {
            existingPoolsMap.set(pool.address, pool);
          });
          
          // Merge new pools, overwriting existing ones with the same address
          uniquePools.forEach(pool => {
            existingPoolsMap.set(pool.address, pool);
          });
          
          // Convert back to array
          const mergedPools = Array.from(existingPoolsMap.values());
          
          await docRef.update({
            pools: mergedPools,
            lastUpdated: new Date(),
            poolCount: mergedPools.length
          });
          
          logger.info(`Successfully updated document with ${mergedPools.length} pools for today (${today})`);
          
          return {
            dateCount: 1,
            poolCount: mergedPools.length,
            date: today
          };
        } else {
          // Create new document
          await docRef.set({
            date: today,
            pools: uniquePools,
            lastUpdated: new Date(),
            poolCount: uniquePools.length
          });
          
          logger.info(`Successfully created new document with ${uniquePools.length} pools for today (${today})`);
          
          return {
            dateCount: 1,
            poolCount: uniquePools.length,
            date: today
          };
        }
      } catch (err: unknown) {
        logger.error(
          `Error fetching daily pools from subgraph: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        return null;
      }
    };

    // Fetch daily pool data and store it
    return await fetchDailyPoolsFromSubgraph();
  } catch (err: unknown) {
    logger.error(
      `Error reloading daily pools: ${err instanceof Error ? err.message : "Unknown error"}`
    );
    return null;
  }
};

export default {
  getSwapsV4,
  reloadPools,
  reloadPoolsDay
};
