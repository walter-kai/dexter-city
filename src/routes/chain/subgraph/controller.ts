import { Request, Response } from "express";
import subgraphService from "./service";
import firebaseService from "../../firebase/firebase.service";
import ApiError from "../../../utils/api-error";
import { db } from "../../../config/firebase"; 
import logger from "../../../config/logger";
import { fetchTopDailyPools, PoolDayData } from "./UniswapV4";

// Import the preloadTokenImages function from subgraph service
import { preloadTokenImages } from "./service";


const getPools = async (req: Request, res: Response): Promise<Response> => {
  // const { symbol } = req.params; // Get the symbol from the URL params

  try {
    // Fetch the cryptocurrency id by symbol using the service's get method
    const poolList = await firebaseService.getPoolsUniswap();

    if (poolList === null) {
      return res.status(404).json({ error: `Dex list not found` });
    }

    return res.json({ pools: poolList }); // Respond with the id of the token
  } catch (error) {
    console.error("Error fetching token:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const getSwaps = async (req: Request, res: Response): Promise<Response> => {

  if (req.params.contractAddress == null) {
    throw new ApiError(400, "Missing chatId in request params");
  }

  const contractAddress = req.params.contractAddress; // Extract network and contractAddress from query parameters

  try {
    // Check if the required parameters are provided
    if (!contractAddress) {
      return res.status(400).json({ error: "Missing required parameters: network and contractAddress" });
    }


    const tradesList = await subgraphService.getSwapsV4(contractAddress as string);

    // Check if the dexList is null
    if (!tradesList) {
      return res.status(404).json({ error: "Dex list not found" });
    }

    // Return the fetched data
    return res.json({ data: tradesList });
  } catch (error) {
    console.error("Error fetching trades:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * Get daily pool data for today and yesterday
 */
const getDailyPools = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Get today's and yesterday's dates in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Get reference to the dayPools collection
    const dayPoolsCollection = db.collection("dayPools-uniswap");
    
    // Fetch today's and yesterday's data
    const todayDoc = await dayPoolsCollection.doc(today).get();
    const yesterdayDoc = await dayPoolsCollection.doc(yesterday).get();
    
    // Prepare response data
    const response: any = {
      dates: {
        today,
        yesterday
      },
      pools: {}
    };
    
    // Add today's data if available and sort pools by txCount
    if (todayDoc.exists) {
      const todayData = todayDoc.data();
      if (todayData && Array.isArray(todayData.pools)) {
        // Sort pools by txCount in descending order
        todayData.pools.sort((a: any, b: any) => (b.txCount || 0) - (a.txCount || 0));
      }
      response.pools.today = todayData;
    } else {
      console.log(`No pool data found for today (${today})`);
      response.pools.today = null;
    }
    
    // Add yesterday's data if available and sort pools by txCount
    if (yesterdayDoc.exists) {
      const yesterdayData = yesterdayDoc.data();
      if (yesterdayData && Array.isArray(yesterdayData.pools)) {
        // Sort pools by txCount in descending order
        yesterdayData.pools.sort((a: any, b: any) => (b.txCount || 0) - (a.txCount || 0));
      }
      response.pools.yesterday = yesterdayData;
    } else {
      console.log(`No pool data found for yesterday (${yesterday})`);
      response.pools.yesterday = null;
    }

    // Return the data with sorted pools
    return res.json(response);
  } catch (error) {
    console.error("Error fetching daily pools data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Reload daily pool data from Uniswap subgraph
 */
const reloadPoolsDay = async (req: Request, res: Response): Promise<Response> => {
  const startTime = Date.now();
  
  try {
    logger.info("Starting Uniswap daily pools reload...");
    
    // Preload token images to get symbolMap and nameMap
    const { symbolMap, nameMap } = await preloadTokenImages();
    logger.info(`Preloaded token images: ${symbolMap.size} symbols, ${nameMap.size} names`);
    
    // 1. Fetch pool day data from Uniswap subgraph
    const poolDayDatas: PoolDayData[] = await fetchTopDailyPools(0, 500); // Get top 500 pools
    
    // 2. Get today's date for document ID
    const today = new Date().toISOString().split('T')[0];
    
    // 3. Transform the data into our PoolData format
    const transformedPools = poolDayDatas.map(data => {     
      const pool = data.pool; 
      
      // Find token image IDs - first try by name, then by symbol
      let token0ImgId = 0;
      let token1ImgId = 0;
      
      // For token0
      if (pool.token0.name && nameMap.has(pool.token0.name)) {
        // Try by name first
        token0ImgId = nameMap.get(pool.token0.name)!;
      } else {
        // Fall back to symbol
        const token0Symbol = pool.token0.symbol.toUpperCase();
        const token0ImgIds = symbolMap.get(token0Symbol) || [];
        if (token0ImgIds.length > 0) {
          token0ImgId = token0ImgIds[0]; // Get the first result
        }
      }
      
      // For token1
      if (pool.token1.name && nameMap.has(pool.token1.name)) {
        // Try by name first
        token1ImgId = nameMap.get(pool.token1.name)!;
      } else {
        // Fall back to symbol
        const token1Symbol = pool.token1.symbol.toUpperCase();
        const token1ImgIds = symbolMap.get(token1Symbol) || [];
        if (token1ImgIds.length > 0) {
          token1ImgId = token1ImgIds[0]; // Get the first result
        }
      }
      
      // Map to our internal PoolData structure
      return {
        name: `${pool.token0.symbol}/${pool.token1.symbol}`,
        lastUpdated: new Date(),
        createdAtTimestamp: new Date(Number(pool.createdAtTimestamp) * 1000),
        network: "Ethereum",
        address: pool.id, // Using id as the address
        volumeUSD: pool.volumeUSD,
        txCount: 0, // Note: txCount might need to be fetched separately
        date: data.date.toString(),
        feeTier: Number(pool.feeTier),
        liquidity: pool.liquidity,
        token0Price: pool.token0Price,
        token0: {
          address: pool.token0.id, // Using id as the address
          symbol: pool.token0.symbol,
          name: pool.token0.name,
          imgId: token0ImgId, // Use the found imgId
          volume: pool.token0.volumeUSD,
          price: 0, // This would need to be computed or fetched elsewhere
          date_added: "", // This would need additional data
          tags: []
        },
        token1Price: pool.token1Price,
        token1: {
          address: pool.token1.id, // Using id as the address
          symbol: pool.token1.symbol,
          name: pool.token1.name,
          imgId: token1ImgId, // Use the found imgId
          volume: pool.token1.volumeUSD,
          price: 0, // This would need to be computed or fetched elsewhere
          date_added: "", // This would need additional data
          tags: []
        }
      };
    });
    
    // 4. Calculate pool count for metadata
    const poolCount = transformedPools.length;
    
    // 5. Create the document to save
    const docData = {
      date: today,
      lastUpdated: new Date(),
      poolCount,
      pools: transformedPools
    };
    
    // 6. Save to Firestore
    const docRef = db.collection("dayPools-uniswap").doc(today);
    await docRef.set(docData);
    
    const totalTime = (Date.now() - startTime) / 1000;
    logger.info(`Uniswap daily pools reloaded successfully in ${totalTime}s`);
    
    return res.json({
      success: true,
      message: `Successfully updated ${poolCount} pools for ${today}`,
      timing: {
        totalTime: `${totalTime}s`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const totalTime = (Date.now() - startTime) / 1000;
    logger.error(`Error reloading pool day data: ${error}`);
    return res.status(500).json({ 
      error: "Internal server error during pool day reload",
      details: error instanceof Error ? error.message : "Unknown error",
      totalTime: `${totalTime}s`
    });
  }
};

/**
 * Import pools from dayPools-uniswap/{date} to masterPool-uniswap, overwriting by address.
 */
const importMasterPool = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { date } = req.params; // Get the symbol from the URL params
    // const date = req.body.date || req.query.date;
    if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Missing or invalid 'date' parameter (YYYY-MM-DD)" });
    }

    const dayDocRef = db.collection("dayPools-uniswap").doc(date);
    const dayDoc = await dayDocRef.get();
    if (!dayDoc.exists) {
      return res.status(404).json({ error: `No dayPools-uniswap data for ${date}` });
    }
    const data = dayDoc.data();
    if (!data || !Array.isArray(data.pools)) {
      return res.status(404).json({ error: `No pools array in dayPools-uniswap/${date}` });
    }

    const poolsUniswap = db.collection("masterPool-uniswap");
    const batch = db.batch();
    let updated = 0;

    for (const pool of data.pools) {
      if (!pool.address) continue;
      const poolDoc = poolsUniswap.doc(pool.address);
      batch.set(poolDoc, pool, { merge: true });
      updated++;
    }

    await batch.commit();

    return res.json({
      message: `Imported ${updated} pools from dayPools-uniswap/${date} to masterPool-uniswap.`,
      imported: updated,
      date,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", details: error instanceof Error ? error.message : error });
  }
};

export default {
  getPools,
  getSwaps,
  getDailyPools,
  reloadPoolsDay,
  importMasterPool
};