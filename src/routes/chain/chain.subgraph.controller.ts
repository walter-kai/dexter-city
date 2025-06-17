import { Request, Response } from "express";
import subgraphService from "./chain.subgraph.service";
import firebaseService from "../firebase/firebase.service";
import ApiError from "../../utils/api-error";
import { db } from "../../config/firebase"; // Add this import for Firebase db


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



const reloadPools = async (req: Request, res: Response): Promise<Response> => {


  try {

    const poolsList = await subgraphService.reloadPools();

    // Check if the dexList is null
    if (!poolsList) {
      return res.status(404).json({ error: "Dex pool list not found" });
    }

    // Return the fetched data
    return res.json({ data: poolsList });
  } catch (error) {
    console.error("Error fetching pools:", error);
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

export default {
  getPools,
  getSwaps,
  reloadPools,
  getDailyPools
};