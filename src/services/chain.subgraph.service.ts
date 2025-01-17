import { createClient, cacheExchange, fetchExchange } from "urql";
import { db } from "../config/firebase";
import admin from "firebase-admin";
import logger from "../config/logger";
import { CoinMarketCap, Subgraph } from "../../client/src/models/Token";
import { getAllPairsQuery, getRecentSwapsQuery, getRecentSwapsQueryFromLastUpdate } from "./SubGraph";
import coinMarketCapService from "./chain.coinmarketcap.service"

// Create the client to interact with the subgraph
export const client = createClient({
  url: "https://gateway.thegraph.com/api/cf949c81dc1152037b34ecdea916c0a8/subgraphs/id/A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum",
  exchanges: [cacheExchange, fetchExchange],
});

/**
 * Fetch all pairs from the subgraph, fetching a fixed number of 5 times.
 */
const fetchPairsFromSubgraph = async (): Promise<Subgraph.PairData[]> => {
  let skip = 0;
  let allPairs: Subgraph.PairData[] = [];
  
  try {
    // Fetch pairs 5 times
    for (let i = 0; i < 5; i++) {
      const result = await client
        .query(getAllPairsQuery(skip), { skip })
        .toPromise();

      if (result.error) {
        throw new Error(result.error.message);
      }

      const pairs = result.data?.pairs || [];
      allPairs = allPairs.concat(pairs);

      // Stop fetching if fewer than 1000 items are returned
      if (pairs.length < 1000) {
        break;
      }

      skip += 1000;
      logger.info(`Downloading pair: ${skip} of 5000`);
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

/**
 * Reload pairs and save to Firestore.
 */
/**
 * Reload pairs and save to Firestore.
 */
const reloadPairs = async (): Promise<Subgraph.PairData[] | null> => {
  try {
    const pairs = await fetchPairsFromSubgraph();
    if (!pairs.length) {
      logger.warn("No pairs retrieved from subgraph.");
      return null;
    }

    // Extract symbols for both tokens in pairs and remove duplicates using Set
    const symbols = Array.from(new Set(pairs.flatMap(pair => [pair.token0.symbol, pair.token1.symbol])));

    // Fetch the tokens only once
    const tokens = await coinMarketCapService.getTokens(symbols);
    if (!tokens) {
      logger.warn("No tokens found for the given symbols.");
      return null;
    }

    // Map tokens by their symbol for quick access
    const tokenMap = new Map<string, CoinMarketCap.Token>();
    tokens.forEach(token => tokenMap.set(token.symbol, token));

    // Update pairs with token image IDs
    const pairsWithImg = pairs.map(pair => {
      const token0 = tokenMap.get(pair.token0.symbol);
      const token1 = tokenMap.get(pair.token1.symbol);

      if (token0 && token1) {
        return {
          ...pair,
          token0ImgId: token0.id,
          token1ImgId: token1.id
        };
      }

      // If a token is missing, log the issue and skip the pair
      logger.warn(`Missing token data for pair: ${pair.id}`);
      return pair;  // Keep the pair as is if any token is missing
    });

    await savePairsToFirestore(pairsWithImg);
    return pairsWithImg;
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Error in reloadPairs: ${err.message}`);
    } else {
      logger.error("Unknown error occurred in reloadPairs.");
    }
    return null;
  }
};

const reloadSwaps = async (contractAddress: string): Promise<Subgraph.SwapData[] | null> => {
  try {
    const tokensCollection = db.collection("pairs-uniswap");

    // Check if the pair exists in Firestore by contract address
    const tokenSnapshot = await tokensCollection.where("id", "==", contractAddress).get();

    if (tokenSnapshot.empty) {
      logger.warn("No pairs found in Firestore for the given contract address.");
      return [];
    }

    const pairDoc = tokenSnapshot.docs[0];
    // Check if the 'swaps' subcollection exists
    const swapsCollection = pairDoc.ref.collection("swaps");
    const swapsSnapshot = await swapsCollection.get();

    let swaps: Subgraph.SwapData[] = [];

    if (!swapsSnapshot.empty) {
      // If swaps exist in the subcollection, return them
      swaps = swapsSnapshot.docs.map((doc) => doc.data() as Subgraph.SwapData);

      // Sort swaps by timestamp in descending order
      swaps = swaps.sort((a, b) => b.timestamp - a.timestamp);

      // Get the most recent swap timestamp after sorting
      const mostRecentSwap = swaps[0];
      const mostRecentTimestamp = mostRecentSwap.timestamp;

      // Fetch more swaps from the subgraph, passing the most recent timestamp
      const updatedSwaps = await updateSwapsFromSubgraph(contractAddress, mostRecentTimestamp);
      swaps = swaps.concat(updatedSwaps);
    } else {
      // If no swaps are found in Firestore, fetch from the subgraph
      const swapsFromSubgraph = await fetchSwapsFromSubgraph(contractAddress);
      swaps = swapsFromSubgraph;
    }

    // Sort swaps by timestamp in descending order (again after new swaps are added)
    swaps = swaps.sort((a, b) => b.timestamp - a.timestamp);

    // Save the new swaps to Firestore
    if (swaps.length > 0) {
      const batch = db.batch();

      // Add each swap to the Firestore collection
      swaps.forEach((swap) => {
        const swapRef = pairDoc.ref.collection("swaps").doc(); // Create a new document reference for each swap
        batch.set(swapRef, swap); // Set the swap data in Firestore
      });

      // Commit the batch write
      await batch.commit();
      logger.info(`Successfully saved ${swaps.length} swaps to Firestore.`);
    }

    return swaps;

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
        .query(getRecentSwapsQuery(contractAddress), { skip }) // Using pairName and skip for recent swaps
        .toPromise();

      if (result.error) {
        throw new Error(result.error.message);
      }

      const swaps = result.data?.swaps || [];
      allSwaps = allSwaps.concat(swaps);

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

/**
 * Fetch recent swaps from the subgraph for a specific pair, starting from the most recent timestamp.
 * This will attempt to fetch the data 5 times, similar to the previous swaps fetching logic.
 */
const updateSwapsFromSubgraph = async (contractAddress: string, startTimestamp: number): Promise<Subgraph.SwapData[]> => {
  let skip = 0;
  let allSwaps: Subgraph.SwapData[] = [];

  try {
    // Fetch swaps 5 times
    for (let i = 0; i < 5; i++) {
      const result = await client
        .query(getRecentSwapsQueryFromLastUpdate(contractAddress, startTimestamp), { skip }) // Pass the startTimestamp to the query
        .toPromise();

      if (result.error) {
        throw new Error(result.error.message);
      }

      const swaps = result.data?.swaps || [];
      allSwaps = allSwaps.concat(swaps);

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
  reloadSwaps,
  reloadPairs,
  getPairs,
};
