import express from "express";
import { getSentiments } from "./sentiment.controller";

const router = express.Router();

router.get("/all", getSentiments);

export default router;
