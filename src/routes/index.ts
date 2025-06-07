import express from "express";
import botRoute from "./bot/bot.route";
import authRoute from "./auth/auth.route";
import userRoute from "./user/user.route";
import telegramRoute from "./telegram/telegram.route";
import chainRoute from "./chain/chain.route";
import firebaseRoute from "./firebase/firebase.route";
import socialNewsRoute from "./socialNews/socialNews.route";

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
  },
  {
    path: "/firebase",
    route: firebaseRoute,
  },
  {
    path: "/social-news",
    route: socialNewsRoute,
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
