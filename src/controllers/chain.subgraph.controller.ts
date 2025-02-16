import { Request, Response } from "express";
import subgraphService from "../services/chain.subgraph.service";
import ApiError from "../utils/api-error";


// const getSwaps = async (req: Request, res: Response): Promise<Response> => {
//   try {
//     // Fetch pairs for Solana
//     const uniswapSuccess = await subgraphService.getSwaps();
//     if (!uniswapSuccess) {
//       console.error("Failed to reload pairs for Uniswap.");
//       return res.status(500).json({ error: "Failed to reload pairs for Uniswap." });
//     }

//     // If both succeeded, return success response
//     return res.status(200).json({ message: "Pairs reloaded successfully for Uniswap subgraph." });
//   } catch (error) {
//     console.error("Error reloading pairs:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

const getPairs = async (req: Request, res: Response): Promise<Response> => {
  // const { symbol } = req.params; // Get the symbol from the URL params

  try {
    // Fetch the cryptocurrency id by symbol using the service's get method
    const pairList = await subgraphService.getPairs();

    if (pairList === null) {
      return res.status(404).json({ error: `Dex list not found` });
    }

    return res.json({ pairs: pairList }); // Respond with the id of the token
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

    // Fetch the cryptocurrency data using the service's getTrades method
    const tradesList = await subgraphService.getSwaps(contractAddress as string);

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


const reloadPairs = async (req: Request, res: Response): Promise<Response> => {


  try {
    // Fetch the cryptocurrency data using the service's getTrades method
    const pairsList = await subgraphService.reloadPairs();

    // Check if the dexList is null
    if (!pairsList) {
      return res.status(404).json({ error: "Dex pair list not found" });
    }

    // Return the fetched data
    return res.json({ data: pairsList });
  } catch (error) {
    console.error("Error fetching pairs:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const reloadPools = async (req: Request, res: Response): Promise<Response> => {


  try {
    // Fetch the cryptocurrency data using the service's getTrades method
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
  getPairs,
  getSwaps,
  reloadPairs,
  reloadPools
};