import express from "express";
import chainController from "../controllers/chain.coinmarketcap.controller";

const router = express.Router();

// router.route("/dexs").get(chainController.getDexs);
// router.route("/dexs").put(chainController.reloadDexs);
// router.route("/tokens").put(chainController.reloadTokens);
router.route("/pairs").get(chainController.getPairs);
router.route("/pairs").put(chainController.reloadPairs);
// router.route("/tokens/:symbol").get(chainController.getTokenBySymbol);


export default router;
