import express from "express";
import subgraphController from "./chain.subgraph.controller";
import coinMarketCapController from "./chain.coinmarketcap.controller";
import chainController from "./chain.controller";

const router = express.Router();

// Reload endpoints
router.route("/reload").get(chainController.reloadAll);
router.route("/reload/tokens").get(chainController.reloadTokens);
router.route("/reload/poolsAll").get(chainController.reloadPools);
router.route("/reload/poolsDay").get(chainController.reloadPoolsDay);

// Data fetch endpoints
router.route("/uni/swaps/:contractAddress").get(subgraphController.getSwaps);
router.route("/uni/pools").get(subgraphController.getPools);
router.route("/uni/dailyPools").get(subgraphController.getDailyPools); // New endpoint
router.route("/tokens/:symbol").get(coinMarketCapController.getTokenBySymbol);

export default router;
