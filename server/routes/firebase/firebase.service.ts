import { Timestamp } from "firebase-admin/firestore";
import logger from "../../utils/logger";
import { db } from "./firebase.config";

import ApiError from "../../utils/api-error";
import { PoolData } from ".types/subgraph/Pools";
import { TokenDetails } from ".types/TokenDetails";
import { SwapDataV4 } from ".types/subgraph/Swaps";

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
    getTokenByAddress, // Export the renamed function
};
