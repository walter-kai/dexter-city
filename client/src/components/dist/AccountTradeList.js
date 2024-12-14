"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var LoadingScreenDots_1 = require("../components/LoadingScreenDots"); // Assuming this component exists
var AccountTradeList = function () {
    var _a = react_1.useState([]), accountTrades = _a[0], setAccountTrades = _a[1];
    var _b = react_1.useState(true), loading = _b[0], setLoading = _b[1]; // Track loading state
    var formatDate = function (timestamp) {
        var date = new Date(timestamp);
        return date.toLocaleString();
    };
    react_1.useEffect(function () {
        var fetchData = function () { return __awaiter(void 0, void 0, void 0, function () {
            var tradesResponse, trades, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 5]);
                        return [4 /*yield*/, fetch("/api/binance/trades?symbol=BTCUSDT")];
                    case 1:
                        tradesResponse = _a.sent();
                        if (!tradesResponse.ok)
                            throw new Error("Failed to fetch trades");
                        return [4 /*yield*/, tradesResponse.json()];
                    case 2:
                        trades = _a.sent();
                        setAccountTrades(trades.data);
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error fetching Binance data:", error_1);
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false); // Set loading to false after data is fetched
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchData();
    }, []);
    if (loading)
        return (react_1["default"].createElement("div", { className: "h-[270px] flex justify-center items-center" },
            react_1["default"].createElement(LoadingScreenDots_1["default"], null),
            " "));
    return (react_1["default"].createElement("div", { className: "bg-white p-4 rounded shadow-md mb-4" },
        react_1["default"].createElement("h2", { className: "text-xl mb-2" }, "Account Trade List"),
        accountTrades.length > 0 ? (react_1["default"].createElement("ul", { className: "space-y-2" }, accountTrades.map(function (trade, index) { return (react_1["default"].createElement("li", { key: index, className: "flex justify-between items-center border-b py-2 text-sm" },
            react_1["default"].createElement("span", { className: "font-medium" }, formatDate(trade.time)),
            react_1["default"].createElement("span", { className: "font-semibold text-blue-500" }, trade.symbol),
            react_1["default"].createElement("span", null,
                "Amount: ",
                react_1["default"].createElement("span", { className: "font-semibold" }, trade.quoteQty)),
            react_1["default"].createElement("span", null,
                "Price: ",
                react_1["default"].createElement("span", { className: "font-semibold" }, trade.price)))); }))) : (react_1["default"].createElement("p", null, "No trades found."))));
};
exports["default"] = AccountTradeList;
