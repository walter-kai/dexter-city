import express from "express";
import binanceController from "../controllers/binance.controller";

const router = express.Router();

router.route("/trades").get(binanceController.getAccountTradeList);

router.route("/exchangeInfo").get(binanceController.getExchangeInfo);

export default router;
