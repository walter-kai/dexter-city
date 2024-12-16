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
exports.__esModule = true;
exports.TelegramApp = exports.defaultTelegramUser = void 0;
var sdk_1 = require("@telegram-apps/sdk");
// Default user object
exports.defaultTelegramUser = {
    first_name: "Walter",
    last_name: "Yaoza",
    username: "kai",
    id: "5030917144",
    is_bot: false
};
// TelegramApp class implementation
var TelegramApp = /** @class */ (function () {
    function TelegramApp() {
        this.webApp = window.Telegram.WebApp;
        this.user = this.getUser();
        this.biometricManager = this.getBiometricManager();
        this.referral = this.getReferral();
    }
    TelegramApp.prototype.getBiometricManager = function () {
        var _this = this;
        var biometricManager = this.webApp.BiometricManager;
        // Provide default implementations for missing properties
        return __assign({ isInited: biometricManager.isInited || false, isBiometricAvailable: biometricManager.isBiometricAvailable || (function () { return false; }), biometricType: biometricManager.biometricType || "none", isAccessRequested: biometricManager.isAccessRequested || (function () { return false; }), requestAccess: biometricManager.requestAccess || (function () { return _this.biometricManager; }) }, biometricManager);
    };
    TelegramApp.prototype.getUser = function () {
        var _a;
        var user = ((_a = this.webApp.initDataUnsafe) === null || _a === void 0 ? void 0 : _a.user) || exports.defaultTelegramUser;
        return __assign(__assign({}, user), { id: String(user.id || ""), username: (user === null || user === void 0 ? void 0 : user.username) || "", first_name: (user === null || user === void 0 ? void 0 : user.first_name) || "", last_name: (user === null || user === void 0 ? void 0 : user.last_name) || "", is_bot: user.is_bot || true });
    };
    TelegramApp.prototype.getReferral = function () {
        var _a;
        var startParam = (_a = this.webApp.initDataUnsafe) === null || _a === void 0 ? void 0 : _a.start_param;
        var referral = null;
        if (startParam) {
            var params = startParam.split("-");
            params.forEach(function (param) {
                if (param.startsWith("ref_")) {
                    referral = param.split("_")[1] || "5025509571"; // Default to fallback referral ID
                }
            });
        }
        return referral;
    };
    TelegramApp.prototype.biometricTrigger = function () {
        // console.log("heool", this.biometricManager.biometricType);
        var _this = this;
        if (!this.biometricManager.isBiometricAvailable) {
            console.error("Biometric authentication is not available");
            this.showAlert("Biometric authentication is not available on this device.");
            return;
        }
        this.biometricManager.init();
        var params = {
            reason: "Authenticate to continue"
        };
        this.biometricManager.requestAccess(params, function (success, error) {
            if (success) {
                console.log("Biometric access granted");
                _this.showAlert("Biometric access granted!");
            }
            else {
                console.error("Biometric access denied:", error);
                _this.showAlert("Biometric access denied. Please try again.");
            }
        });
    };
    TelegramApp.prototype.showAlert = function (message) {
        this.webApp.showAlert(message);
    };
    TelegramApp.prototype.emitEvent = function (method, params) {
        try {
            sdk_1.postEvent(method, params);
            console.log("Event \"" + method + "\" posted successfully", params);
        }
        catch (error) {
            console.error("Failed to post event \"" + method + "\":", error);
        }
    };
    TelegramApp.prototype.getUserDetails = function () {
        return {
            user: this.user,
            referral: this.referral
        };
    };
    return TelegramApp;
}());
exports.TelegramApp = TelegramApp;
// Export the instance of TelegramApp
var telegramAppInstance = new TelegramApp();
exports["default"] = telegramAppInstance;
