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
var crypto_1 = require("crypto"); // For HMAC SHA256 signature generation
// Binance API credentials
var API_KEY = 'phDMYGRMJtNdHl3wdVsSfYU2q8EYBUFjMdgOOvLEU0UPPS2M6imGvo4S6WY47CrA';
var API_SECRET = '0zdO18SGLCi11YEcEkvHXlkRKEv9DuPwfeSUtrxBkVNoE24M32uDMldovqCmaTB1';
// Base URL for Binance Testnet
var BASE_URL = 'https://testnet.binance.vision';
var BinanceAPI = /** @class */ (function () {
    function BinanceAPI(apiKey, apiSecret) {
        if (apiKey === void 0) { apiKey = API_KEY; }
        if (apiSecret === void 0) { apiSecret = API_SECRET; }
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }
    // Generate HMAC SHA256 signature
    BinanceAPI.prototype.generateSignature = function (queryString) {
        return crypto_1["default"].createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
    };
    // Fetch server timestamp
    BinanceAPI.prototype.serverTimestamp = function () {
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
    };
    // Get account trade list
    BinanceAPI.prototype.getAccountTradeList = function (symbol) {
        return __awaiter(this, void 0, Promise, function () {
            var timestamp, params, queryString, signature, signedQueryString, url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.serverTimestamp()];
                    case 1:
                        timestamp = _a.sent();
                        params = {
                            symbol: symbol,
                            timestamp: timestamp
                        };
                        queryString = Object.keys(params)
                            .map(function (key) { return key + "=" + encodeURIComponent(params[key]); })
                            .join('&');
                        signature = this.generateSignature(queryString);
                        signedQueryString = queryString + "&signature=" + signature;
                        url = BASE_URL + "/api/v3/myTrades?" + signedQueryString;
                        return [4 /*yield*/, fetch(url, {
                                method: 'GET',
                                headers: {
                                    'X-MBX-APIKEY': this.apiKey
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("HTTP error! status: " + response.status);
                        return [2 /*return*/, response.json()];
                }
            });
        });
    };
    // Get exchange information
    BinanceAPI.prototype.getExchangeInfo = function () {
        return __awaiter(this, void 0, Promise, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = BASE_URL + "/api/v3/exchangeInfo";
                        return [4 /*yield*/, fetch(url, {
                                method: 'GET',
                                headers: {
                                    'X-MBX-APIKEY': this.apiKey
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("HTTP error! status: " + response.status);
                        return [2 /*return*/, response.json()];
                }
            });
        });
    };
    // Generate authorization URL
    BinanceAPI.prototype.authorize = function (clientId, redirectUri, state, scope) {
        if (state === void 0) { state = ''; }
        var url = "https://accounts.binance.com/en/oauth/authorize?response_type=code&client_id=" + encodeURIComponent(clientId) + "&redirect_uri=" + encodeURIComponent(redirectUri) + "&state=" + encodeURIComponent(state) + "&scope=" + encodeURIComponent(scope);
        return url;
    };
    return BinanceAPI;
}());
exports["default"] = BinanceAPI;
