import { Timestamp } from "firebase-admin/firestore";
import logger from "../../config/logger";
import { db } from "../../config/firebase";

import ApiError from "../../utils/api-error";
import { PoolData } from "@/models/subgraph/Pools";
import { TokenDetails } from ".vscode/models/TokenDetails";
import { SwapDataV4 } from "@/models/subgraph/Swaps";

/**
 * Updates swaps in the Firestore database for the matching pool in dayPools-uniswap/2025-06-18.
 *
 * @param {string} address - The pool address.
 * @param {Subgraph.SwapDataV4[]} swaps - Array of swap data to update.
 * @returns {Promise<boolean>} - Returns true if successful.
 */
export async function updateSwapsToPools(address: string, swaps: SwapDataV4[]): Promise<boolean> {
  try {
    const docRef = db.collection("dayPools-uniswap").doc("2025-06-18");
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new ApiError(404, `Can't find dayPools-uniswap/2025-06-18`);
    }
    const data = doc.data();
    if (!data || !Array.isArray(data.pools)) {
      throw new ApiError(404, `No pools array in dayPools-uniswap/2025-06-18`);
    }
    // Find and update the pool by address
    let found = false;
    const pools = data.pools.map((pool: any) => {
      if (pool.address === address) {
        found = true;
        return { ...pool, swaps };
      }
      return pool;
    });
    if (!found) {
      throw new ApiError(404, `Can't find pool with address: ${address} in dayPools-uniswap/2025-06-18`);
    }
    await docRef.update({ pools });
    logger.info(`Updated swaps for pool ${address} in dayPools-uniswap/2025-06-18.`);
    return true;
  } catch (error) {
    logger.error(`Error updating swaps for pool ${address} in dayPools-uniswap/2025-06-18: ${error}`);
    throw error;
  }
}


/**
 * Get top 100 pools from Firestore, sorted by volumeUSD in descending order first,
 * then sorted by token0.symbol in descending order.
 */
const getPoolsUniswap = async (): Promise<PoolData[] | null> => {
    try {
      const poolsCollection = db.collection("masterPool-uniswap");
  
      // Fetch all pools first (potentially large)
      const poolSnapshot = await poolsCollection.get();
  
      if (poolSnapshot.empty) {
        logger.warn("No pools found in Firestore.");
        return [];
      }
  
      // Extract data and sort by volumeUSD (descending)
      const sortedByTxCount: PoolData[] = poolSnapshot.docs
        .map((doc) => doc.data() as PoolData)
        .sort((a, b) => Number(b.txCount) - Number(a.txCount));
  
      // Take the top 500 by volume
      const top500Pools = sortedByTxCount.slice(0, 500);
  
      // Sort the top 100 pools by token0.symbol in descending order
      // top500Pools.sort((a, b) => b.token0.symbol.localeCompare(a.token0.symbol));
  
      return top500Pools;
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
export const getTokenByAddress = async (tokenAddress: string): Promise<TokenDetails | null> => {
  try {
    const tokensCollection = db.collection("tokens-cmc");
    const querySnapshot = await tokensCollection.where("platform.token_address", "==", tokenAddress).get();

    if (querySnapshot.empty) {
      throw new ApiError(404, `Token with address ${tokenAddress} not found.`);
    }

    const tokenDoc = querySnapshot.docs[0];
    return tokenDoc.data() as TokenDetails;
  } catch (error) {
    logger.error(`Error fetching token with address ${tokenAddress}: ${error}`);
    throw error;
  }
};



export default {
    getPoolsUniswap,
    getTokenByAddress, // Export the renamed function
};
