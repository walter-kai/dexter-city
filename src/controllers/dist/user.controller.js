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
// Import necessary dependencies
var user_service_1 = require("../services/user.service");
var api_error_1 = require("../utils/api-error");
var catch_async_1 = require("../utils/catch-async");
// Get a user by Telegram ID
// Get a user by Telegram ID
var getUserByWalletId = catch_async_1["default"](function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var walletId, wallet, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                walletId = req.query.walletId;
                wallet = walletId ? String(walletId) : '';
                // If neither walletId nor telegramId are provided, return a 400 error
                if (!walletId) {
                    throw new api_error_1["default"](400, "Missing walletId to get user");
                }
                return [4 /*yield*/, user_service_1["default"].getUserByWalletId(wallet)];
            case 1:
                user = _a.sent();
                // If user is not found, return a 404 error
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                }
                // Return the found user
                return [2 /*return*/, res.json({ user: user })];
        }
    });
}); });
// Get a user by Telegram ID
var getUserByTelegramId = catch_async_1["default"](function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, telegramId, username, telegram, name, user;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, telegramId = _a.telegramId, username = _a.username;
                telegram = telegramId ? String(telegramId) : '';
                name = username ? String(username) : '';
                // If neither walletId nor telegramId are provided, return a 400 error
                if (!telegramId) {
                    throw new api_error_1["default"](400, "Missing telegramId to get user");
                }
                return [4 /*yield*/, user_service_1["default"].getUserByTelegramId(telegram, name)];
            case 1:
                user = _b.sent();
                // If user is not found, return a 404 error
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                }
                // Return the found user
                return [2 /*return*/, res.json({ user: user })];
        }
    });
}); });
// Update a user's document by Telegram ID
var updateUser = catch_async_1["default"](function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, telegramId, walletId, updateData, updatedUser;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, telegramId = _a.telegramId, walletId = _a.walletId, updateData = _a.updateData;
                // Ensure at least one of walletId or telegramId is provided
                if (!telegramId && !walletId) {
                    throw new api_error_1["default"](400, "Missing telegramId or walletId in request body");
                }
                // Ensure updateData is provided
                if (!updateData || Object.keys(updateData).length === 0) {
                    throw new api_error_1["default"](400, "Missing update data in request body");
                }
                return [4 /*yield*/, user_service_1["default"].updateUser(walletId, telegramId, updateData)];
            case 1:
                updatedUser = _b.sent();
                if (!updatedUser) {
                    return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                }
                return [2 /*return*/, res.json({ message: "User updated successfully", user: updatedUser })];
        }
    });
}); });
// Create a new user
var createUser = catch_async_1["default"](function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, walletId, telegramId, newUser;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, walletId = _a.walletId, telegramId = _a.telegramId;
                if (!walletId || !telegramId) {
                    throw new api_error_1["default"](400, "Missing walletId or telegramId in request body");
                }
                return [4 /*yield*/, user_service_1["default"].createUser(req.body)];
            case 1:
                newUser = _b.sent();
                return [2 /*return*/, res.json({ message: "User created successfully", user: newUser })];
        }
    });
}); });
exports["default"] = {
    getUserByWalletId: getUserByWalletId,
    getUserByTelegramId: getUserByTelegramId,
    updateUser: updateUser,
    createUser: createUser
};
