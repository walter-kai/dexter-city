import { db } from "../../config/firebase";
import admin from "firebase-admin";
import logger from "../../config/logger";
import { CoinMarketCap, Subgraph } from "../../../client/src/models/Token";
import coinMarketCapService from "./chain.coinmarketcap.service";
// import { fetchMostLiquidPairsV2 as fetchMostLiquidPairsV2, fetchRecentSwapsV2 } from "./UniswapV2";
import { fetchSwaps, fetchTopPools } from "./UniswapV4";
import { updateSwapsToPools } from "../firebase/firebase.service";

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
  reloadPools
};
