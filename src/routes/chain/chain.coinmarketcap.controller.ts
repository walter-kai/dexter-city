import { Request, Response } from "express";
import coinMarketCapService from "./chain.coinmarketcap.service";


const reloadTokens = async (req: Request, res: Response): Promise<Response> => {
  try {

    // Fetch bot by botName using the botService's get method
    const bot = await coinMarketCapService.reloadTokens(); // Ensure botName is treated as a string

    // if (!bot) {
    //   return res.status(404).json({ error: "Bot not found" });
    // }

    return res.json(bot);
  } catch (error) {
    console.error("Error fetching bot:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const getTokenBySymbol = async (req: Request, res: Response): Promise<Response> => {
  const { symbol } = req.params; // Get the symbol from the URL params

  try {
    // Fetch the cryptocurrency id by symbol using the service's get method
    const tokenId = await coinMarketCapService.getTokens([symbol]);

    if (tokenId === null) {
      return res.status(404).json({ error: `Token with symbol '${symbol}' not found` });
    }

    return res.json({ id: tokenId }); // Respond with the id of the token
  } catch (error) {
    console.error("Error fetching token:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export default {
  reloadTokens,
  getTokenBySymbol,
};