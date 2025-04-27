import express from "express";
import botRoute from "./bot/bot.route";
import authRoute from "./auth/auth.route";
import userRoute from "./user/user.route";
import telegramRoute from "./telegram/telegram.route";
import chainRoute from "./chain/chain.route";


const router = express.Router();

type RouteObj = {
  path: string;
  route: express.Router;
};

const defaultRoutes: ReadonlyArray<RouteObj> = [
  {
    path: "/chain",
    route: chainRoute,
  },
  {
    path: "/bot",
    route: botRoute,
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
