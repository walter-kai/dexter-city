import express from "express";
import botController from "../controllers/bot.controller";

const router = express.Router();

router.route("/").get(botController.getBot);
router.route("/").delete(botController.killBot);
router.route("/").post(botController.createBot);
router.route("/mine").get(botController.getMyBots);
router.route("/start").put(botController.startBot);
router.route("/stop").put(botController.stopBot);

export default router;
