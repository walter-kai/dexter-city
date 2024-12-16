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
var firestore_1 = require("@google-cloud/firestore");
var firebase_1 = require("../config/firebase");
var logger_1 = require("../config/logger");
var User_1 = require("../../client/src/models/User");
// Helper function to get a user by walletId (optional telegramId)
function getUser(walletId, telegramId) {
    return __awaiter(this, void 0, Promise, function () {
        var usersRef, snapshot, userDoc, userData, tstamp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    usersRef = firebase_1.db.collection("users");
                    if (!walletId) return [3 /*break*/, 2];
                    return [4 /*yield*/, usersRef.where("walletId", "==", walletId).get()];
                case 1:
                    snapshot = _a.sent();
                    return [3 /*break*/, 5];
                case 2:
                    if (!telegramId) return [3 /*break*/, 4];
                    return [4 /*yield*/, usersRef.where("telegramId", "==", telegramId).get()];
                case 3:
                    snapshot = _a.sent();
                    return [3 /*break*/, 5];
                case 4: return [2 /*return*/, null];
                case 5:
                    if (snapshot.empty) {
                        logger_1["default"].info("User with walletId " + walletId + " or telegramId " + telegramId + " not found.");
                        return [2 /*return*/, null];
                    }
                    userDoc = snapshot.docs[0];
                    userData = userDoc.data();
                    tstamp = new firestore_1.Timestamp(userData.dateCreated.seconds, userData.dateCreated.nanoseconds).toDate();
                    return [2 /*return*/, new User_1["default"]({
                            walletId: userData.walletId,
                            username: userData.username,
                            telegramId: userData.telegramId || null,
                            referralId: userData.referralId || null,
                            dateCreated: tstamp,
                            lastLoggedIn: new Date(userData.lastLoggedIn)
                        })];
            }
        });
    });
}
// Simplified createUser function taking a User object (partial)
function createUser(args, breadcrumb) {
    return __awaiter(this, void 0, Promise, function () {
        var newBreadcrumb, timeNow, userArgs, usersRef, q, querySnapshot, existingUserDoc, existingUserData, tstamp, documentId, newUserSnapshot, newUserData, newTstamp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newBreadcrumb = "createUser(" + (args.walletId || args.telegramId) + "):" + breadcrumb;
                    timeNow = firestore_1.Timestamp.now();
                    userArgs = {
                        walletId: args.walletId,
                        username: args.username,
                        telegramId: args.telegramId,
                        referralId: args.referralId,
                        dateCreated: timeNow,
                        lastLoggedIn: timeNow.toDate()
                    };
                    usersRef = firebase_1.db.collection('users');
                    q = usersRef.where("walletId", "==", args.walletId).where("telegramId", "==", args.telegramId);
                    return [4 /*yield*/, q.get()];
                case 1:
                    querySnapshot = _a.sent();
                    if (!querySnapshot.empty) {
                        existingUserDoc = querySnapshot.docs[0];
                        existingUserData = existingUserDoc.data();
                        logger_1["default"].info("User with walletId " + args.walletId + " or telegramId " + args.telegramId + " already exists.");
                        tstamp = new firestore_1.Timestamp(existingUserData.dateCreated.seconds, existingUserData.dateCreated.nanoseconds).toDate();
                        return [2 /*return*/, new User_1["default"]({
                                walletId: existingUserData.walletId,
                                username: existingUserData.username,
                                telegramId: existingUserData.telegramId || null,
                                referralId: existingUserData.referralId || null,
                                dateCreated: tstamp,
                                lastLoggedIn: new Date(existingUserData.lastLoggedIn)
                            })];
                    }
                    documentId = "" + (args.walletId || args.telegramId);
                    return [4 /*yield*/, usersRef.doc(documentId).set(userArgs)];
                case 2:
                    _a.sent();
                    logger_1["default"].info("Created new user with walletId " + args.walletId + " or telegramId " + args.telegramId + ".");
                    return [4 /*yield*/, usersRef.doc(documentId).get()];
                case 3:
                    newUserSnapshot = _a.sent();
                    newUserData = newUserSnapshot.data();
                    newTstamp = new firestore_1.Timestamp(newUserData.dateCreated.seconds, newUserData.dateCreated.nanoseconds).toDate();
                    return [2 /*return*/, new User_1["default"]({
                            walletId: newUserData.walletId,
                            username: newUserData.username,
                            telegramId: newUserData.telegramId || null,
                            referralId: newUserData.referralId || null,
                            dateCreated: newTstamp,
                            lastLoggedIn: new Date(newUserData.lastLoggedIn)
                        })];
            }
        });
    });
}
// Helper function to update an existing user
function updateUser(walletId, telegramId, updateData) {
    return __awaiter(this, void 0, Promise, function () {
        var usersRef, snapshot, userDoc, userId, updatedUserDoc, updatedUserData, tstamp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    usersRef = firebase_1.db.collection("users");
                    if (!walletId) return [3 /*break*/, 2];
                    return [4 /*yield*/, usersRef.where("walletId", "==", walletId).get()];
                case 1:
                    snapshot = _a.sent();
                    return [3 /*break*/, 5];
                case 2:
                    if (!telegramId) return [3 /*break*/, 4];
                    return [4 /*yield*/, usersRef.where("telegramId", "==", telegramId).get()];
                case 3:
                    snapshot = _a.sent();
                    return [3 /*break*/, 5];
                case 4: return [2 /*return*/, null];
                case 5:
                    if (snapshot.empty) {
                        logger_1["default"].info("User with walletId " + walletId + " or telegramId " + telegramId + " not found.");
                        return [2 /*return*/, null];
                    }
                    userDoc = snapshot.docs[0];
                    userId = userDoc.id;
                    // Update user with new data
                    return [4 /*yield*/, usersRef.doc(userId).update(updateData)];
                case 6:
                    // Update user with new data
                    _a.sent();
                    logger_1["default"].info("User with walletId " + walletId + " or telegramId " + telegramId + " has been updated.");
                    return [4 /*yield*/, usersRef.doc(userId).get()];
                case 7:
                    updatedUserDoc = _a.sent();
                    updatedUserData = updatedUserDoc.data();
                    tstamp = new firestore_1.Timestamp(updatedUserData.dateCreated.seconds, updatedUserData.dateCreated.nanoseconds).toDate();
                    return [2 /*return*/, new User_1["default"]({
                            walletId: updatedUserData.walletId,
                            username: updatedUserData.username,
                            telegramId: updatedUserData.telegramId || null,
                            referralId: updatedUserData.referralId || null,
                            dateCreated: tstamp,
                            lastLoggedIn: new Date(updatedUserData.lastLoggedIn)
                        })];
            }
        });
    });
}
exports["default"] = {
    getUser: getUser,
    createUser: createUser,
    updateUser: updateUser
};
