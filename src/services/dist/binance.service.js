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
// Import Binance MainClient
var crypto_1 = require("crypto"); // For HMAC SHA256 signature generation
// Binance API credentials
var API_KEY = 'phDMYGRMJtNdHl3wdVsSfYU2q8EYBUFjMdgOOvLEU0UPPS2M6imGvo4S6WY47CrA';
var API_SECRET = '0zdO18SGLCi11YEcEkvHXlkRKEv9DuPwfeSUtrxBkVNoE24M32uDMldovqCmaTB1';
// Base URL for Binance Testnet
var BASE_URL = 'https://testnet.binance.vision';
// Fetch server timestamp
function serverTimestamp() {
    return __awaiter(this, void 0, Promise, function () {
        var url, response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = BASE_URL + "/api/v3/time";
                    return [4 /*yield*/, fetch(url)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data.serverTime];
            }
        });
    });
}
// Generate HMAC SHA256 signature
function generateSignature(queryString) {
    return crypto_1["default"].createHmac('sha256', API_SECRET).update(queryString).digest('hex');
}
// Fetch account trade list
var getAccountTradeList = function (symbol) { return __awaiter(void 0, void 0, Promise, function () {
    var timestamp, params_1, queryString, signature, signedQueryString, url, response, result, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, serverTimestamp()];
            case 1:
                timestamp = _a.sent();
                params_1 = {
                    symbol: symbol,
                    timestamp: timestamp
                };
                queryString = Object.keys(params_1)
                    .map(function (key) { return key + "=" + encodeURIComponent(params_1[key]); })
                    .join('&');
                signature = generateSignature(queryString);
                signedQueryString = queryString + "&signature=" + signature;
                url = BASE_URL + "/api/v3/myTrades?" + signedQueryString;
                return [4 /*yield*/, fetch(url, {
                        method: 'GET',
                        headers: {
                            'X-MBX-APIKEY': API_KEY
                        }
                    })];
            case 2:
                response = _a.sent();
                if (!response.ok) {
                    throw new Error("HTTP error! status: " + response.status);
                }
                return [4 /*yield*/, response.json()];
            case 3:
                result = _a.sent();
                return [2 /*return*/, result];
            case 4:
                err_1 = _a.sent();
                console.error('getAccountTradeList error: ', err_1);
                throw err_1;
            case 5: return [2 /*return*/];
        }
    });
}); };
// Fetch exchange information
var getExchangeInfo = function () { return __awaiter(void 0, void 0, Promise, function () {
    var url, response, result, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                url = BASE_URL + "/api/v3/exchangeInfo";
                return [4 /*yield*/, fetch(url, {
                        method: 'GET',
                        headers: {
                            'X-MBX-APIKEY': API_KEY
                        }
                    })];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    throw new Error("HTTP error! status: " + response.status);
                }
                return [4 /*yield*/, response.json()];
            case 2:
                result = _a.sent();
                return [2 /*return*/, result];
            case 3:
                err_2 = _a.sent();
                console.error('getExchangeInfo error: ', err_2);
                throw err_2;
            case 4: return [2 /*return*/];
        }
    });
}); };
// Export functions for use in other modules
exports["default"] = { getAccountTradeList: getAccountTradeList, getExchangeInfo: getExchangeInfo };
