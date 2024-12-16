import express from "express";
import userController from "../controllers/user.controller";
const router = express.Router();

// router.route("/:telegramId/picks").get(userController.getUsersPicks);
// router.route("/scores").get(userController.getUsersPickScores);
// router.route("/:telegramId/missions").get(userController.getUsersMissions);
// router.route("/").get(userController.getAllUsers);
router.route("/telegram").get(userController.getUserByTelegramId);
router.route("/wallet").get(userController.getUserByWalletId);
router.route("/").post(userController.createUser);
router.route("/").put(userController.updateUser);
// router.route("/:telegramId/score").post(userController.processUsersScore);
// router.route("/score").post(userController.processAllUsersScore);
// router.route("/new").post(userController.createUser);

export default router;
