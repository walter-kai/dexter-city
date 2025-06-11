import { Request, Response } from "express";
import coinMarketCapService from "./chain.coinmarketcap.service";
import subgraphService from "./chain.subgraph.service";
import logger from "../../config/logger";

const reloadToDb = async (req: Request, res: Response): Promise<Response> => {
  try {
    logger.info("Starting comprehensive data reload...");
    
    // Step 1: Reload CoinMarketCap tokens
    logger.info("Reloading CoinMarketCap tokens...");
    await coinMarketCapService.reloadTokens();
    logger.info("CoinMarketCap tokens reloaded successfully");
    
    // Step 2: Reload Uniswap pools
    logger.info("Reloading Uniswap pools...");
    const pools = await subgraphService.reloadPools();
    
    if (!pools) {
      logger.error("Failed to reload Uniswap pools");
      return res.status(500).json({ 
        error: "Failed to reload Uniswap pools",
        tokensReloaded: true,
        poolsReloaded: false
      });
    }
    
    logger.info("Uniswap pools reloaded successfully");
    
    // Success response
    const result = {
      message: "Database reload completed successfully",
      tokensReloaded: true,
      poolsReloaded: true,
      poolsCount: pools.length,
      timestamp: new Date().toISOString()
    };
    
    logger.info("Comprehensive data reload completed successfully");
    return res.json(result);
    
  } catch (error) {
    logger.error("Error during database reload:", error);
    return res.status(500).json({ 
      error: "Internal server error during database reload",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export default {
  reloadToDb
};
