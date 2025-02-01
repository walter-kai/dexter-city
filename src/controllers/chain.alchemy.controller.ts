import { Request, Response } from "express";
import alchemyService from "../services/chain.alchemy.service";
import chainSubgraphService from "../services/chain.subgraph.service";
import { start } from "repl";
// import botConfig from "../../client/src/models/Bot"

// const reloadDexs = async (req: Request, res: Response): Promise<Response> => {
//   try {

//     // Fetch bot by botName using the botService's get method
//     const bot = await coinMarketCapService.reloadDexs(); // Ensure botName is treated as a string

//     // if (!bot) {
//     //   return res.status(404).json({ error: "Bot not found" });
//     // }

//     return res.json(bot);
//   } catch (error) {
//     console.error("Error fetching bot:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// const reloadTokens = async (req: Request, res: Response): Promise<Response> => {
//   try {

//     // Fetch bot by botName using the botService's get method
//     // const bot = await coinMarketCapService.reloadTokens(); // Ensure botName is treated as a string
//     const bot = await chainSubgraphService.reloadTokens(); // Ensure botName is treated as a string

//     // if (!bot) {
//     //   return res.status(404).json({ error: "Bot not found" });
//     // }

//     return res.json(bot);
//   } catch (error) {
//     console.error("Error fetching bot:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// const reloadPairs = async (req: Request, res: Response): Promise<Response> => {
//   try {
//     // Fetch pairs for Solana
//     const solanaSuccess = await coinMarketCapService.reloadPairs('solana');
//     if (!solanaSuccess) {
//       console.error("Failed to reload pairs for Solana.");
//       return res.status(500).json({ error: "Failed to reload pairs for Solana." });
//     }

//     // Fetch pairs for Ethereum
//     const ethereumSuccess = await coinMarketCapService.reloadPairs('ethereum');
//     if (!ethereumSuccess) {
//       console.error("Failed to reload pairs for Ethereum.");
//       return res.status(500).json({ error: "Failed to reload pairs for Ethereum." });
//     }

//     // If both succeeded, return success response
//     return res.status(200).json({ message: "Pairs reloaded successfully for Solana and Ethereum." });
//   } catch (error) {
//     console.error("Error reloading pairs:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

const getPriceByAddresses = async (req: Request, res: Response): Promise<Response> => {
  const { addresses } = req.query; // Get the addresses from query params

  if (!addresses || typeof addresses !== "string") {
    return res.status(400).json({ error: "Addresses query parameter is required and must be a comma-separated string." });
  }

  // Split the addresses string into an array
  const addressArray = addresses.split(",").map((address) => address.trim());

  try {
    // Fetch prices for multiple addresses using the service
    const prices = await alchemyService.getPriceByAddress(addressArray);

    if (!prices || Object.keys(prices).length === 0) {
      return res.status(404).json({ error: `Prices not found for the provided addresses.` });
    }

    return res.json({ prices }); // Respond with the fetched prices
  } catch (error) {
    console.error("Error fetching prices:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getPriceHistory = async (req: Request, res: Response): Promise<Response> => {
  const { address, startTime, endTime, interval } = req.params; // Get the symbol from the URL params

  try {
    // Fetch the cryptocurrency id by symbol using the service's get method
    const tokenId = await alchemyService.getHistory(address, interval , parseInt(startTime), parseInt(endTime));

    if (tokenId === null) {
      return res.status(404).json({ error: `Token with symbol '${address}' not found` });
    }

    return res.json({ id: tokenId }); // Respond with the id of the token
  } catch (error) {
    console.error("Error fetching token:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// const getDexs = async (req: Request, res: Response): Promise<Response> => {
//   // const { symbol } = req.params; // Get the symbol from the URL params

//   try {
//     // Fetch the cryptocurrency id by symbol using the service's get method
//     const dexList = await coinMarketCapService.getDexs();

//     if (dexList === null) {
//       return res.status(404).json({ error: `Dex list not found` });
//     }

//     return res.json({ id: dexList }); // Respond with the id of the token
//   } catch (error) {
//     console.error("Error fetching token:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// const getPairs = async (req: Request, res: Response): Promise<Response> => {
//   // const { symbol } = req.params; // Get the symbol from the URL params

//   try {
//     // Fetch the cryptocurrency id by symbol using the service's get method
//     const dexList = await coinMarketCapService.getPairs();

//     if (dexList === null) {
//       return res.status(404).json({ error: `Dex list not found` });
//     }

//     return res.json({ id: dexList }); // Respond with the id of the token
//   } catch (error) {
//     console.error("Error fetching token:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };


// const getTrades = async (req: Request, res: Response): Promise<Response> => {
//   const { network, contractAddress } = req.query; // Extract network and contractAddress from query parameters

//   try {
//     // Check if the required parameters are provided
//     if (!network || !contractAddress) {
//       return res.status(400).json({ error: "Missing required parameters: network and contractAddress" });
//     }

//     // Fetch the cryptocurrency data using the service's getTrades method
//     const tradesList = await coinMarketCapService.getTrades(network as string, contractAddress as string);

//     // Check if the dexList is null
//     if (!tradesList) {
//       return res.status(404).json({ error: "Dex list not found" });
//     }

//     // Return the fetched data
//     return res.json({ data: tradesList });
//   } catch (error) {
//     console.error("Error fetching trades:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };


export default {
  // reloadDexs,
  // reloadTokens,
  // reloadPairs,
  getPriceByAddresses,
  getPriceHistory
  // getDexs,
  // getPairs,
  // getTrades
};