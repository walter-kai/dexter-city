import express from "express";
import subgraphController from "./chain.subgraph.controller";
import coinMarketCapController from "./chain.coinmarketcap.controller";
import chainController from "./chain.controller";

const router = express.Router();


router.route("/reload").get(chainController.reloadToDb);
// router.route("/cmc/reloadTokens").put(coinMarketCapController.reloadTokens);
// router.route("/uni/reloadPools").get(subgraphController.reloadPools);
router.route("/uni/swaps/:contractAddress").get(subgraphController.getSwaps);
router.route("/uni/pools").get(subgraphController.getPools);
router.route("/tokens/:symbol").get(coinMarketCapController.getTokenBySymbol);


export default router;
