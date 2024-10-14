import express from "express";
import gameController from "../controllers/game.controller";

const router = express.Router();

router.route("/").get(gameController.getTestMessage);
router.route("/bet").post(gameController.betRequest);

export default router;
