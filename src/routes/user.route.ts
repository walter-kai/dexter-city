import express from "express";
import userController from "../controllers/user.controller";
const router = express.Router();

// router.route("/:telegramId/picks").get(userController.getUsersPicks);
// router.route("/scores").get(userController.getUsersPickScores);
router.route("/:telegramId/setChatId/:chatId").put(userController.setUserChatId);
// router.route("/:telegramId/missions").get(userController.getUsersMissions);
// router.route("/").get(userController.getAllUsers);
router.route("/").put(userController.updateUser);


export default router;
