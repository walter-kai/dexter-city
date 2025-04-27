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


export default { updateSwapsToPools };
