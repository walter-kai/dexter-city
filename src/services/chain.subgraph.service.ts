import { createClient, cacheExchange, fetchExchange } from "urql";
import { db } from "../config/firebase";
import admin from "firebase-admin";
import logger from "../config/logger";
import { CoinMarketCap, Subgraph } from "../../client/src/models/Token";
import { getAllPairsQuery, getMostLiquidPairsQuery, getRecentSwapsQuery, getRecentSwapsQueryFromLastUpdate, useMostLiquidPairsQuery } from "./SubGraph";
import coinMarketCapService from "./chain.coinmarketcap.service"

// Create the client to interact with the subgraph
export const client = createClient({
  url: "https://gateway.thegraph.com/api/cf949c81dc1152037b34ecdea916c0a8/subgraphs/id/A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum",
  exchanges: [cacheExchange, fetchExchange],
});

/**
 * Save pairs to Firestore.
 */
const savePairsToFirestore = async (pairs: Subgraph.PairData[]): Promise<void> => {
  try {
    const tokensCollection = db.collection("pairs-uniswap");

    const savePromises = pairs.map(({ token0, token1, ...pair }) => {
      const pairName = `ETH:${token0.symbol}:${token1.symbol}`;
      
      const dataToSave = {
        ...pair,
        name: pairName,
        network: "Ethereum",
        lastUpdated: admin.firestore.Timestamp.now(),
      };
    
      return tokensCollection
        .doc(pairName)
        .set(dataToSave, { merge: false }); // Ensures overwriting, not merging
    });
    

    await Promise.all(savePromises);
    logger.info("All pairs successfully saved to Firestore.");
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Error saving pairs to Firestore: ${err.message}`);
    } else {
      logger.error("Unknown error occurred while saving pairs to Firestore.");
    }
  }
};

const getSwaps = async (contractAddress: string): Promise<Subgraph.SwapData[] | null> => {
  try {

    /**
     * Fetch recent swaps from the subgraph for a specific pair.
     * This will attempt to fetch the data 5 times, similar to the previous pairs fetching logic.
     */
    const fetchSwapsFromSubgraph = async (contractAddress: string): Promise<Subgraph.SwapData[]> => {
      let skip = 0;
      let allSwaps: Subgraph.SwapData[] = [];

      try {
        // Fetch swaps 5 times
        for (let i = 0; i < 5; i++) {
          const result = await client
            .query(getRecentSwapsQuery(contractAddress, skip), { skip }) // Using pairName and skip for recent swaps
            .toPromise();

          if (result.error) {
            throw new Error(result.error.message);
          }

          const swaps = result.data?.swaps || [];

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

        return allSwaps as Subgraph.SwapData[];
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
const getPairs = async (pairSymbols: string[] = []): Promise<Subgraph.PairData[] | null> => {
  try {
    const tokensCollection = db.collection("pairs-uniswap");

    // Hardcoded list of pairs
    const hardcodedPairs = [
      "ETH:ALPHA:WETH",
      "ETH:MYSTERY:WETH",
      "ETH:SPX:WETH",
      "ETH:FINE:WETH",
      "ETH:MOODENG:WETH",
      "ETH:SMARTCREDIT:WETH",
      "ETH:TRUMP:WETH",
      "ETH:WETH:TRUMP",
      "ETH:WETH:TRIBE",
      "ETH:WETH:ZKML",
      "ETH:EMAX:WETH",
      "ETH:WOO:USDC",
      "ETH:WOO:WETH",
      "ETH:TIDAL:USDC",
      "ETH:XCAD:USDC",
      "ETH:XCAD:USDT",
      "ETH:XCAD:WETH",
      "ETH:WETH:MEME",
    ];

    // If pairSymbols is null, use the hardcoded list of pairs
    const pairsToQuery = pairSymbols.length > 0 ? pairSymbols : hardcodedPairs;

    // Fetch pairs from Firestore
    const tokenSnapshot = await tokensCollection.where(admin.firestore.FieldPath.documentId(), "in", pairsToQuery).get();

    if (tokenSnapshot.empty) {
      logger.warn("No pairs found in Firestore for the given symbols.");
      return [];
    }

    const pairs: Subgraph.PairData[] = tokenSnapshot.docs.map((doc) => doc.data() as Subgraph.PairData);
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

export default {
  getSwaps,
  getPairs,
};
