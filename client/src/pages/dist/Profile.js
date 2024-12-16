"use strict";
exports.__esModule = true;
var react_1 = require("react");
var LoadingScreenDots_1 = require("../components/LoadingScreenDots");
var Profile = function () {
    var _a = react_1.useState(null), userData = _a[0], setUserData = _a[1]; // Use User type
    var _b = react_1.useState(true), loading = _b[0], setLoading = _b[1]; // Start with loading as true
    react_1.useEffect(function () {
        // Simulate loading delay (could be replaced with actual data fetching)
        setLoading(true);
        try {
            var storedUserData = sessionStorage.getItem('currentUser');
            if (storedUserData) {
                setUserData(JSON.parse(storedUserData)); // Load user data from sessionStorage
            }
            else {
                console.log("No user data found in sessionStorage.");
            }
        }
        catch (err) {
            console.error('Error retrieving user data from sessionStorage: ', err);
        }
        finally {
            setLoading(false); // Stop loading once done
        }
    }, []); // Empty dependency array means this runs once on component mount
    if (loading) {
        return react_1["default"].createElement(LoadingScreenDots_1["default"], null); // Show loading animation
    }
    return (react_1["default"].createElement("div", { className: "container mx-auto" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h1", { className: "text-2xl font-bold mb-4" }, "Profile"),
            userData ? (react_1["default"].createElement("div", { className: "bg-white shadow-md rounded-lg p-4" },
                react_1["default"].createElement("h2", { className: "text-xl flex font-semibold" },
                    userData.username,
                    react_1["default"].createElement("div", { className: "text-base" },
                        "@",
                        userData.telegramId || 'N/A')),
                react_1["default"].createElement("p", null,
                    react_1["default"].createElement("strong", null, "Date Created:"),
                    " ",
                    new Date(userData.dateCreated).toLocaleString()),
                react_1["default"].createElement("p", null,
                    react_1["default"].createElement("strong", null, "Last Logged In:"),
                    " ",
                    new Date(userData.lastLoggedIn).toLocaleString()),
                react_1["default"].createElement("p", null,
                    react_1["default"].createElement("strong", null, "Referral:"),
                    " ",
                    userData.referralId || 'N/A'),
                react_1["default"].createElement("p", null,
                    react_1["default"].createElement("strong", null, "Telegram ID:"),
                    " ",
                    userData.telegramId))) : (react_1["default"].createElement("p", null, "No user data available.")))));
};
exports["default"] = Profile;
