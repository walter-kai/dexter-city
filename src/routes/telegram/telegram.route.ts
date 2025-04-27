import express from "express";
import telegramController from "../telegram/telegram.controller";

const router = express.Router();

router.route("/").post(telegramController.receiveUpdates);

// router.route("/:telegramId/inChat").post(telegramController.receiveUpdates);

// router.route("/manual-questions").get(gameController.getAllManualQuestions);

// router.route("/game-prompts").get(gameController.getGamePrompts);

export default router;
