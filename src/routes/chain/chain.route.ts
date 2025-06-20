import express from "express";
import subgraphController from "./subgraph/controller";
import coinMarketCapController from "./cmc/controller";


const router = express.Router();

// Data fetch endpoints
router.route("/uni/swaps/:contractAddress").get(subgraphController.getSwaps);
router.route("/uni/pools").get(subgraphController.getPools);
router.route("/uni/dailyPools").get(subgraphController.getDailyPools); // New endpoint
router.route("/cmc/tokens/:symbol").get(coinMarketCapController.getTokenBySymbol);

// Endpoints for CRON jobs
router.route("/cmc/reload/tokens").get(coinMarketCapController.reloadCmcTokens);
router.route("/uni/reload/poolsDay").get(subgraphController.reloadPoolsDay);
router.route("/uni/masterPool/import/:date").get(subgraphController.importMasterPool);

export default router;
