import express from "express";
import subgraphController from "../subgraph/controller";



const router = express.Router();

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Data fetch endpoints
router.route("/swaps/:contractAddress").get(asyncHandler(subgraphController.getSwaps));
router.route("/pools").get(asyncHandler(subgraphController.getPools));
router.route("/dailyPools").get(asyncHandler(subgraphController.getDailyPools)); // New endpoint

export default router;
