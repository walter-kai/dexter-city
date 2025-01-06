import { db } from "../config/firebase";
import admin from "firebase-admin";
import { Timestamp } from "@google-cloud/firestore";
import logger from "../config/logger";
import {coinmarketcap} from "../../client/src/models/Token"

// Define the API base URL and endpoint
const BASE_URL = "https://pro-api.coinmarketcap.com";
const API_KEY = "f669f32d-181b-495b-865c-97eb53373232"; // Your API key

interface Cryptocurrency {
  id: number;
  name: string;
  symbol: string;
  cmc_rank: number;
  last_updated: string;
  price: string;
}

interface ApiResponse {
  data: Cryptocurrency[];
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
  };
}

const reload = async (
  start: number = 1,
  limit: number = 1000, // Reduced limit per request
  sortDir: string = "desc",
): Promise<Cryptocurrency[] | null> => {
  const endpoint = "/v1/cryptocurrency/listings/latest";
  let hasMoreData = true;

  while (hasMoreData) {
    const queryParams = new URLSearchParams({
      start: start.toString(),
      limit: limit.toString(),
      sort_dir: sortDir,
    });

    try {
      const response = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`, {
        headers: {
          "X-CMC_PRO_API_KEY": API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json: ApiResponse = await response.json();

      if (json.status.error_code !== 0) {
        throw new Error(json.status.error_message || "Unknown API error");
      }

      // Log the response data
      logger.info(`Fetched ${json.data.length} cryptocurrency entries.`);

      // Clear and update the Firestore collection with the fetched data for this batch
      const tokensCollection = db.collection("tokens-cmc");
      const batchWrite = db.batch();

      json.data.forEach((token) => {
        const modifiedName = token.name.trim().replace(/\s+/g, "").replace(/\//g, "|");
        const modifiedSymbol = token.symbol.trim().replace(/\s+/g, "").replace(/\//g, "|");

        const tokenRef = tokensCollection.doc(token.id.toString() + ":" + modifiedSymbol + ":" + modifiedName);

        batchWrite.set(tokenRef, {
          ...token,
          lastUpdated: Timestamp.now(),
        }, { merge: true });
      });

      // Commit the batch write for the current fetch
      await batchWrite.commit();
      logger.info("Batch write completed for current batch.");

      // Check if there is more data to fetch
      if (json.data.length < limit) {
        hasMoreData = false; // No more data to fetch
      } else {
        start += limit; // Increase the start parameter for the next request
      }
    } catch (err) {
      logger.error(
        `Error fetching cryptocurrency data: ${
          err instanceof Error ? err.message : "An error occurred"
        }`
      );
      return null;
    }
  }

  logger.info("Successfully updated tokens:cmc collection.");
  return null;
};



// Create a new function get that accepts a symbol and returns the id
const get = async (symbols: string[]): Promise<coinmarketcap.CryptoAsset[] | null> => {
  try {
    const tokensCollection = db.collection("tokens-cmc");
    // Convert all symbols to uppercase (standardize case)
    const upperCaseSymbols = symbols.map(symbol => symbol.toUpperCase());

    // Query the collection where symbol is in the provided uppercase symbols array
    const tokenSnapshot = await tokensCollection
      .where("symbol", "in", upperCaseSymbols)
      .get();

    if (tokenSnapshot.empty) {
      logger.warn(`No tokens found for symbols: ${symbols.join(", ")}`);
      return [];
    }

    // Extract the full CryptoAsset objects for the tokens that match the symbols
    const cryptoAssets: coinmarketcap.CryptoAsset[] = tokenSnapshot.docs.map((doc) => {
      const token = doc.data() as coinmarketcap.CryptoAsset;
      return token;
    });

    return cryptoAssets;
  } catch (err) {
    logger.error(
      `Error fetching tokens by symbols: ${symbols.join(", ")}. ${
        err instanceof Error ? err.message : "An error occurred"
      }`
    );
    return null;
  }
};



export default {
  reload,
  get,
};
