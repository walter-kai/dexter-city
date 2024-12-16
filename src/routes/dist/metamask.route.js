"use strict";
exports.__esModule = true;
var express_1 = require("express");
var metamask_controller_1 = require("../controllers/metamask.controller");
var router = express_1["default"].Router();
// TODO: Change this to a get req, requiring telegram id be exposed in headers or something
router.route("/me").post(metamask_controller_1["default"].getCurrentUser);
router.route("/connect").get(metamask_controller_1["default"].login);
exports["default"] = router;
