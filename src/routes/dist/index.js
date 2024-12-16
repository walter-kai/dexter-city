"use strict";
exports.__esModule = true;
var express_1 = require("express");
var game_route_1 = require("./game.route");
var user_route_1 = require("./user.route");
var telegram_route_1 = require("./telegram.route");
var binance_route_1 = require("./binance.route");
var router = express_1["default"].Router();
var defaultRoutes = [
    {
        path: "/game",
        route: game_route_1["default"]
    },
    {
        path: "/user",
        route: user_route_1["default"]
    },
    {
        path: "/telegram",
        route: telegram_route_1["default"]
    },
    {
        path: "/binance",
        route: binance_route_1["default"]
    },
];
// const devRoutes: ReadonlyArray<RouteObj> = [
//   {
//     path: "/game",
//     route: gameRoute,
//   },
// ];
defaultRoutes.forEach(function (route) {
    router.use(route.path, route.route);
});
// if (config.env === "staging") {
//   devRoutes.forEach((route) => {
//     router.use(route.path, route.route);
//   });
// }
exports["default"] = router;
