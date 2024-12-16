"use strict";
exports.__esModule = true;
require("./styles/styles.css");
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var Trending_1 = require("./pages/Trending");
var Share_1 = require("./pages/Share");
var UserGuide_1 = require("./pages/UserGuide");
var Support_1 = require("./pages/Support");
var NotFound_1 = require("./pages/NotFound");
var Quit_1 = require("./pages/Quit");
var Profile_1 = require("./pages/Profile");
var Dashboard_1 = require("./pages/Dashboard");
var Login_1 = require("./pages/Login");
var App = function () {
    return (react_1["default"].createElement("div", { className: "mx-auto" },
        react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement(react_router_dom_1.Routes, null,
                react_1["default"].createElement(react_router_dom_1.Route, { path: "/", element: react_1["default"].createElement(Login_1["default"], null) }),
                react_1["default"].createElement(react_router_dom_1.Route, { path: "/dash", element: react_1["default"].createElement(Dashboard_1["default"], null) }),
                react_1["default"].createElement(react_router_dom_1.Route, { path: "/trending", element: react_1["default"].createElement(Trending_1["default"], null) }),
                react_1["default"].createElement(react_router_dom_1.Route, { path: "/profile", element: react_1["default"].createElement(Profile_1["default"], null) }),
                react_1["default"].createElement(react_router_dom_1.Route, { path: "/share", element: react_1["default"].createElement(Share_1["default"], null) }),
                react_1["default"].createElement(react_router_dom_1.Route, { path: "/user-guide", element: react_1["default"].createElement(UserGuide_1["default"], null) }),
                react_1["default"].createElement(react_router_dom_1.Route, { path: "/support", element: react_1["default"].createElement(Support_1["default"], null) }),
                react_1["default"].createElement(react_router_dom_1.Route, { path: "/quit", element: react_1["default"].createElement(Quit_1["default"], null) }),
                react_1["default"].createElement(react_router_dom_1.Route, { path: "*", element: react_1["default"].createElement(NotFound_1["default"], null) })))));
};
exports["default"] = App;
