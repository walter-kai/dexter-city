import express from "express";
import subgraphController from "../subgraph/controller";
import coinMarketCapController from "../cmc/controller";



const router = express.Router();

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);


// Endpoints for CRON jobs
router.route("/reload/cmcTokens").put(asyncHandler(coinMarketCapController.reloadCmcTokens));
router.route("/reload/dailyPools").put(asyncHandler(subgraphController.reloadDailyPools));
router.route("/import/masterPool/:date").get(asyncHandler(subgraphController.importMasterPool));

export default router;
