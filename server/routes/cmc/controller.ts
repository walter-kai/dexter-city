import { Request, Response } from "express";
import coinMarketCapService from "./service";
import logger from "../../config/logger";


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


const reloadCmcTokens = async (req: Request, res: Response): Promise<Response> => {
  const startTime = Date.now();

  try {
    logger.info("Starting CoinMarketCap token reload...");
    await coinMarketCapService.reloadTokens();
    
    const totalTime = (Date.now() - startTime) / 1000;
    logger.info(`CoinMarketCap tokens reloaded successfully in ${totalTime}s`);
    
    return res.json({
      message: "CoinMarketCap tokens reloaded successfully",
      timing: {
        totalTime: `${totalTime}s`
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const totalTime = (Date.now() - startTime) / 1000;
    logger.error("Error during token reload:", error);
    return res.status(500).json({ 
      error: "Internal server error during token reload",
      details: error instanceof Error ? error.message : "Unknown error",
      totalTime: `${totalTime}s`
    });
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
  reloadCmcTokens,
  getTokenBySymbol,
};