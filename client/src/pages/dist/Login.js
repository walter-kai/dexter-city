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
var react_1 = require("react");
var FirestoreUser_1 = require("../services/FirestoreUser");
var react_router_dom_1 = require("react-router-dom");
var LoadingScreenDots_1 = require("../components/LoadingScreenDots");
var OnboardForm_1 = require("./OnboardForm");
var Login = function () {
    var _a = react_1.useState(null), currentUser = _a[0], setCurrentUser = _a[1]; // State to store user information
    var navigate = react_router_dom_1.useNavigate(); // Initialize the navigate function
    var _b = react_1.useState(true), isOnboarding = _b[0], setIsOnboarding = _b[1];
    var _c = react_1.useState(true), loading = _c[0], setLoading = _c[1]; // State for loading user data
    var _d = react_1.useState(null), error = _d[0], setError = _d[1]; // State for error handling
    react_1.useEffect(function () {
        function fetchTelegramUser() {
            return __awaiter(this, void 0, void 0, function () {
                var user, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setLoading(true); // Set loading state
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, FirestoreUser_1.getTelegramUser()];
                        case 2:
                            user = _a.sent();
                            if (user) {
                                // If a user is logged in, navigate to the dashboard
                                sessionStorage.setItem('currentUser', JSON.stringify(user));
                                setCurrentUser(user); // Set the current user state
                                setIsOnboarding(false);
                                navigate("/dash");
                            }
                            return [3 /*break*/, 5];
                        case 3:
                            error_1 = _a.sent();
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
    }, [navigate]);
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
    var handleHowitworks = function () {
        // Call the function to trigger biometric login
        navigate('/howitworks');
    };
    var handleMetamaskLogin = function () { return __awaiter(void 0, void 0, void 0, function () {
        var accounts, walletId, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.ethereum) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, window.ethereum.request({
                            method: "eth_requestAccounts"
                        })];
                case 2:
                    accounts = _a.sent();
                    if (accounts && accounts.length > 0) {
                        walletId = accounts[0];
                        sessionStorage.setItem("walletId", walletId);
                        // Optionally, store the user's walletId in your backend or update the user state
                        setCurrentUser({ walletId: walletId }); // Assuming the User model has a walletId property
                        navigate("/dash"); // Navigate to the dashboard after successful login
                    }
                    else {
                        setError("No wallet accounts found.");
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error connecting to Metamask:", error_2);
                    setError("Failed to connect to Metamask. Please try again.");
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 6];
                case 5:
                    setError("Metamask is not installed.");
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    if (isOnboarding) {
        return (react_1["default"].createElement(OnboardForm_1["default"], { onComplete: handleCompleteOnboarding }));
    }
    return (react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center h-screen animate-fadeIn" }, currentUser ? (
    // If user is logged in, this part won't be shown
    react_1["default"].createElement("div", null, "Redirecting to dashboard...")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("button", { onClick: handleHowitworks, className: "bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300" }, "How it works"),
        react_1["default"].createElement("div", { className: "mt-4" },
            react_1["default"].createElement("button", { onClick: handleMetamaskLogin, className: "bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-700 transition duration-300" }, "Connect with Metamask"))))));
};
exports["default"] = Login;
