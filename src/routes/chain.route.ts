import express from "express";
import subgraphController from "../controllers/chain.subgraph.controller";
import chainController from "../controllers/chain.controller";
import alchemyController from "../controllers/chain.alchemy.controller";
import coinMarketCapController from "../controllers/chain.cmc.controller";

const router = express.Router();

// router.route("/dexs").get(chainController.getDexs);
// router.route("/dexs").put(chainController.reloadDexs);
router.route("/reloadCmcTokens").get(coinMarketCapController.reloadTokens);
router.route("/tokens").get(chainController.getTokens);
router.route("/reloadTokens").get(subgraphController.reloadTokens);
router.route("/pools/:tokenAddress").get(subgraphController.reloadPools);
// router.route("/swaps").get(subgraphController.getSwaps);
// router.route("/swaps/:contractAddress").get(subgraphController.getSwaps);
// router.route("/pairs").get(subgraphController.getPairs);
// router.route("/reloadPairs").get(subgraphController.reloadPairs);
router.route("/tokens/:address").get(alchemyController.getPriceByAddresses);
router.route("/tokens/history/:address").get(alchemyController.getPriceHistory);


export default router;
