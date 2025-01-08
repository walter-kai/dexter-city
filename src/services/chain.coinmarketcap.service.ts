import { db } from "../config/firebase";
import admin from "firebase-admin";
import { Timestamp } from "@google-cloud/firestore";
import logger from "../config/logger";
import { coinmarketcap } from "../../client/src/models/Token"

// Define the API base URL and endpoint
const BASE_URL = "https://pro-api.coinmarketcap.com";
const API_KEY = "f669f32d-181b-495b-865c-97eb53373232"; // Your API key


const reloadDexs = async (): Promise<void> => {
  const endpoint = "/v4/dex/listings/quotes";

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "X-CMC_PRO_API_KEY": API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    logger.info(`Fetched ${json.data.length} cryptocurrency entries.`);

    const tokensCollection = db.collection("dexs-cmc");
    const batchWrite = db.batch();

    json.data.forEach((token: any) => {
      const modifiedName = token.slug;
      const tokenRef = tokensCollection.doc(token.id.toString() + ":" + modifiedName);

      batchWrite.set(tokenRef, {
        ...token,
        lastUpdated: Timestamp.now(),
      }, { merge: true });
    });

    await batchWrite.commit();
    logger.info("Batch write completed for current batch.");
  } catch (err) {
    logger.error(
      `Error fetching cryptocurrency data: ${err instanceof Error ? err.message : "An error occurred"}`
    );
  }
  logger.info("Successfully updated tokens:cmc collection.");
};

const reloadPairs = async (network: string): Promise<boolean> => {
  const endpoint = "/v4/dex/spot-pairs/latest";
  let hasMoreData = true;
  let start: number = 1;
  let limit: number = 1000;

  while (hasMoreData) {
    const queryParams = new URLSearchParams({
      network_slug: network,
      // start: start.toString(),
      // limit: limit.toString(),
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

      const json = await response.json();

      if (json.status.error_code !== '0') {
        throw new Error(json.status.error_message || "Unknown API error");
      }

      logger.info(`Fetched ${json.data.length} cryptocurrency entries.`);

      if (!json.data || json.data.length === 0) {
        logger.warn("No data returned from the API.");
        break;
      }

      const tokensCollection = db.collection("pairs-cmc");
      const batchWrite = db.batch();

      json.data.forEach((token: any) => {
        const modifiedName = token.name.trim().replace(/\s+/g, "").replace(/\//g, "|");
        const modifiedSymbol = token.base_asset_symbol.trim().replace(/\s+/g, "").replace(/\//g, "|");

        const tokenRef = tokensCollection.doc(
          `${token.network_slug}:${modifiedSymbol}:${modifiedName}`
        );

        const tokenData = {
          ...token,
          lastUpdated: Timestamp.now(),
        };

        batchWrite.set(tokenRef, tokenData, { merge: true });
      });

      await batchWrite.commit();
      logger.info("Batch write completed for current batch.");

      if (json.data.length < limit) {
        hasMoreData = false;
      } else {
        start += limit;
      }
    } catch (err) {
      logger.error(
        `Error fetching cryptocurrency data: ${err instanceof Error ? err.message : "An error occurred"}`
      );
      return false;
    }
  }

  logger.info("Successfully updated tokens:cmc collection.");
  return true;
};

const reloadTokens = async (
  start: number = 1,
  limit: number = 1000,
  sortDir: string = "desc",
): Promise<void> => {
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

      const json = await response.json();

      if (json.status.error_code !== '0') {
        throw new Error(json.status.error_message || "Unknown API error");
      }

      logger.info(`Fetched ${json.data.length} cryptocurrency entries.`);

      const tokensCollection = db.collection("tokens-cmc");
      const batchWrite = db.batch();

      json.data.forEach((token: any) => {
        const modifiedName = token.name.trim().replace(/\s+/g, "").replace(/\//g, "|");
        const modifiedSymbol = token.symbol.trim().replace(/\s+/g, "").replace(/\//g, "|");

        const tokenRef = tokensCollection.doc(
          token.id.toString() + ":" + modifiedSymbol + ":" + modifiedName
        );

        batchWrite.set(tokenRef, {
          ...token,
          lastUpdated: Timestamp.now(),
        }, { merge: true });
      });

      await batchWrite.commit();
      logger.info("Batch write completed for current batch.");

      if (json.data.length < limit) {
        hasMoreData = false;
      } else {
        start += limit;
      }
    } catch (err) {
      logger.error(
        `Error fetching cryptocurrency data: ${err instanceof Error ? err.message : "An error occurred"}`
      );
    }
  }

  logger.info("Successfully updated tokens:cmc collection.");
};

// Function to get tokens based on symbol
const getTokens = async (symbols: string[]): Promise<coinmarketcap.Token[] | null> => {
  try {
    const tokensCollection = db.collection("tokens-cmc");
    const upperCaseSymbols = symbols.map(symbol => symbol.toUpperCase());

    const tokenSnapshot = await tokensCollection
      .where("symbol", "in", upperCaseSymbols)
      .get();

    if (tokenSnapshot.empty) {
      logger.warn(`No tokens found for symbols: ${symbols.join(", ")}`);
      return [];
    }

    const tokens: coinmarketcap.Token[] = tokenSnapshot.docs.map((doc) => doc.data() as coinmarketcap.Token);

    return tokens;
  } catch (err) {
    logger.error(
      `Error fetching tokens by symbols: ${symbols.join(", ")}. ${err instanceof Error ? err.message : "An error occurred"}`
    );
    return null;
  }
};

// Function to get pairs based on symbols
const getPairs = async (): Promise<coinmarketcap.Token[] | null> => {
  try {
    const tokensCollection = db.collection("pairs-cmc");

    const tokenSnapshot = await tokensCollection.get();

    if (tokenSnapshot.empty) {
      logger.warn("No tokens found in the collection.");
      return [];
    }

    const tokens: coinmarketcap.Token[] = tokenSnapshot.docs.map((doc) => doc.data() as coinmarketcap.Token);

    return tokens;
  } catch (err) {
    logger.error(
      `Error fetching tokens from the collection. ${
        err instanceof Error ? err.message : "An error occurred"
      }`
    );
    return null;
  }
};


// Function to get all DEXs
const getDexs = async (): Promise<any[] | null> => {
  try {
    const tokensCollection = db.collection("dexs-cmc");
    const tokenSnapshot = await tokensCollection.get();

    if (tokenSnapshot.empty) {
      logger.warn("No tokens found in the collection.");
      return [];
    }

    const tokens: any[] = tokenSnapshot.docs.map((doc) => doc.data());

    return tokens;
  } catch (err) {
    logger.error(
      `Error fetching all tokens from the collection. ${err instanceof Error ? err.message : "An error occurred"}`
    );
    return null;
  }
};

export default {
  reloadDexs,
  reloadPairs,
  reloadTokens,
  getTokens,
  getPairs,
  getDexs
};
