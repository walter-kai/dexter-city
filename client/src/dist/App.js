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
require("./styles/styles.css");
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var Trending_1 = require("./pages/Trending");
var Share_1 = require("./pages/Share");
var UserGuide_1 = require("./pages/UserGuide");
var Support_1 = require("./pages/Support");
var NotFound_1 = require("./pages/NotFound");
var Quit_1 = require("./pages/Quit");
var Profile_1 = require("./pages/Profile");
var OnboardForm_1 = require("./pages/OnboardForm");
var Dashboard_1 = require("./pages/Dashboard");
var FirestoreUser_1 = require("./services/FirestoreUser"); // Import newUser function
var react_dnd_1 = require("react-dnd");
var react_dnd_html5_backend_1 = require("react-dnd-html5-backend");
var LoadingScreenDots_1 = require("./components/LoadingScreenDots");
var App = function () {
    var _a = react_1.useState(true), isOnboarding = _a[0], setIsOnboarding = _a[1];
    var _b = react_1.useState(true), loading = _b[0], setLoading = _b[1]; // State for loading user data
    var _c = react_1.useState(null), error = _c[0], setError = _c[1]; // State for error handling
    var _d = react_1.useState(null), currentUser = _d[0], setCurrentUser = _d[1]; // State for current user
    react_1.useEffect(function () {
        function fetchTelegramUser() {
            return __awaiter(this, void 0, void 0, function () {
                var _a, newUser, user, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            setLoading(true); // Set loading state
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, FirestoreUser_1.login()];
                        case 2:
                            _a = _b.sent(), newUser = _a.newUser, user = _a.user;
                            // Store the user in sessionStorage
                            sessionStorage.setItem('currentUser', JSON.stringify(user));
                            setCurrentUser(user); // Set the current user state
                            setIsOnboarding(newUser);
                            return [3 /*break*/, 5];
                        case 3:
                            error_1 = _b.sent();
                            console.error("Error fetching Telegram user:", error_1);
                            setError("Failed to fetch Telegram user. Please try again."); // Set error state
                            return [3 /*break*/, 5];
                        case 4:
                            setLoading(false); // Reset loading state
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
        // Check if user exists in sessionStorage
        var storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser)); // Set the stored user from sessionStorage
            setIsOnboarding(false); // Skip onboarding if user exists
            setLoading(false); // Set loading to false
        }
        else {
            fetchTelegramUser(); // Fetch user if not found in sessionStorage
        }
    }, []);
    var handleCompleteOnboarding = function (chosenName, favoriteSport) {
        console.log("Onboarding complete with name:", chosenName, "and favorite sports:", favoriteSport);
        setIsOnboarding(false); // Update the onboarding state
    };
    if (loading) {
        return react_1["default"].createElement(LoadingScreenDots_1["default"], null); // Optional loading state
    }
    if (error) {
        return react_1["default"].createElement("div", { className: "text-red-500" }, error); // Show error message
    }
    return (react_1["default"].createElement("div", { className: "mx-auto" }, isOnboarding ? (react_1["default"].createElement(react_dnd_1.DndProvider, { backend: react_dnd_html5_backend_1.HTML5Backend },
        react_1["default"].createElement(OnboardForm_1["default"], { onComplete: handleCompleteOnboarding }))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(react_router_dom_1.Routes, null,
            react_1["default"].createElement(react_router_dom_1.Route, { path: "/", element: react_1["default"].createElement(Dashboard_1["default"], null) }),
            react_1["default"].createElement(react_router_dom_1.Route, { path: "/trending", element: react_1["default"].createElement(Trending_1["default"], null) }),
            react_1["default"].createElement(react_router_dom_1.Route, { path: "/profile", element: react_1["default"].createElement(Profile_1["default"], null) }),
            react_1["default"].createElement(react_router_dom_1.Route, { path: "/share", element: react_1["default"].createElement(Share_1["default"], null) }),
            react_1["default"].createElement(react_router_dom_1.Route, { path: "/user-guide", element: react_1["default"].createElement(UserGuide_1["default"], null) }),
            react_1["default"].createElement(react_router_dom_1.Route, { path: "/support", element: react_1["default"].createElement(Support_1["default"], null) }),
            react_1["default"].createElement(react_router_dom_1.Route, { path: "/quit", element: react_1["default"].createElement(Quit_1["default"], null) }),
            react_1["default"].createElement(react_router_dom_1.Route, { path: "*", element: react_1["default"].createElement(NotFound_1["default"], null) }))))));
};
exports["default"] = App;
