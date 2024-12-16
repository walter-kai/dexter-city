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
var google_auth_library_1 = require("google-auth-library");
var firebase_admin_1 = require("firebase-admin");
var api_error_1 = require("../utils/api-error");
var logger_1 = require("../config/logger");
var User_1 = require("../../client/src/models/User");
var user_service_1 = require("./user.service");
/**
 * Google Login or Create User Service
 * @param {string} credential - The Google ID token from the client.
 * @returns {Promise<User>} - User instance.
 */
var googleLoginOrCreate = function (credential) { return __awaiter(void 0, void 0, Promise, function () {
    var GOOGLE_CLIENT_ID, client, ticket, payload, email, name, picture, googleId, userRef, userDoc, thisDateDontMatter, userArgs, userData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!credential) {
                    throw new api_error_1["default"](400, "Missing Google credential");
                }
                GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENTID;
                client = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, , 9]);
                return [4 /*yield*/, client.verifyIdToken({
                        idToken: credential,
                        audience: GOOGLE_CLIENT_ID
                    })];
            case 2:
                ticket = _a.sent();
                payload = ticket.getPayload();
                if (!payload) {
                    throw new api_error_1["default"](401, "Invalid Google token");
                }
                email = payload.email, name = payload.name, picture = payload.picture, googleId = payload.sub;
                if (!email) {
                    throw new api_error_1["default"](400, "Google ID token does not contain email");
                }
                userRef = firebase_admin_1["default"].firestore().collection("users").doc("" + googleId);
                return [4 /*yield*/, userRef.get()];
            case 3:
                userDoc = _a.sent();
                thisDateDontMatter = new Date();
                userArgs = void 0;
                userArgs = {
                    googleUid: 'ggle:' + googleId,
                    email: email,
                    firstName: name || '',
                    lastLoggedIn: thisDateDontMatter,
                    dateCreated: thisDateDontMatter,
                    photoUrl: picture || "",
                    referralId: null
                };
                if (!!userDoc.exists) return [3 /*break*/, 5];
                return [4 /*yield*/, user_service_1["default"].createUser(__assign({}, userArgs))];
            case 4: 
            // Reuse createUser to handle Firestore logic
            return [2 /*return*/, _a.sent()];
            case 5: 
            // If the user exists, update the lastLoggedIn timestamp
            return [4 /*yield*/, userRef.update({
                    lastLoggedIn: firebase_admin_1["default"].firestore.FieldValue.serverTimestamp()
                })];
            case 6:
                // If the user exists, update the lastLoggedIn timestamp
                _a.sent();
                userData = userDoc.data();
                if (!userData || !userData.uid || !userData.email || !userData.fullname) {
                    throw new api_error_1["default"](404, "User data is missing required fields in Firestore");
                }
                userArgs = {
                    uid: userData.uid,
                    email: userData.email,
                    fullname: userData.fullname,
                    lastLoggedIn: new Date(),
                    dateCreated: userData.dateCreated.toDate(),
                    photoUrl: userData.photoUrl || "",
                    referralId: userData.referralId || null
                };
                logger_1["default"].info("Found existing user: " + email + ":" + name);
                _a.label = 7;
            case 7: 
            // Create and return a User instance
            return [2 /*return*/, new User_1["default"](userArgs)];
            case 8:
                error_1 = _a.sent();
                logger_1["default"].error("Error during Google login:", error_1);
                throw new api_error_1["default"](401, "Unauthorized: Invalid Google credential");
            case 9: return [2 /*return*/];
        }
    });
}); };
exports["default"] = {
    googleLoginOrCreate: googleLoginOrCreate
};
