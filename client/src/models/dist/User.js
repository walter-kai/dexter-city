"use strict";
exports.__esModule = true;
// Simplified User class definition
var User = /** @class */ (function () {
    function User(args) {
        this.walletId = args.walletId;
        this.username = args.username;
        this.telegramId = args.telegramId || null;
        this.referralId = args.referralId || null;
        this.dateCreated = args.dateCreated;
        this.lastLoggedIn = args.lastLoggedIn;
    }
    return User;
}());
exports["default"] = User;
