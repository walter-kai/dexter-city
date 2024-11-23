import express from "express";
import gameRoute from "./game.route";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import telegramRoute from "./telegram.route";
import plaidRoute from "./plaid.route";


const router = express.Router();

type RouteObj = {
  path: string;
  route: express.Router;
};

const defaultRoutes: ReadonlyArray<RouteObj> = [
  {
    path: "/plaid",
    route: plaidRoute,
  },
  {
    path: "/game",
    route: gameRoute,
  },
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/telegram",
    route: telegramRoute,
  }
];

// const devRoutes: ReadonlyArray<RouteObj> = [
//   {
//     path: "/game",
//     route: gameRoute,
//   },
// ];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

// if (config.env === "staging") {
//   devRoutes.forEach((route) => {
//     router.use(route.path, route.route);
//   });
// }

export default router;
