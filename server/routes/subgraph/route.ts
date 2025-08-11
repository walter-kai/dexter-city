import express from "express";
import subgraphController from "../subgraph/controller";
import { authenticateJWT } from "../../middleware/auth";



const router = express.Router();

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Data fetch endpoints
router.route("/swaps/:contractAddress").get(authenticateJWT, asyncHandler(subgraphController.getSwaps));
router.route("/pools").get(authenticateJWT, asyncHandler(subgraphController.getPools));
router.route("/dailyPools").get(authenticateJWT, asyncHandler(subgraphController.getDailyPools)); // New endpoint

export default router;
