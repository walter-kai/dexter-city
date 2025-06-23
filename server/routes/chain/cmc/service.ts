import { db } from "../../../config/firebase";
// import admin from "firebase-admin";
import { Timestamp, FieldPath } from "@google-cloud/firestore";
import logger from "../../../config/logger";
import { CoinMarketCap } from "../../../../.types/CoinMarketCap"

// Define the API base URL and endpoint
const BASE_URL = "https://pro-api.coinmarketcap.com";
const API_KEY = "f669f32d-181b-495b-865c-97eb53373232"; // Your API key
// const BASE_URL = "https://api.coingecko.com/api/v3";
// const API_KEY = "f669f32d-181b-495b-865c-97eb53373232"; // Your API key

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

      if (json.status.error_code !== 0) {
        throw new Error(json.status.error_message || "Unknown API error");
      }

      logger.info(`Fetched ${json.data.length} cryptocurrency entries.`);

      const tokensCollection = db.collection("tokens-cmc");
      const batchWrite = db.batch();
      let addedCount = 0;
      let skippedCount = 0;

      // Check existing tokens in batch to avoid individual reads
      const tokenIds = json.data.map((token: any) => {
        const modifiedName = token.name.trim().replace(/\s+/g, "").replace(/\//g, "|");
        const modifiedSymbol = token.symbol.trim().replace(/\s+/g, "").replace(/\//g, "|");
        return token.id.toString() + ":" + modifiedSymbol + ":" + modifiedName;
      });

      // Get existing documents
      const existingTokensSnapshot = await tokensCollection.where(FieldPath.documentId(), "in", tokenIds.slice(0, 10)).get();
      const existingTokenIds = new Set(existingTokensSnapshot.docs.map(doc => doc.id));

      // Process remaining tokens in chunks of 10 (Firestore 'in' query limit)
      for (let i = 10; i < tokenIds.length; i += 10) {
        const chunk = tokenIds.slice(i, Math.min(i + 10, tokenIds.length));
        const chunkSnapshot = await tokensCollection.where(FieldPath.documentId(), "in", chunk).get();
        chunkSnapshot.docs.forEach(doc => existingTokenIds.add(doc.id));
      }

      json.data.forEach((token: any) => {
        const modifiedName = token.name.trim().replace(/\s+/g, "").replace(/\//g, "|");
        const modifiedSymbol = token.symbol.trim().replace(/\s+/g, "").replace(/\//g, "|");
        const docId = token.id.toString() + ":" + modifiedSymbol + ":" + modifiedName;

        // Skip if token already exists
        if (existingTokenIds.has(docId)) {
          skippedCount++;
          return;
        }

        const tokenRef = tokensCollection.doc(docId);
        batchWrite.set(tokenRef, {
          ...token,
          lastUpdated: Timestamp.now(),
        }, { merge: true });
        addedCount++;
      });

      if (addedCount > 0) {
        await batchWrite.commit();
        logger.info(`Batch write completed. Added: ${addedCount}, Skipped: ${skippedCount}`);
      } else {
        logger.info(`No new tokens to add. Skipped: ${skippedCount} existing tokens.`);
      }

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
const chunkArray = (array: string[], chunkSize: number): string[][] => {
  const chunks: string[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

const getTokens = async (symbols: string[]): Promise<CoinMarketCap.Token[] | null> => {
  try {
    const tokensCollection = db.collection("tokens-cmc");
    const upperCaseSymbols = symbols.map(symbol => symbol.toUpperCase());
    const chunkSize = 30; // Firestore limit
    const symbolChunks = chunkArray(upperCaseSymbols, chunkSize);

    let allTokens: CoinMarketCap.Token[] = [];

    for (const chunk of symbolChunks) {
      const tokenSnapshot = await tokensCollection
        .where("symbol", "in", chunk)
        .get();

      if (tokenSnapshot.empty) {
        logger.warn(`No tokens found for symbols: ${chunk.join(", ")}`);
      } else {
        const tokens: CoinMarketCap.Token[] = tokenSnapshot.docs.map((doc) => doc.data() as CoinMarketCap.Token);
        allTokens = [...allTokens, ...tokens];
      }
    }

    if (allTokens.length === 0) {
      logger.warn(`No tokens found for symbols: ${symbols.join(", ")}`);
      return [];
    }

    return allTokens;
  } catch (err) {
    logger.error(
      `Error fetching tokens by symbols: ${symbols.join(", ")}. ${err instanceof Error ? err.message : "An error occurred"}`
    );
    return null;
  }
};

export default {
  reloadTokens,
  getTokens,
};
