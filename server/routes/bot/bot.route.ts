import express from "express";
import botController from "./bot.controller";

const router = express.Router();

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.route("/").get(asyncHandler(botController.getBot));
router.route("/").delete(asyncHandler(botController.killBot));
router.route("/").post(asyncHandler(botController.createBot));
router.route("/mine").get(asyncHandler(botController.getMyBots));
router.route("/start").put(asyncHandler(botController.startBot));
router.route("/stop").put(asyncHandler(botController.stopBot));

export default router;
