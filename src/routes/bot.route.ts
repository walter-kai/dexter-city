import express from "express";
import botController from "../controllers/bot.controller";

const router = express.Router();

router.route("/").get(botController.getBot);
router.route("/").post(botController.createBot);
router.route("/mine").get(botController.getMyBots);

export default router;
