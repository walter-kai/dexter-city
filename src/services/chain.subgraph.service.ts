import { db } from "../config/firebase";
import admin from "firebase-admin";
import logger from "../config/logger";
import { CoinMarketCap, Subgraph } from "../../client/src/models/Token";
// import coinMarketCapService from "./chain.alchemy.service";

import { createClient, cacheExchange, fetchExchange, useQuery as urqlUseQuery } from 'urql';

// Create the client to interact with the subgraph
export const client = createClient({
  url: 'https://gateway.thegraph.com/api/cf949c81dc1152037b34ecdea916c0a8/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
  exchanges: [cacheExchange, fetchExchange],
});

// Function to fetch the top tokens by volume
const reloadTokensQuery = (skip: number = 0, first: number = 500): string => `{
  tokens(orderBy: volume, orderDirection: desc, skip: ${skip}, first: ${first}) {
    id
    name
    symbol
  }
}`;

// Function to fetch the pools by token address
const reloadPoolsQuery = (tokenAddress: string): string => `{
  pools(
    orderBy: volumeUSD
    orderDirection: desc
    where: {
      token0: "${tokenAddress}"
    }) {
      id
      feeTier
      volumeUSD
      liquidity
      token0 {
        symbol
      }
      token1 {
        symbol
      }
    }
  }`;


/**
 * Get a token from Firestore based on tokenAddress.
 */
const getToken = async (tokenAddress: string): Promise<Subgraph.TokenData | undefined> => {
  try {
    const tokensCollection = db.collection("tokens-uniswap");

    // Search for the token by its address
    const tokenSnapshot = await tokensCollection
      .where("id", "==", tokenAddress)
      .limit(1)  // Assuming address is unique in tokens-uniswap collection
      .get();

    if (tokenSnapshot.empty) {
      return undefined;
    }

    return tokenSnapshot.docs[0].data() as Subgraph.TokenData; // Get the first (and only) token from the query result


  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Error fetching token: ${err.message}`);
    } else {
      logger.error("Unknown error occurred while fetching token.");
    }
  }
};


/**
 * Save tokens and pools to Firestore.
 */
const reloadToTokensFirestore = async (tokens: Subgraph.TokenData[]): Promise<void> => {
  try {
    const tokensCollection = db.collection("tokens-uniswap");
    const cmcCollection = db.collection("tokens-cmc");
    const poolsCollection = db.collection("pools-uniswap");

    const savePromises = tokens.map(async (token) => {
      const tokenName = `ETH:${token.symbol.replace(/\//g, '.')}:${token.name.replace(/\//g, '.')}`;
      
      // Fetch the imgId from the tokens-cmc collection based on symbol
      const cmcDocSnapshot = await cmcCollection
        .where("symbol", "==", token.symbol)
        .limit(1) // assuming each symbol is unique in tokens-cmc collection
        .get();

      let imgId = null;
      if (!cmcDocSnapshot.empty) {
        const cmcDoc = cmcDocSnapshot.docs[0];
        imgId = cmcDoc.data().id; // assuming 'id' is the field for imgId in tokens-cmc
      }

      // Fetch the pool data and get the first pool instance's id
      const poolData = await reloadPools(token.id);
      let poolId = null;
      if (poolData && poolData.length > 0) {
        poolId = poolData[0]?.id; // Get the id of the first pool instance
      }

      const dataToSave = {
        ...token,
        name: tokenName,
        lastUpdated: admin.firestore.Timestamp.now(),
        imgId, // add imgId here
        poolId, // add poolId here
      };
    
      return tokensCollection
        .doc(tokenName)
        .set(dataToSave, { merge: false }); // Ensures overwriting, not merging
    });
    
    await Promise.all(savePromises);
    logger.info("All tokens successfully saved to Firestore.");
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Error saving tokens to Firestore: ${err.message}`);
    } else {
      logger.error("Unknown error occurred while saving tokens to Firestore.");
    }
  }
};



const reloadToPoolFirestore = async (pools: Subgraph.PoolData[]): Promise<void> => {
  try {
    const tokensCollection = db.collection("pools-uniswap");

    const savePromises = pools.map((pool) => {
      const tokenName = `ETH:${pool.token0.symbol.replace(/\//g, '.')}:${pool.token1.symbol.replace(/\//g, '.')}`;
      
      const dataToSave = {
        ...pool,
        name: tokenName,
        lastUpdated: admin.firestore.Timestamp.now(),
      };
    
      return tokensCollection
        .doc(tokenName)
        .set(dataToSave, { merge: false }); // Ensures overwriting, not merging
    });
    
    await Promise.all(savePromises);
    logger.info("All tokens successfully saved to Firestore.");
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Error saving tokens to Firestore: ${err.message}`);
    } else {
      logger.error("Unknown error occurred while saving tokens to Firestore.");
    }
  }
};


const reloadTokens = async (): Promise<Subgraph.TokenData[] | null> => {
  try {
    const fetchTokensFromSubgraph = async (): Promise<Subgraph.TokenData[]> => {
      let skip = 0;
      let allTokens: Subgraph.TokenData[] = []; // Initialize an array to hold all tokens
    
      try {
        // Fetch tokens 5 times
        for (let i = 0; i < 5; i++) {
          const result = await client
            .query(reloadTokensQuery(skip), { skip }) // Using skip for fetching tokens
            .toPromise();
    
          if (result.error) {
            throw new Error(result.error.message);
          }
    
          const tokens = result.data?.tokens || [];
    
          // Stop fetching if fewer than 500 items are returned
          if (tokens.length < 500) {
            break;
          }
    
          // Aggregate tokens in the allTokens array
          allTokens = [...allTokens, ...tokens];
          reloadToTokensFirestore(tokens);
    
          skip += 500;
          logger.info(`Downloading tokens: ${skip} of 2500`);
        }
    
        return allTokens; // Return the aggregated tokens
      } catch (err: unknown) {
        if (err instanceof Error) {
          logger.error(`Error fetching tokens from subgraph: ${err.message}`);
        } else {
          logger.error("Unknown error occurred while fetching tokens from subgraph.");
        }
        return [];
      }
    };
    
    // Fetch all tokens directly from the subgraph
    const tokens = await fetchTokensFromSubgraph();

    if (!tokens || tokens.length === 0) {
      logger.warn("No tokens found.");
      return [];
    }

    return tokens;
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Error reloading tokens: ${err.message}`);
    } else {
      logger.error("Unknown error occurred while reloading tokens.");
    }
    return null;
  }
};

// Reload pools for a given token address
const reloadPools = async (tokenAddress: string): Promise<Subgraph.PoolData[] | null> => {
  try {
    /**
     * Fetch pools from the subgraph.
     * This will attempt to fetch the data once, no need for multiple fetches or skip logic.
     */
    const fetchPoolsFromSubgraph = async (tokenAddress: string): Promise<Subgraph.PoolData[]> => {
      let pools: Subgraph.PoolData[] = []; 
    
      try {
        const poolsRef = admin.firestore().collection("pools-uniswap");
        
        // Step 1: Query Firestore where `id` == `tokenAddress`
        const snapshot = await poolsRef.where("id", "==", tokenAddress).limit(1).get();
    
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data();
          logger.info(`Pools for ${tokenAddress} found in Firestore. Returning cached data.`);
          return docData.pools || []; // Return stored pool data
        }
    
        // Step 2: If not in Firestore, fetch from the subgraph
        logger.info(`Fetching pools for ${tokenAddress} from Subgraph.`);
        const result = await client.query(reloadPoolsQuery(tokenAddress), { tokenAddress }).toPromise();
    
        if (result.error) {
          throw new Error(result.error.message);
        }
    
        pools = result.data?.pools || [];
    
        // Step 3: Save to Firestore
        if (pools.length > 0) {
          await poolsRef.add({ id: tokenAddress, pools, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        }
    
        return pools;
      } catch (err: unknown) {
        if (err instanceof Error) {
          logger.error(`Error fetching pools from subgraph: ${err.message}`);
        } else {
          logger.error("Unknown error occurred while fetching pools from subgraph.");
        }
        return [];
      }
    };
    
    
    
    // Fetch pools for the given token address
    const pools = await fetchPoolsFromSubgraph(tokenAddress);

    if (!pools || pools.length === 0) {
      logger.warn("No pools found.");
      return [];
    }

    return pools;
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Error reloading pools: ${err.message}`);
    } else {
      logger.error("Unknown error occurred while reloading pools.");
    }
    return null;
  }
};

// Reload ticks for a given token address
const reloadTicks = async (tokenAddress: string): Promise<Subgraph.PoolData[] | null> => {
  try {
    /**
     * Fetch pools from the subgraph.
     * This will attempt to fetch the data once, no need for multiple fetches or skip logic.
     */
    const fetchPoolsFromSubgraph = async (tokenAddress: string): Promise<Subgraph.PoolData[]> => {
      let pools: Subgraph.PoolData[] = []; // Initialize an array to hold all pools
    
      try {
        // Fetch the pools for the token once
        const result = await client.query(reloadPoolsQuery(tokenAddress), { tokenAddress }).toPromise();
    
        if (result.error) {
          throw new Error(result.error.message);
        }
    
        pools = result.data?.pools || [];

        // Save pools to Firestore under the appropriate token
        await reloadToPoolFirestore(pools);  // Use reloadPoolToTokenFirestore instead of reloadToTokensFirestore
        
        return pools; // Return the fetched pools
      } catch (err: unknown) {
        if (err instanceof Error) {
          logger.error(`Error fetching pools from subgraph: ${err.message}`);
        } else {
          logger.error("Unknown error occurred while fetching pools from subgraph.");
        }
        return [];
      }
    };
    
    // Fetch pools for the given token address
    const pools = await fetchPoolsFromSubgraph(tokenAddress);

    if (!pools || pools.length === 0) {
      logger.warn("No pools found.");
      return [];
    }

    return pools;
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Error reloading pools: ${err.message}`);
    } else {
      logger.error("Unknown error occurred while reloading pools.");
    }
    return null;
  }
};



export default {
  getToken,
  reloadTokens,
  reloadPools,
  reloadTicks,
};
