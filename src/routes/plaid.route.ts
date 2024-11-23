import express from "express";
import plaidController from "../controllers/plaid.controller";

const router = express.Router();

// This route will now call plaidController.getToken
router.route("/getToken").post(plaidController.getToken);
router.route("/exchangePublicToken").post(plaidController.exchangePublicToken);
router.route("/item/get").post(plaidController.getItem);
router.route("/accounts/get").post(plaidController.getAccounts);

export default router;
