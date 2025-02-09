import express from "express";
import subgraphController from "../controllers/chain.subgraph.controller";
import coinMarketCapController from "../controllers/chain.coinmarketcap.controller";

const router = express.Router();

// router.route("/dexs").get(chainController.getDexs);
// router.route("/dexs").put(chainController.reloadDexs);
router.route("/tokens").put(coinMarketCapController.reloadTokens);
// router.route("/swaps").get(subgraphController.getSwaps);
router.route("/swaps/:contractAddress").get(subgraphController.getSwaps);
router.route("/pairs").get(subgraphController.getPairs);
// router.route("/reloadPairs").get(subgraphController.reloadPairs);
// router.route("/tokens/:symbol").get(chainController.getTokenBySymbol);


export default router;
