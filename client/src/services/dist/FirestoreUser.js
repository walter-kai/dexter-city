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
exports.getWalletUser = exports.getTelegramUser = exports.login = exports.updateUser = void 0;
var User_1 = require("../models/User");
var Telegram_1 = require("./Telegram");
/**
 * Create a new user in the DB.
 *
 * @returns {Promise<User>} The newly created User.
 */
var newUser = function () { return __awaiter(void 0, void 0, Promise, function () {
    var telegramUser, requestBody, req, response, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                telegramUser = Telegram_1["default"].getUserDetails().user;
                requestBody = {
                    telegramid: telegramUser.id,
                    firstname: telegramUser.first_name || null,
                    lastname: telegramUser.last_name || null,
                    handle: telegramUser.username || null,
                    referral: null,
                    firstTime: true
                };
                return [4 /*yield*/, fetch("/api/user/new", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(requestBody)
                    })];
            case 1:
                req = _a.sent();
                if (!req.ok) {
                    throw new Error("There was an error creating the new user.");
                }
                return [4 /*yield*/, req.json()];
            case 2:
                response = _a.sent();
                user = response.user;
                return [2 /*return*/, new User_1["default"](user)]; // Return the created User
        }
    });
}); };
/**
 * Updates an existing user based on the provided User object.
 *
 * @param {User} user - The user object containing the updated user data.
 * @returns {Promise<User>} - Returns the updated user.
 */
exports.updateUser = function (user) { return __awaiter(void 0, void 0, Promise, function () {
    var userPayload, res, updatedUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userPayload = {
                    walletId: user.walletId || null,
                    username: user.username,
                    telegramId: user.telegramId,
                    referralId: user.referralId || null,
                    dateCreated: user.dateCreated || new Date(),
                    lastLoggedIn: user.lastLoggedIn
                };
                return [4 /*yield*/, fetch("/api/user/update", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(userPayload)
                    })];
            case 1:
                res = _a.sent();
                // If the update fails, throw an error
                if (!res.ok) {
                    throw new Error("Failed to update the user.");
                }
                return [4 /*yield*/, res.json()];
            case 2:
                updatedUser = (_a.sent()).updatedUser;
                return [2 /*return*/, updatedUser];
        }
    });
}); };
/**
 * Log in the user based on their Telegram information.
 *
 * @returns {Promise<User>} The logged-in user.
 */
exports.login = function () { return __awaiter(void 0, void 0, Promise, function () {
    var _a, telegramUser, referral, res, _b, newUser, user;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = Telegram_1["default"].getUserDetails(), telegramUser = _a.user, referral = _a.referral;
                return [4 /*yield*/, fetch("/api/auth/login/", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: telegramUser.id,
                            first_name: telegramUser.first_name,
                            last_name: telegramUser.last_name || undefined,
                            username: telegramUser.username || undefined
                        })
                    })];
            case 1:
                res = _c.sent();
                // Handle response
                if (!res.ok) {
                    // Handle error, create user logic in backend
                    throw new Error('Login failed');
                }
                return [4 /*yield*/, res.json()];
            case 2:
                _b = (_c.sent()), newUser = _b.newUser, user = _b.user;
                // You can log the message if needed
                console.log(newUser); // Optional: log the message
                return [2 /*return*/, { newUser: newUser, user: user }]; // Return the user directly
        }
    });
}); };
/**
 * Fetch the user based on their Telegram ID.
 *
 * @returns {Promise<User | null>} Returns the user associated with the Telegram ID or null if not found.
 */
exports.getTelegramUser = function () { return __awaiter(void 0, void 0, Promise, function () {
    var telegramUser, url, res, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                telegramUser = Telegram_1["default"].getUserDetails().user;
                if (!telegramUser.id) {
                    console.warn("Telegram ID is missing");
                    return [2 /*return*/, null];
                }
                url = new URL("/api/user/telegram", window.location.origin);
                url.searchParams.append("telegramId", telegramUser.id);
                url.searchParams.append("username", telegramUser.first_name);
                return [4 /*yield*/, fetch(url.toString(), {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })];
            case 1:
                res = _a.sent();
                // If the user is not found, return null
                if (res.status === 404) {
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, res.json()];
            case 2:
                user = (_a.sent()).user;
                return [2 /*return*/, new User_1["default"](user)];
        }
    });
}); };
/**
 * Fetch the user based on their Wallet ID (from sessionStorage).
 *
 * @returns {Promise<User | null>} Returns the user associated with the Wallet ID or null if not found.
 */
exports.getWalletUser = function () { return __awaiter(void 0, void 0, Promise, function () {
    var walletId, url, res, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                walletId = sessionStorage.getItem("walletId");
                if (!walletId) {
                    console.warn("Wallet ID is missing in sessionStorage");
                    return [2 /*return*/, null];
                }
                url = new URL("/api/user/wallet", window.location.origin);
                url.searchParams.append("walletId", walletId);
                return [4 /*yield*/, fetch(url.toString(), {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })];
            case 1:
                res = _a.sent();
                // If the user is not found, return null
                if (res.status === 404) {
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, res.json()];
            case 2:
                user = (_a.sent()).user;
                return [2 /*return*/, new User_1["default"](user)];
        }
    });
}); };
