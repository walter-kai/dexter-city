"use strict";
exports.__esModule = true;
var express_1 = require("express");
var google_controller_1 = require("../controllers/google.controller");
var router = express_1["default"].Router();
// TODO: Change this to a get req, requiring telegram id be exposed in headers or something
// router.route("/me").post(authController.getCurrentUser);
// router.route("/login").post(authController.login);
router.route("/google").post(google_controller_1["default"].googleLogin);
exports["default"] = router;
