"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var user_service_1 = require("./user.service");
var api_error_1 = require("../utils/api-error");
var User_1 = require("../../client/src/models/User");
var firebase_admin_1 = require("firebase-admin"); // Import admin SDK
var logger_1 = require("../config/logger");
var stream_1 = require("stream");
/**
 * Get a test message
 * @returns {string} The message we want to return
 */
var getTestMessage = function () { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, "The message is hello!"];
    });
}); };
/**
 * Download the file from Telegram and upload it to Firebase Storage.
 * @param {Telegraf} bot - The Telegraf bot instance.
 * @param {string} fileId - The file ID to fetch the image.
 * @param {string} userId - The user's Telegram ID to create a unique filename.
 * @returns {Promise<string | null>} The download URL in Firebase Storage or null if not successful.
 */
var downloadAndUploadToFirebase = function (bot, fileId, userId) { return __awaiter(void 0, void 0, Promise, function () {
    var file, fileUrl, response, bucket_1, fileName_1, fileUploadStream_1, passThroughStream_1, reader_1, pump, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                return [4 /*yield*/, bot.telegram.getFile(fileId)];
            case 1:
                file = _b.sent();
                if (!(file && file.file_path)) return [3 /*break*/, 3];
                fileUrl = "https://api.telegram.org/file/bot" + process.env.TELEGRAM_TOKEN + "/" + file.file_path;
                return [4 /*yield*/, fetch(fileUrl)];
            case 2:
                response = _b.sent();
                if (!response.ok)
                    throw new Error('Failed to fetch file from Telegram');
                bucket_1 = firebase_admin_1["default"].storage().bucket();
                fileName_1 = userId + ".jpg";
                fileUploadStream_1 = bucket_1.file("profilePics/" + fileName_1).createWriteStream({
                    metadata: {
                        contenttype: response.headers.get('content-type')
                    }
                });
                passThroughStream_1 = new stream_1.PassThrough();
                reader_1 = (_a = response.body) === null || _a === void 0 ? void 0 : _a.getReader();
                pump = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!true) return [3 /*break*/, 2];
                                return [4 /*yield*/, (reader_1 === null || reader_1 === void 0 ? void 0 : reader_1.read())];
                            case 1:
                                result = _a.sent();
                                if (result === null || result === void 0 ? void 0 : result.done)
                                    return [3 /*break*/, 2]; // Exit loop if done
                                // Push the chunk into the PassThrough stream
                                passThroughStream_1.write(result === null || result === void 0 ? void 0 : result.value);
                                return [3 /*break*/, 0];
                            case 2:
                                passThroughStream_1.end(); // End the PassThrough stream
                                return [2 /*return*/];
                        }
                    });
                }); };
                pump()["catch"](function (err) {
                    console.error('Error reading response stream:', err);
                    passThroughStream_1.destroy(err); // Handle errors and destroy stream
                });
                // Pipe PassThrough to the upload stream
                passThroughStream_1.pipe(fileUploadStream_1);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        fileUploadStream_1.on('finish', function () {
                            // Get the public URL of the uploaded file
                            var publicUrl = "https://firebasestorage.googleapis.com/v0/b/" + bucket_1.name + "/o/profilePics%2F" + encodeURIComponent(fileName_1) + "?alt=media";
                            // Log successful upload
                            logger_1["default"].info("Successfully uploaded profile picture for userId: " + userId + ", URL: " + publicUrl);
                            resolve(publicUrl);
                        });
                        fileUploadStream_1.on('error', function (error) {
                            console.error('Error uploading file to Firestore Storage:', error);
                            reject(null);
                        });
                    })];
            case 3: return [2 /*return*/, null];
            case 4:
                error_1 = _b.sent();
                console.error("Error downloading or uploading file:", error_1);
                return [2 /*return*/, null];
            case 5: return [2 /*return*/];
        }
    });
}); };
var getUserByWalletId = function (walletId, breadcrumb) { return __awaiter(void 0, void 0, Promise, function () {
    var newBreadcrumb, usersCollection, q, querySnapshot, userMap;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                newBreadcrumb = "getUserByWalletId(" + walletId + "):" + breadcrumb;
                logger_1["default"].info(JSON.stringify({ breadcrumb: newBreadcrumb }));
                if (telegramIds.length > 30) {
                    throw new api_error_1["default"](400, "Too many telegramIds, max 30. " + newBreadcrumb);
                }
                usersCollection = db.collection('users');
                q = usersCollection.where("walletId", "in", telegramIds);
                return [4 /*yield*/, q.get()];
            case 1:
                querySnapshot = _a.sent();
                logger_1["default"].info(JSON.stringify({ breadcrumb: newBreadcrumb, querySnapshotSize: querySnapshot.size }));
                userMap = {};
                querySnapshot.forEach(function (doc) {
                    var _a;
                    var queryData = doc.data();
                    // Ensure photoId is either string or null (not undefined)
                    var photoId = queryData.photoId !== undefined ? queryData.photoId : null;
                    var photoUrl = queryData.photoUrl !== undefined ? queryData.photoUrl : null;
                    userMap[queryData.telegramId] = new User_1["default"](__assign(__assign({}, queryData), { photoId: photoId,
                        photoUrl: photoUrl, dateCreated: ((_a = doc.createTime) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date() }));
                });
                logger_1["default"].info(JSON.stringify({ breadcrumb: newBreadcrumb, userMap: userMap }));
                return [2 /*return*/, userMap];
        }
    });
}); };
/**
 * Login or create a user based on their walletId.
 * @param {string} walletId - The unique wallet ID of the user.
 * @param {Partial<UserArgs>} userDetails - Additional user details to create or update the user.
 * @returns {Promise<{ message: string, user: User | null, newUser: boolean | null }>} A message, user data, and whether the user is new.
 */
var loginOrCreate = function (walletId, userDetails, breadcrumb) { return __awaiter(void 0, void 0, Promise, function () {
    var users, existingUser, breadcrumb_1, newBreadcrumb, userPayload, newUser, updatedUser, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, getUserByWalletId(walletId, breadcrumb_1)];
            case 1:
                users = _a.sent();
                existingUser = users && users[walletId] ? users[walletId] : null;
                breadcrumb_1 = "Logging in user with walletId: " + walletId;
                newBreadcrumb = "loginOrCreate(" + walletId + "):" + breadcrumb_1;
                logger_1["default"].info(JSON.stringify({ breadcrumb: newBreadcrumb }));
                userPayload = {
                    walletId: walletId,
                    firstName: userDetails.firstName || null,
                    lastName: userDetails.lastName || null,
                    email: userDetails.email || null,
                    lastLoggedIn: new Date(),
                    dateCreated: (existingUser === null || existingUser === void 0 ? void 0 : existingUser.dateCreated) || new Date()
                };
                if (!!existingUser) return [3 /*break*/, 3];
                return [4 /*yield*/, user_service_1["default"].createUser(userPayload)];
            case 2:
                newUser = _a.sent();
                return [2 /*return*/, {
                        message: "User created",
                        user: newUser,
                        newUser: true
                    }];
            case 3: return [4 /*yield*/, user_service_1["default"].updateUser(userPayload)];
            case 4:
                updatedUser = _a.sent();
                return [2 /*return*/, {
                        message: "User updated",
                        user: updatedUser || null,
                        newUser: false
                    }];
            case 5: return [3 /*break*/, 7];
            case 6:
                error_2 = _a.sent();
                console.error("Error during login or create:", error_2);
                return [2 /*return*/, {
                        message: "An error occurred",
                        user: null,
                        newUser: null
                    }];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports["default"] = {
    getTestMessage: getTestMessage,
    loginOrCreate: loginOrCreate
};
