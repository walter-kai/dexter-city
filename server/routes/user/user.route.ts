import express from "express";
import userController from "./user.controller";
const router = express.Router();

// router.route(":/telegramId/picks").get(userController.getUsersPicks);
// router.route("/scores").get(userController.getUsersPickScores);
router.route("/:telegramId/setChatId/:chatId").put(userController.setUserChatId);
// router.route("/:telegramId/missions").get(userController.getUsersMissions);
router.route("/checkName").get(userController.checkUsernameAvailability);
router.route("/update").put(userController.updateUser);
router.route("/login").post(userController.login); // Add login route here

export default router;
