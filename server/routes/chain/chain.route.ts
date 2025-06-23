import express from "express";
import subgraphController from "./subgraph/controller";
import coinMarketCapController from "./cmc/controller";


const router = express.Router();

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Data fetch endpoints
router.route("/uni/swaps/:contractAddress").get(asyncHandler(subgraphController.getSwaps));
router.route("/uni/pools").get(asyncHandler(subgraphController.getPools));
router.route("/uni/dailyPools").get(asyncHandler(subgraphController.getDailyPools)); // New endpoint
router.route("/cmc/tokens/:symbol").get(asyncHandler(coinMarketCapController.getTokenBySymbol));

// Endpoints for CRON jobs
router.route("/cmc/reload/tokens").get(asyncHandler(coinMarketCapController.reloadCmcTokens));
router.route("/uni/reload/poolsDay").get(asyncHandler(subgraphController.reloadPoolsDay));
router.route("/uni/masterPool/import/:date").get(asyncHandler(subgraphController.importMasterPool));

export default router;
