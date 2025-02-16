import express from "express";
import subgraphController from "../controllers/chain.subgraph.controller";
import coinMarketCapController from "../controllers/chain.coinmarketcap.controller";

const router = express.Router();

// router.route("/dexs").get(chainController.getDexs);
// router.route("/dexs").put(chainController.reloadDexs);
router.route("/cmc/reloadTokens").put(coinMarketCapController.reloadTokens);
// router.route("/swaps").get(subgraphController.getSwaps);
router.route("/uni/swaps/:contractAddress").get(subgraphController.getSwaps);
router.route("/uni/pairs").get(subgraphController.getPairs);
router.route("/uni/pools").get(subgraphController.getPools);
router.route("/cmc/reloadPairs").get(coinMarketCapController.reloadPairs);
router.route("/uni/reloadPairs").get(subgraphController.reloadPairs);
router.route("/uni/reloadPools").get(subgraphController.reloadPools);
// router.route("/tokens/:symbol").get(chainController.getTokenBySymbol);


export default router;
