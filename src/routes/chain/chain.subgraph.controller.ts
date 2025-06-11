import { Request, Response } from "express";
import subgraphService from "./chain.subgraph.service";
import firebaseService from "../firebase/firebase.service";
import ApiError from "../../utils/api-error";


const getPools = async (req: Request, res: Response): Promise<Response> => {
  // const { symbol } = req.params; // Get the symbol from the URL params

  try {
    // Fetch the cryptocurrency id by symbol using the service's get method
    const poolList = await firebaseService.getPools();

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


    const tradesList = await subgraphService.getSwapsV3(contractAddress as string);

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


export default {
  getPools,
  getSwaps,
  reloadPools
};