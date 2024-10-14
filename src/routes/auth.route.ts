import express from "express";
import authController from "../controllers/auth.controller";

const router = express.Router();

// TODO: Change this to a get req, requiring telegram id be exposed in headers or something
router.route("/me").post(authController.getCurrentUser);
router.route("/login").post(authController.login);

export default router;
