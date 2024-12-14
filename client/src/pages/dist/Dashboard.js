"use strict";
exports.__esModule = true;
var react_1 = require("react");
var SearchExchangeInfo_1 = require("../components/SearchExchangeInfo");
var Profile_1 = require("./Profile");
var Dashboard = function () {
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: "flex flex-col items-center animate-fadeIn" },
            react_1["default"].createElement("div", { className: "relative w-full" },
                react_1["default"].createElement("div", { className: "p-1 font-bold w-full" },
                    react_1["default"].createElement("div", { className: "absolute h-[265px] w-full bg-gradient-to-r from-white/10 via-black/20 to-white/10 blur-sm" }),
                    react_1["default"].createElement("div", { className: "px-4 py-1 text-center" },
                        react_1["default"].createElement(Profile_1["default"], null),
                        react_1["default"].createElement("h1", { className: "text-2xl font-bold mb-4" }, "Binance Dashboard"),
                        react_1["default"].createElement(SearchExchangeInfo_1["default"], null)))))));
};
exports["default"] = Dashboard;
