import express from "express";
import userController from "../controllers/user.controller";
const router = express.Router();

// router.route("/:telegramId/picks").get(userController.getUsersPicks);
router.route("/scores").get(userController.getUsersPickScores);
router.route("/:telegramId/setChatId/:chatId").put(userController.setUserChatId);
// router.route("/:telegramId/missions").get(userController.getUsersMissions);
// router.route("/").get(userController.getAllUsers);
router.route("/").get(userController.getUsers);
// router.route("/:telegramId/score").post(userController.processUsersScore);
// router.route("/score").post(userController.processAllUsersScore);
router.route("/new").post(userController.createUser);
router.route("/update").put(userController.updateUserDocByTelegramId);
router.route("/favorite-sports").post(userController.addUsersFavoriteSports);

export default router;
