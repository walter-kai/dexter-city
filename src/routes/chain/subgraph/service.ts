import { db } from "../../../config/firebase";
import admin from "firebase-admin";
import logger from "../../../config/logger";
import { fetchSwaps, fetchTopDailyPools } from "./UniswapV4";
import { updateSwapsToPools } from "../../firebase/firebase.service";
import { SwapDataV4 } from "@/models/subgraph/Swaps";
import { PoolData } from "@/models/subgraph/Pools";

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
  getSwapsV4,
  preloadTokenImages
};
