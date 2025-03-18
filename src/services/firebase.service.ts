import { Subgraph } from "../../client/src/models/Token";
import { db } from "../config/firebase";
import logger from "../config/logger";

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
  


export default {
    getPools: getPoolsUniswap
  };
  