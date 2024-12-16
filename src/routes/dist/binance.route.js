"use strict";
exports.__esModule = true;
var express_1 = require("express");
var binance_controller_1 = require("../controllers/binance.controller");
var router = express_1["default"].Router();
router.route("/authorize").get(binance_controller_1["default"].authorize);
router.route("/trades").get(binance_controller_1["default"].getAccountTradeList);
router.route("/exchangeInfo").get(binance_controller_1["default"].getExchangeInfo);
exports["default"] = router;
