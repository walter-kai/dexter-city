import express from "express";
import { Request, Response, NextFunction } from "express";
import { getSocialPosts } from "./socialNews.controller";

const router = express.Router();
router.get("/posts", (req: Request, res: Response, next: NextFunction) => {
  getSocialPosts(req, res).catch(next);
});

export default router;
