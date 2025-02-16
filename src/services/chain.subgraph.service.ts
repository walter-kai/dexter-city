import { db } from "../config/firebase";
import admin from "firebase-admin";
import logger from "../config/logger";
import { CoinMarketCap, Subgraph } from "../../client/src/models/Token";
import coinMarketCapService from "./chain.coinmarketcap.service";
import { fetchMostLiquidPairsV2 as fetchMostLiquidPairsV2, fetchRecentSwapsV2 } from "./UniswapV2";
import { fetchSwapsV3, fetchTopPools } from "./UniswapV3";
import { updateSwapsToPools } from "./chain.service";

// Function to fetch recent swaps from the subgraph
export const getSwapsV3 = async (contractAddress: string): Promise<Subgraph.SwapDataV3[] | null> => {
  try {
    /**
     * Fetch recent swaps from the subgraph for a specific pair.
     * This will attempt to fetch the data 5 times, similar to the previous pairs fetching logic.
     */
    const fetchSwapsFromSubgraph = async (contractAddress: string): Promise<Subgraph.SwapDataV3[]> => {
      let skip = 0;
      let allSwaps: Subgraph.SwapDataV3[] = [];

      try {
        // Fetch swaps 5 times
        for (let i = 0; i < 1; i++) {
          const swaps = await fetchSwapsV3(contractAddress, skip);

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

// Function to fetch recent swaps from the subgraph
export const getSwaps = async (contractAddress: string): Promise<Subgraph.SwapDataV2[] | null> => {
  try {
    /**
     * Fetch recent swaps from the subgraph for a specific pair.
     * This will attempt to fetch the data 5 times, similar to the previous pairs fetching logic.
     */
    const fetchSwapsFromSubgraph = async (contractAddress: string): Promise<Subgraph.SwapDataV2[]> => {
      let skip = 0;
      let allSwaps: Subgraph.SwapDataV2[] = [];

      try {
        // Fetch swaps 5 times
        for (let i = 0; i < 5; i++) {
          // const result = await client
          //   .query(getRecentSwapsQuery(contractAddress, skip), { skip }) // Using pairName and skip for recent swaps
          //   .toPromise();

          // if (result.error) {
          //   throw new Error(result.error.message);
          // }

          const swaps = await fetchRecentSwapsV2(contractAddress, skip);

          // Convert string fields to numbers
          const parsedSwaps = swaps.map((swap: any) => ({
            amount0In: parseFloat(swap.amount0In),
            amount0Out: parseFloat(swap.amount0Out),
            amount1In: parseFloat(swap.amount1In),
            amount1Out: parseFloat(swap.amount1Out),
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

        return allSwaps as Subgraph.SwapDataV2[];
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
 * Get specific pairs from Firestore based on a list of pair symbols.
 * This will use a hardcoded list of pairs if pairSymbols is null.
 */
const getPairs = async (pairSymbols: string[] = []): Promise<Subgraph.PoolData[] | null> => {
  try {
    const tokensCollection = db.collection("pairs-uniswap");

    // Hardcoded list of pairs
    const hardcodedPairs = [
      "ETH:MYSTERY:WETH",
      "ETH:MOODENG:WETH",
      "ETH:TRUMP:WETH",
      "ETH:WOO:WETH",
    ];

    // If pairSymbols is null, use the hardcoded list of pairs
    const pairsToQuery = pairSymbols.length > 0 ? pairSymbols : hardcodedPairs;

    // Fetch pairs from Firestore
    const tokenSnapshot = await tokensCollection.where(admin.firestore.FieldPath.documentId(), "in", pairsToQuery).get();

    if (tokenSnapshot.empty) {
      logger.warn("No pairs found in Firestore for the given symbols.");
      return [];
    }

    const pairs: Subgraph.PoolData[] = tokenSnapshot.docs.map((doc) => doc.data() as Subgraph.PoolData);
    return pairs;
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Error fetching pairs from Firestore: ${err.message}`);
    } else {
      logger.error("Unknown error occurred while fetching pairs from Firestore.");
    }
    return null;
  }
};

/**
 * Get top 100 pools from Firestore, sorted by volumeUSD in descending order first,
 * then sorted by token0.symbol in descending order.
 */
const getPools = async (): Promise<Subgraph.PoolData[] | null> => {
  try {
    const poolsCollection = db.collection("pools-uniswap");

    // Fetch all pools first (potentially large)
    const poolSnapshot = await poolsCollection.get();

    if (poolSnapshot.empty) {
      logger.warn("No pools found in Firestore.");
      return [];
    }

    // Extract data and sort by volumeUSD (descending)
    const sortedByVolume: Subgraph.PoolData[] = poolSnapshot.docs
      .map((doc) => doc.data() as Subgraph.PoolData)
      .sort((a, b) => b.volumeUSD - a.volumeUSD);

    // Take the top 100 by volume
    const top100Pools = sortedByVolume.slice(0, 200);

    // Sort the top 100 pools by token0.symbol in descending order
    top100Pools.sort((a, b) => b.token0.symbol.localeCompare(a.token0.symbol));

    return top100Pools;
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Error fetching pools from Firestore: ${err.message}`);
    } else {
      logger.error("Unknown error occurred while fetching pools from Firestore.");
    }
    return null;
  }
};




/**
 * Reload pairs from the subgraph and write to Firestore.
 */
const reloadPairs = async (): Promise<Subgraph.PoolData[] | null> => {
  try {
    const tokensCollection = db.collection("pairs-uniswap");
    const tokensCmcCollection = db.collection("tokens-cmc");
  
    /**
     * Preload token symbols and their imgIds from tokens-cmc collection
     */
    const preloadTokenImages = async (): Promise<Map<string, number | null>> => {
      const tokenMap = new Map<string, number | null>();
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
  
/**
 * Fetch recent pairs from the subgraph and get the corresponding token images
 */
const fetchPairsFromSubgraph = async (): Promise<Subgraph.PoolData[]> => {
  let skip = 0;
  let allPairs: Subgraph.PoolData[] = [];

  try {
    // Load token images once before looping
    const tokenImageMap = await preloadTokenImages();

    for (let i = 0; i < 5; i++) {
      const pairs = await fetchMostLiquidPairsV2(skip);
      const batch = db.batch();

      for (const pair of pairs) {
        const token0ImgId = tokenImageMap.get(pair.token0.symbol) ?? 0;
        const token1ImgId = tokenImageMap.get(pair.token1.symbol) ?? 0;


        // Construct the pair document using interfaces
        const pairData: Subgraph.PoolData = {
          ...pair,
          // id: pair.id,
          lastUpdated: new Date(),
          // name: pair.name,
          network: "Ethereum",
          // volumeUSD: pair.volumeUSD,
          // token0: {
          //   ...pair.token0,
          //   // address: pair.token0.address,
          //   // symbol: pair.token0.symbol,
          //   // name: pair.token0.name,
          //   imgId: token0ImgId,
          //   // volume: pair.token0.volume,
          //   // price: pair.token0.price,
          // },
          // token1: {
          //   ...pair.token1,
          //   // address: pair.token1.address,
          //   // symbol: pair.token1.symbol,
          //   // name: pair.token1.name,
          //   imgId: token1ImgId,
          //   // volume: pair.token1.volume,
          //   // price: pair.token1.price,
          // },
        };

        const pairDocRef = tokensCollection.doc(pair.name);
        batch.set(pairDocRef, pairData, { merge: true });

        allPairs.push(pairData);
      }

      // Commit all Firestore writes in a batch
      await batch.commit();

      if (pairs.length < 1000) break;

      skip += 1000;
      logger.info(`Downloading pairs: ${skip} of 5000`);
    }

    return allPairs;
  } catch (err: unknown) {
    logger.error(
      `Error fetching pairs from subgraph: ${
        err instanceof Error ? err.message : "Unknown error"
      }`
    );
    return [];
  }
};

    // Fetch pairs from the subgraph and store them
    const pairs = await fetchPairsFromSubgraph();
  
    if (pairs.length === 0) {
      logger.warn("No pairs found for the given query.");
      return [];
    }
  
    return pairs;
  } catch (err: unknown) {
    logger.error(
      `Error reloading pairs: ${err instanceof Error ? err.message : "Unknown error"}`
    );
    return null;
  }
  
};

/**
 * Reload pairs from the subgraph and write to Firestore.
 */
const reloadPools = async (): Promise<Subgraph.PoolData[] | null> => {
  try {
    const tokensCollection = db.collection("pools-uniswap");
    const tokensCmcCollection = db.collection("tokens-cmc");
  
    /**
     * Preload token symbols and their imgIds from tokens-cmc collection
     */
    const preloadTokenImages = async (): Promise<Map<string, number | null>> => {
      const tokenMap = new Map<string, number | null>();
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
          const pools = await fetchTopPools(skip);
          const batch = db.batch();

          for (const pool of pools) {
            const token0ImgId = tokenImageMap.get(pool.token0.symbol) ?? 0;
            const token1ImgId = tokenImageMap.get(pool.token1.symbol) ?? 0;


            // Construct the pair document using interfaces
            const poolData: Subgraph.PoolData = {
              address: pool.address,
              lastUpdated: new Date(),
              name: pool.name,
              network: "Ethereum",
              volumeUSD: pool.volumeUSD,
              token0: {
                address: pool.token0.address,
                symbol: pool.token0.symbol,
                name: pool.token0.name,
                imgId: token0ImgId,
                volume: pool.token0.volume,
                price: pool.token0.price,
              },
              token1: {
                address: pool.token1.address,
                symbol: pool.token1.symbol,
                name: pool.token1.name,
                imgId: token1ImgId,
                volume: pool.token1.volume,
                price: pool.token1.price,
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
          logger.info(`Downloading pools: ${skip} of 5000`);
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

export default {
  getSwapsV3,
  getSwaps,
  getPools,
  getPairs,
  reloadPairs,
  reloadPools
};
