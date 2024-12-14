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
var LoadingScreenDots_1 = require("./LoadingScreenDots");
var TokenPairDropdown = function () {
    var _a = react_1.useState(true), loading = _a[0], setLoading = _a[1];
    var _b = react_1.useState([]), exchangeInfo = _b[0], setExchangeInfo = _b[1];
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState(null), selectedPairInfo = _d[0], setSelectedPairInfo = _d[1];
    react_1.useEffect(function () {
        var fetchData = function () { return __awaiter(void 0, void 0, void 0, function () {
            var exchangeResponse, exchangeData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 5]);
                        return [4 /*yield*/, fetch("/api/binance/exchangeInfo")];
                    case 1:
                        exchangeResponse = _a.sent();
                        if (!exchangeResponse.ok)
                            throw new Error("Failed to fetch exchange info");
                        return [4 /*yield*/, exchangeResponse.json()];
                    case 2:
                        exchangeData = _a.sent();
                        setExchangeInfo(exchangeData.data.symbols);
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error fetching Binance data:", error_1);
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchData();
    }, []);
    // Filter exchange info based on search query
    var filteredPairs = exchangeInfo.filter(function (pair) {
        return pair.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    });
    // Handle selection of a trading pair
    var handlePairSelect = function (pair) {
        setSelectedPairInfo(pair);
        setSearchQuery(pair.symbol); // Set the search bar to the selected symbol
    };
    return (react_1["default"].createElement(react_1["default"].Fragment, null, loading ? (react_1["default"].createElement("div", { className: "h-[270px]" },
        react_1["default"].createElement(LoadingScreenDots_1["default"], null))) : (react_1["default"].createElement("div", { className: "flex flex-col items-center animate-fadeIn" },
        react_1["default"].createElement("div", { className: "relative w-full" },
            react_1["default"].createElement("div", { className: "p-1 font-bold w-full" },
                react_1["default"].createElement("div", { className: "px-4 py-1 text-center" },
                    react_1["default"].createElement("div", { className: "bg-white p-4 rounded shadow-md mb-4" },
                        react_1["default"].createElement("h2", { className: "text-xl" }, "Search Exchange Information"),
                        react_1["default"].createElement("input", { type: "text", placeholder: "Search for...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "w-full input-standard", required: true }),
                        filteredPairs.length > 0 ? (react_1["default"].createElement("ul", { className: "max-h-60 overflow-y-auto" }, filteredPairs.map(function (pair, index) { return (react_1["default"].createElement("li", { key: index, className: "cursor-pointer border-b py-2", onClick: function () { return handlePairSelect(pair); } }, pair.symbol)); }))) : (react_1["default"].createElement("p", null, "No matching symbols found."))),
                    selectedPairInfo && (react_1["default"].createElement("div", { className: "bg-white p-4 rounded shadow-md" },
                        react_1["default"].createElement("h2", { className: "text-xl" }, "Selected Pair Details"),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("strong", null, "Symbol:"),
                            " ",
                            selectedPairInfo.symbol),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("strong", null, "Status:"),
                            " ",
                            selectedPairInfo.status),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("strong", null, "Base Asset:"),
                            " ",
                            selectedPairInfo.baseAsset),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("strong", null, "Quote Asset:"),
                            " ",
                            selectedPairInfo.quoteAsset),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("strong", null, "Is Spot Trading Allowed:"),
                            " ",
                            selectedPairInfo.isSpotTradingAllowed ? 'Yes' : 'No'),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("strong", null, "Is Margin Trading Allowed:"),
                            " ",
                            selectedPairInfo.isMarginTradingAllowed ? 'Yes' : 'No'),
                        react_1["default"].createElement("p", null,
                            react_1["default"].createElement("strong", null, "Iceberg Allowed:"),
                            " ",
                            selectedPairInfo.icebergAllowed ? 'Yes' : 'No'))))))))));
};
exports["default"] = TokenPairDropdown;
