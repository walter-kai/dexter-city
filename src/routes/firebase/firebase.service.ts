import { Timestamp } from "firebase-admin/firestore";
import logger from "../../config/logger";
import { db } from "../../config/firebase";
import { Subgraph } from "../../../client/src/models/Token";
import ApiError from "../../utils/api-error";

/**
 * Updates swaps in the Firestore database for the matching pool document.
 *
 * @param {string} address - The pool address.
 * @param {Subgraph.SwapDataV3[]} swaps - Array of swap data to update.
 * @returns {Promise<boolean>} - Returns true if successful.
 */
export async function updateSwapsToPools(address: string, swaps: Subgraph.SwapDataV3[]): Promise<boolean> {
  try {
    const poolsCollection = db.collection("pools-uniswap");
    const querySnapshot = await poolsCollection.where("address", "==", address).get();

    if (querySnapshot.empty) {
      throw new ApiError(404, `Can't find pool with address: ${address}`);
    }

    const poolDoc = querySnapshot.docs[0];
    const swapsCollection = poolsCollection.doc(poolDoc.id).collection("swaps");

    // Fetch existing swaps to avoid duplication
    const existingSwapsSnapshot = await swapsCollection.get();
    const existingSwapTimestamps = new Set(
      existingSwapsSnapshot.docs.map((doc) => doc.data().timestamp)
    );

    // Filter out swaps that already exist in Firestore
    const newSwaps = swaps.filter((swap) => !existingSwapTimestamps.has(swap.timestamp));

    if (newSwaps.length > 0) {
      const batch = db.batch();
      newSwaps.forEach((swap) => {
        // Create a custom document ID with the format "timestamp:amount0"
        const docId = `${swap.timestamp}:${swap.amount0}`;
        const newSwapRef = swapsCollection.doc(docId);  // Use the custom docId
        batch.set(newSwapRef, swap);
      });

      await batch.commit();
      logger.info(`Updated swaps for pool ${address} with ${newSwaps.length} new entries.`);
    } else {
      logger.info(`No new swaps to update for pool ${address}.`);
    }

    return true;
  } catch (error) {
    logger.error(`Error updating swaps for pool ${address}: ${error}`);
    throw error;
  }
}


/**
 * Get top 100 pools from Firestore, sorted by volumeUSD in descending order first,
 * then sorted by token0.symbol in descending order.
 */
const getPoolsUniswap = async (): Promise<Subgraph.PoolData[] | null> => {
    try {
      const poolsCollection = db.collection("pools-uniswap");
  
      // Fetch all pools first (potentially large)
      const poolSnapshot = await poolsCollection.get();
  
      if (poolSnapshot.empty) {
        logger.warn("No pools found in Firestore.");
        return [];
      }
  
      // Extract data and sort by volumeUSD (descending)
      const sortedByTxCount: Subgraph.PoolData[] = poolSnapshot.docs
        .map((doc) => doc.data() as Subgraph.PoolData)
        .sort((a, b) => b.txCount - a.txCount);
  
      // Take the top 100 by volume
      const top100Pools = sortedByTxCount.slice(0, 200);
  
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
 * Fetch a single token from Firestore by its contract address.
 *
 * @param {string} tokenAddress - The contract address of the token.
 * @returns {Promise<Subgraph.TokenDetails | null>} - Returns the token data if found, otherwise null.
 */
export const getTokenByAddress = async (tokenAddress: string): Promise<Subgraph.TokenDetails | null> => {
  try {
    const tokensCollection = db.collection("tokens-cmc");
    const querySnapshot = await tokensCollection.where("platform.token_address", "==", tokenAddress).get();

    if (querySnapshot.empty) {
      throw new ApiError(404, `Token with address ${tokenAddress} not found.`);
    }

    const tokenDoc = querySnapshot.docs[0];
    return tokenDoc.data() as Subgraph.TokenDetails;
  } catch (error) {
    logger.error(`Error fetching token with address ${tokenAddress}: ${error}`);
    throw error;
  }
};

export default {
    getPools: getPoolsUniswap,
    getTokenByAddress, // Export the renamed function
};
