import { Request, Response } from "express";
import coinMarketCapService from "./chain.coinmarketcap.service";
import subgraphService from "./chain.subgraph.service";
import logger from "../../config/logger";

const reloadToDb = async (req: Request, res: Response): Promise<Response> => {
  const startTime = Date.now();
  
  try {
    logger.info("Starting comprehensive data reload...");
    
    // Step 1: Reload CoinMarketCap tokens
    logger.info("Reloading CoinMarketCap tokens...");
    const tokensStartTime = Date.now();
    await coinMarketCapService.reloadTokens();
    const tokensEndTime = Date.now();
    const tokensTime = (tokensEndTime - tokensStartTime) / 1000;
    logger.info(`CoinMarketCap tokens reloaded successfully in ${tokensTime}s`);
    
    // Step 2: Reload Uniswap pools
    logger.info("Reloading Uniswap pools...");
    const poolsStartTime = Date.now();
    const pools = await subgraphService.reloadPools();
    const poolsEndTime = Date.now();
    const poolsTime = (poolsEndTime - poolsStartTime) / 1000;
    
    if (!pools) {
      logger.error("Failed to reload Uniswap pools");
      return res.status(500).json({ 
        error: "Failed to reload Uniswap pools",
        tokensReloaded: true,
        poolsReloaded: false,
        totalTime: `${(Date.now() - startTime) / 1000}s`
      });
    }
    
    logger.info(`Uniswap pools reloaded successfully in ${poolsTime}s`);
    
    const totalTime = (Date.now() - startTime) / 1000;
    
    // Success response
    const result = {
      message: "Database reload completed successfully",
      tokensReloaded: true,
      poolsReloaded: true,
      poolsCount: pools.length,
      timing: {
        tokensTime: `${tokensTime}s`,
        poolsTime: `${poolsTime}s`,
        totalTime: `${totalTime}s`
      },
      timestamp: new Date().toISOString()
    };
    
    logger.info(`Comprehensive data reload completed successfully in ${totalTime}s`);
    return res.json(result);
    
  } catch (error) {
    const totalTime = (Date.now() - startTime) / 1000;
    logger.error("Error during database reload:", error);
    return res.status(500).json({ 
      error: "Internal server error during database reload",
      details: error instanceof Error ? error.message : "Unknown error",
      totalTime: `${totalTime}s`
    });
  }
};

export default {
  reloadToDb
};
