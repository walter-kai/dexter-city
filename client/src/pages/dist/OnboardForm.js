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
var react_1 = require("react");
var react_dnd_1 = require("react-dnd");
var react_dnd_html5_backend_1 = require("react-dnd-html5-backend");
var FirestoreUser_1 = require("../services/FirestoreUser");
var ItemTypes = {
    SPORT: "sport"
};
// Reorder function for drag-and-drop
var reorder = function (list, startIndex, endIndex) {
    var result = Array.from(list);
    var removed = result.splice(startIndex, 1)[0];
    result.splice(endIndex, 0, removed);
    return result;
};
var grid = 8;
var tokenPairs = [
    { id: "BTCUSDT", name: "Bitcoin/USDT" },
    { id: "ETHUSDT", name: "Ethereum/USDT" },
    { id: "BNBUSDT", name: "Binance Coin/USDT" },
    { id: "ADAUSDT", name: "Cardano/USDT" },
    { id: "XRPUSDT", name: "XRP/USDT" },
    { id: "SOLUSDT", name: "Solana/USDT" },
    { id: "DOTUSDT", name: "Polkadot/USDT" },
    { id: "DOGEUSDT", name: "Dogecoin/USDT" },
];
var SportItem = function (_a) {
    var sport = _a.sport, index = _a.index, moveSport = _a.moveSport;
    var _b = react_dnd_1.useDrag({
        type: ItemTypes.SPORT,
        item: { index: index }
    }), ref = _b[1];
    var _c = react_dnd_1.useDrop({
        accept: ItemTypes.SPORT,
        hover: function (item) {
            if (item.index !== index) {
                moveSport(item.index, index);
                item.index = index; // Update the index for the dragged item
            }
        }
    }), drop = _c[1];
    return (react_1["default"].createElement("div", { ref: function (node) { return ref(drop(node)); }, style: { padding: grid * 2, margin: "0 0 " + grid + "px 0", background: "grey" } }, sport.name));
};
var OnboardForm = function (_a) {
    var onComplete = _a.onComplete;
    var _b = react_1.useState(0), currentPage = _b[0], setCurrentPage = _b[1];
    var _c = react_1.useState(""), userName = _c[0], setUserName = _c[1];
    var _d = react_1.useState([]), favoriteSports = _d[0], setFavoriteSports = _d[1];
    var _e = react_1.useState(false), scrolledToBottom = _e[0], setScrolledToBottom = _e[1];
    var termsRef = react_1.useRef(null);
    react_1.useEffect(function () {
        // Retrieve user data from sessionStorage
        var userData = JSON.parse(sessionStorage.getItem("user") || "{}");
        if (userData && userData.firstName) {
            setUserName(userData.firstName);
        }
        // Retrieve favorite sports from sessionStorage
        var storedSports = sessionStorage.getItem('favoriteSports');
        if (storedSports) {
            setFavoriteSports(JSON.parse(storedSports));
        }
        else {
            setFavoriteSports(tokenPairs);
        }
    }, []);
    react_1.useEffect(function () {
        // Save favoriteSports to sessionStorage whenever it changes
        if (favoriteSports.length > 0) {
            sessionStorage.setItem('favoriteSports', JSON.stringify(favoriteSports));
        }
    }, [favoriteSports]);
    react_1.useEffect(function () {
        // Check if favoriteSports contains items and skip onboarding
        if (favoriteSports.length > 0) {
            onComplete(userName, favoriteSports.map(function (sport) { return sport.name; }));
        }
    }, [favoriteSports, onComplete, userName]); // Dependencies include favoriteSports and onComplete
    var handleNext = function () {
        if (currentPage === 1) {
            if (favoriteSports.length === 0) {
                var updatedSports = reorder(tokenPairs, 0, 0);
                setFavoriteSports(updatedSports);
            }
            onComplete(userName, favoriteSports.map(function (sport) { return sport.name; }));
            // Retrieve user data from sessionStorage to update the user
            var userData = JSON.parse(sessionStorage.getItem("user") || "{}");
            var updatedUser = __assign(__assign({}, userData), { firstName: (userData === null || userData === void 0 ? void 0 : userData.firstName) || userName, dateCreated: (userData === null || userData === void 0 ? void 0 : userData.dateCreated) || new Date(), favoriteSports: favoriteSports.map(function (sport) { return sport.name; }), lastLoggedIn: new Date(), telegramId: (userData === null || userData === void 0 ? void 0 : userData.telegramId) || '', lastName: (userData === null || userData === void 0 ? void 0 : userData.lastName) || '', telegramHandle: (userData === null || userData === void 0 ? void 0 : userData.telegramHandle) || '', referralTelegramId: (userData === null || userData === void 0 ? void 0 : userData.referralTelegramId) || '', photoId: (userData === null || userData === void 0 ? void 0 : userData.photoId) || '', photoUrl: (userData === null || userData === void 0 ? void 0 : userData.photoUrl) || '' });
            sessionStorage.setItem("user", JSON.stringify(updatedUser)); // Update user in sessionStorage
            FirestoreUser_1.updateUser(updatedUser);
        }
        else {
            setCurrentPage(function (prev) { return prev + 1; });
        }
    };
    var handleBack = function () {
        setCurrentPage(function (prev) { return prev - 1; });
    };
    var moveSport = function (fromIndex, toIndex) {
        var updatedSports = reorder(favoriteSports, fromIndex, toIndex);
        setFavoriteSports(updatedSports);
    };
    var handleScroll = function () {
        var element = termsRef.current;
        if (element) {
            var isBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 25;
            setScrolledToBottom(isBottom);
        }
    };
    react_1.useEffect(function () {
        var element = termsRef.current;
        if (currentPage === 1 && element) {
            element.addEventListener("scroll", handleScroll);
            return function () {
                element.removeEventListener("scroll", handleScroll);
            };
        }
    }, [currentPage]);
    return (react_1["default"].createElement(react_dnd_1.DndProvider, { backend: react_dnd_html5_backend_1.HTML5Backend },
        react_1["default"].createElement("div", { className: "max-w-md mx-auto p-4 mt-8 bg-white rounded-lg shadow-md" },
            currentPage === 0 && (react_1["default"].createElement("div", null,
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Welcome to the App! \uD83C\uDF89"),
                react_1["default"].createElement("p", null,
                    "Hello ",
                    react_1["default"].createElement("strong", null, userName),
                    "! \uD83D\uDE0A"),
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "\uD83E\uDE74\uD83C\uDF76\uD83E\uDDFC Pick your pairs \uD83D\uDC7E\uD83C\uDF2E\uD83D\uDC7D"),
                react_1["default"].createElement("p", null, "You can change this later in settings"),
                react_1["default"].createElement("div", null, favoriteSports.map(function (sport, index) { return (react_1["default"].createElement(SportItem, { key: sport.id, sport: sport, index: index, moveSport: moveSport })); })))),
            currentPage === 1 && (react_1["default"].createElement("div", null,
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Rules, Terms and Conditions \uD83D\uDCDC"),
                react_1["default"].createElement("p", null, "Before completing your registration, please read and accept our rules:"),
                react_1["default"].createElement("div", { ref: termsRef, className: "overflow-y-scroll h-80 p-4 border border-gray-300 rounded mb-4" },
                    react_1["default"].createElement("ul", { className: "list-disc list-inside" },
                        react_1["default"].createElement("li", null,
                            "\uD83E\uDD1D ",
                            react_1["default"].createElement("strong", null, "Be Respectful:"),
                            " Treat everyone with kindness and respect."),
                        react_1["default"].createElement("li", null,
                            "\uD83D\uDEAB ",
                            react_1["default"].createElement("strong", null, "No Spamming or Illegal Content:"),
                            " Keep the chat clean."),
                        react_1["default"].createElement("li", null,
                            "\uD83C\uDFC6 ",
                            react_1["default"].createElement("strong", null, "Community Sharing:"),
                            " Stats will be shared with the community."),
                        react_1["default"].createElement("li", null,
                            "\uD83D\uDD12 ",
                            react_1["default"].createElement("strong", null, "Privacy Matters:"),
                            " Your data will be handled with care."),
                        react_1["default"].createElement("li", null,
                            "\u26A0\uFE0F ",
                            react_1["default"].createElement("strong", null, "Play Responsibly:"),
                            " Enjoy the experience, but play responsibly."),
                        react_1["default"].createElement("li", null,
                            "\uD83D\uDD04 ",
                            react_1["default"].createElement("strong", null, "Terms Are Subject to Change:"),
                            " Rules may change as we grow."))),
                react_1["default"].createElement("p", { className: "mt-4" }, "Scroll down before you can continue."))),
            react_1["default"].createElement("div", { className: "mt-4" },
                currentPage > 0 && (react_1["default"].createElement("button", { type: "button", onClick: handleBack, className: "bg-gray-500 text-white px-4 py-2 rounded mr-2" }, "Back")),
                react_1["default"].createElement("button", { type: "button", onClick: handleNext, className: "btn-standard", disabled: currentPage === 1 && !scrolledToBottom }, currentPage === 1 ? "Complete" : "Next")))));
};
exports["default"] = OnboardForm;
