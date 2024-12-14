"use strict";

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = void 0 && (void 0).__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

exports.__esModule = true;

var react_1 = require("react");

var LoadingScreenDots_1 = require("../components/LoadingScreenDots");

var Profile = function Profile() {
  var _a = react_1.useState(null),
      userData = _a[0],
      setUserData = _a[1]; // Use User type


  var _b = react_1.useState(false),
      loading = _b[0],
      setLoading = _b[1];

  react_1.useEffect(function () {
    // Check sessionStorage for user data
    var storedUserData = sessionStorage.getItem('userData');

    if (storedUserData) {
      setUserData(JSON.parse(storedUserData)); // Load user data from sessionStorage
    } else {
      setLoading(true); // If no user data in sessionStorage, try fetching it from API

      var fetchUserData = function fetchUserData() {
        return __awaiter(void 0, void 0, void 0, function () {
          var response, data, err_1;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 3, 4, 5]);

                return [4
                /*yield*/
                , fetch('/api/me')];

              case 1:
                response = _a.sent();
                return [4
                /*yield*/
                , response.json()];

              case 2:
                data = _a.sent(); // Store the fetched user data in sessionStorage

                sessionStorage.setItem('userData', JSON.stringify(data));
                setUserData(data);
                return [3
                /*break*/
                , 5];

              case 3:
                err_1 = _a.sent();
                console.error(err_1);
                return [3
                /*break*/
                , 5];

              case 4:
                setLoading(false);
                return [7
                /*endfinally*/
                ];

              case 5:
                return [2
                /*return*/
                ];
            }
          });
        });
      };

      fetchUserData(); // Fetch user data if not available in sessionStorage
    }
  }, []);
  if (loading) return react_1["default"].createElement(LoadingScreenDots_1["default"], null);
  return react_1["default"].createElement("div", {
    className: "container mx-auto"
  }, react_1["default"].createElement("div", null, react_1["default"].createElement("h1", {
    className: "text-2xl font-bold mb-4"
  }, "Profile"), userData ? react_1["default"].createElement("div", {
    className: "bg-white shadow-md rounded-lg p-4"
  }, react_1["default"].createElement("h2", {
    className: "text-xl font-semibold"
  }, userData.firstName, " ", userData.lastName), react_1["default"].createElement("p", null, react_1["default"].createElement("strong", null, "Handle:"), " ", userData.telegramHandle || 'N/A'), react_1["default"].createElement("p", null, react_1["default"].createElement("strong", null, "Date Created:"), " ", new Date(userData.dateCreated).toLocaleString()), react_1["default"].createElement("p", null, react_1["default"].createElement("strong", null, "Last Logged In:"), " ", new Date(userData.lastLoggedIn).toLocaleString()), react_1["default"].createElement("p", null, react_1["default"].createElement("strong", null, "Referral:"), " ", userData.referralTelegramId || 'N/A'), react_1["default"].createElement("p", null, react_1["default"].createElement("strong", null, "Telegram ID:"), " ", userData.telegramId)) : react_1["default"].createElement("p", null, "No user data available.")));
};

exports["default"] = Profile;