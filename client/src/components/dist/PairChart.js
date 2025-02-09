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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
var LoadingScreenDots_1 = require("./LoadingScreenDots");
var chartjs_plugin_zoom_1 = require("chartjs-plugin-zoom"); // Import the zoom plugin
// Register necessary chart components
chart_js_1.Chart.register.apply(// Import the zoom plugin
chart_js_1.Chart, __spreadArrays(chart_js_1.registerables, [chartjs_plugin_zoom_1["default"]])); // Register all components, including zoom plugin
var PairChart = function (_a) {
    var swapPair = _a.swapPair, safetyOrdersCount = _a.safetyOrdersCount, priceDeviation = _a.priceDeviation, gapMultiplier = _a.gapMultiplier;
    var _b = react_1.useState(null), error = _b[0], setError = _b[1];
    var _c = react_1.useState([]), swaps = _c[0], setSwaps = _c[1];
    var _d = react_1.useState(null), calculatedValues = _d[0], setCalculatedValues = _d[1];
    var _e = react_1.useState('1m'), timeInterval = _e[0], setTimeInterval = _e[1]; // Track the selected time interval
    react_1.useEffect(function () {
        if (!swapPair)
            return;
        var fetchSwaps = function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("/api/chain/swaps/" + swapPair.id)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch trades: " + response.statusText);
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        setSwaps(data.data); // Assuming the API returns an array of swaps in `data.data`
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        setError(err_1 instanceof Error ? err_1.message : "An unknown error occurred.");
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        fetchSwaps();
    }, [swapPair]); // Fetch data when swapPair changes
    react_1.useEffect(function () {
        var calculateSafetyOrderPrices = function () {
            if (!swaps || swaps.length === 0)
                return null;
            var mostRecentPrice = swaps[swaps.length - 1].amountUSD;
            var safetyOrderPrices = [];
            for (var i = 0; i < safetyOrdersCount; i++) {
                var deviationMultiplier = priceDeviation * Math.pow(gapMultiplier, i);
                var safetyOrderPrice = (safetyOrderPrices.length > 0 ? safetyOrderPrices[i - 1] : mostRecentPrice) -
                    mostRecentPrice * deviationMultiplier;
                safetyOrderPrices.push(safetyOrderPrice);
            }
            return {
                currentPrice: mostRecentPrice,
                safetyOrderPrices: safetyOrderPrices
            };
        };
        if (swaps.length > 0) {
            var values = calculateSafetyOrderPrices();
            if (values)
                setCalculatedValues(values);
        }
    }, [swaps, safetyOrdersCount, priceDeviation, gapMultiplier]);
    // Function to aggregate swaps based on selected time interval
    var aggregateSwapsByInterval = function (swaps, interval) {
        var intervalInMinutes = {
            '1m': 1,
            '15m': 15,
            '1h': 60,
            '1d': 1440
        };
        var intervalMinutes = intervalInMinutes[interval];
        // Group swaps into buckets based on the interval
        var aggregatedSwaps = [];
        var bucketStartTime = Math.floor(swaps[0].timestamp / (intervalMinutes * 60)) * (intervalMinutes * 60);
        var priceSum = 0;
        var count = 0;
        swaps.forEach(function (swap) {
            var timestampInInterval = Math.floor(swap.timestamp / (intervalMinutes * 60)) * (intervalMinutes * 60);
            if (timestampInInterval !== bucketStartTime) {
                if (count > 0) {
                    aggregatedSwaps.push({
                        time: new Date(bucketStartTime * 1000).toLocaleTimeString("en-GB", { hour12: false }),
                        price: priceSum / count
                    });
                }
                bucketStartTime = timestampInInterval;
                priceSum = 0;
                count = 0;
            }
            // Calculate price for each swap
            var amount0In = swap.amount0In, amount1In = swap.amount1In, amount0Out = swap.amount0Out, amount1Out = swap.amount1Out;
            if (amount0In !== 0 && amount1Out !== 0) {
                priceSum += amount1Out / amount0In; // Selling price
            }
            else if (amount1In !== 0 && amount0Out !== 0) {
                priceSum += amount1In / amount0Out; // Buying price
            }
            count++;
        });
        // Push the last bucket if it exists
        if (count > 0) {
            aggregatedSwaps.push({
                time: new Date(bucketStartTime * 1000).toLocaleTimeString("en-GB", { hour12: false }),
                price: priceSum / count
            });
        }
        return aggregatedSwaps;
    };
    var chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time",
                    color: "white"
                },
                ticks: {
                    color: "white"
                }
            },
            y: {
                title: {
                    display: true,
                    text: "Price",
                    color: "white"
                },
                ticks: {
                    color: "white"
                }
            }
        },
        plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'xy',
                    speed: 10,
                    threshold: 10
                },
                zoom: {
                    mode: 'x',
                    wheel: {
                        enabled: true
                    },
                    pinch: {
                        enabled: true
                    },
                    limits: {
                        y: { min: 0, max: 100 },
                        y2: { min: -5, max: 5 }
                    }
                }
            }
        }
    };
    var chartData = swaps
        ? {
            labels: aggregateSwapsByInterval(swaps, timeInterval).map(function (swap) { return swap.time; }),
            datasets: [
                {
                    label: (swapPair === null || swapPair === void 0 ? void 0 : swapPair.name.split(":")[1]) + " Price (USD)",
                    data: aggregateSwapsByInterval(swaps, timeInterval).map(function (swap) { return swap.price; }),
                    borderColor: "rgba(75,192,192,1)",
                    backgroundColor: "rgba(75,192,192,0.2)",
                    pointRadius: 1.2,
                    pointHoverRadius: 3,
                    borderWidth: 0.2,
                    fill: false
                },
            ]
        }
        : null;
    var handleIntervalChange = function (interval) {
        setTimeInterval(interval);
    };
    return (react_1["default"].createElement("div", { className: "text-white" }, error ? (react_1["default"].createElement("p", null,
        "Error: ",
        error)) : swapPair ? (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("h2", null, swapPair === null || swapPair === void 0 ? void 0 :
            swapPair.name.split(":")[1],
            " \uD83D\uDD01 ", swapPair === null || swapPair === void 0 ? void 0 :
            swapPair.name.split(":")[0]),
        react_1["default"].createElement("div", { className: "flex space-x-4" }, ['1m', '15m', '1h', '1d'].map(function (interval) { return (react_1["default"].createElement("button", { key: interval, className: "p-2 " + (timeInterval === interval ? 'bg-blue-500' : 'bg-gray-700') + " text-white", onClick: function () { return handleIntervalChange(interval); } }, interval)); })),
        swaps && chartData ? (react_1["default"].createElement("div", { className: "h-[550px]" },
            react_1["default"].createElement(react_chartjs_2_1.Line, { data: chartData, options: chartOptions }))) : (react_1["default"].createElement(LoadingScreenDots_1["default"], null)))) : (react_1["default"].createElement("p", null, "Loading..."))));
};
exports["default"] = PairChart;
