import { Request, Response } from "express";
import cmcService from "../services/chain.cmc.service";
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

const reloadTokens = async (req: Request, res: Response): Promise<Response> => {

  try {
    // Fetch the cryptocurrency id by symbol using the service's get method
    const tokens = await cmcService.reloadTokens();

    if (tokens === null) {
      return res.status(404).json({ error: `Dex list not found` });
    }

    return res.json({ tokens }); // Respond with the id of the token
  } catch (error) {
    console.error("Error fetching token:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



export default {
  reloadTokens,
};