import express from "express";
import { getSocialPosts } from "./socialNews.controller";

const router = express.Router();

router.get("/posts", getSocialPosts);

export default router;
