import express from "express";
import subgraphController from "./chain.subgraph.controller";
import coinMarketCapController from "./chain.coinmarketcap.controller";
import chainController from "./chain.controller";

const router = express.Router();

// Reload endpoints
router.route("/reload").get(chainController.reloadAll);
router.route("/cmc/reload/tokens").get(chainController.reloadTokens);
router.route("/uni/reload/poolsDay").get(chainController.reloadPoolsDay);

// Data fetch endpoints
router.route("/uni/swaps/:contractAddress").get(subgraphController.getSwaps);
router.route("/uni/pools").get(subgraphController.getPools);
router.route("/uni/dailyPools").get(subgraphController.getDailyPools); // New endpoint
router.route("/cmc/tokens/:symbol").get(coinMarketCapController.getTokenBySymbol);

// New endpoint for importing master pool from dayPools-uniswap to masterPool-uniswap
router.route("/uni/masterPool/import/:date").get(chainController.importMasterPool);

export default router;
