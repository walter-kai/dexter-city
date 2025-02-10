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

/**
 * Reload pairs from the subgraph and write to Firestore.
 */
const reloadPairs = async (): Promise<Subgraph.PairData[] | null> => {
  try {
    const tokensCollection = db.collection("pairs-uniswap");
    const tokensCmcCollection = db.collection("tokens-cmc");

    /**
     * Fetch recent pairs from the subgraph and get the corresponding token images
     */
    const fetchPairsFromSubgraph = async (): Promise<Subgraph.PairData[]> => {
      let skip = 0;
      let allPairs: Subgraph.PairData[] = [];

      try {
        // Fetch pairs 5 times, adjust the query accordingly
        for (let i = 0; i < 5; i++) {
          const result = await client
            .query(getMostLiquidPairsQuery(skip), { skip })
            .toPromise();

          if (result.error) {
            throw new Error(result.error.message);
          }

          const pairs = result.data?.pairs || [];

          // Process each pair
          for (const pair of pairs) {
            const token0Symbol = pair.token0.symbol;
            const token1Symbol = pair.token1.symbol;

            // Get the imgId for token0 from the tokens-cmc collection
            const token0Doc = await tokensCmcCollection
              .where("symbol", "==", token0Symbol)
              .limit(1)
              .get();
            const token0ImgId = token0Doc.empty
              ? null
              : token0Doc.docs[0].data().id;

            // Get the imgId for token1 from the tokens-cmc collection
            const token1Doc = await tokensCmcCollection
              .where("symbol", "==", token1Symbol)
              .limit(1)
              .get();
            const token1ImgId = token1Doc.empty
              ? null
              : token1Doc.docs[0].data().id;

            // Construct the pair document with all the required data
            const pairData = {
              __typename: "Pair",
              id: pair.id,
              lastUpdated: new Date(),  // Timestamp of when the pair is updated
              name: pair.name,
              network: pair.network,
              token0ImgId: token0ImgId,
              token1ImgId: token1ImgId,
              token0Price: pair.token0Price,
              token1Price: pair.token1Price,
              txCount: pair.txCount,
              volumeToken0: pair.volumeToken0,
              volumeToken1: pair.volumeToken1,
              volumeUSD: pair.volumeUSD,
            };

            // Save the pair data in Firestore
            await tokensCollection.doc(`ETH:${token0Symbol}:${token1Symbol}`).set(pairData, { merge: true });

            allPairs.push(pairData);
          }

          // Stop fetching if fewer than 1000 items are returned
          if (pairs.length < 1000) {
            break;
          }

          skip += 1000;
          logger.info(`Downloading pairs: ${skip} of 5000`);
        }

        return allPairs;
      } catch (err: unknown) {
        if (err instanceof Error) {
          logger.error(`Error fetching pairs from subgraph: ${err.message}`);
        } else {
          logger.error("Unknown error occurred while fetching pairs from subgraph.");
        }
        return [];
      }
    };

    // Fetch pairs from the subgraph and store them
    const pairs = await fetchPairsFromSubgraph();

    if (!pairs || pairs.length === 0) {
      logger.warn("No pairs found for the given query.");
      return [];
    }

    return pairs;
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Error reloading pairs: ${err.message}`);
    } else {
      logger.error("Unknown error occurred while reloading pairs.");
    }
    return null;
  }
};


export default {
  getSwaps,
  getPairs,
  reloadPairs
};
