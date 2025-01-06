import express from "express";
import chainController from "../controllers/chain.coinmarketcap.controller";

const router = express.Router();

router.route("/coinmarketcap/").get(chainController.reloadMap);
router.route("/coinmarketcap/:symbol").get(chainController.getTokenBySymbol);


export default router;
