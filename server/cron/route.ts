import express from "express";
import subgraphController from "../routes/subgraph/controller";
import coinMarketCapController from "../routes/cmc/controller";

const router = express.Router();

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Inline CRON_PASSWORD middleware
const checkCronPassword = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const passHeader = req.header('pass');
  if (!passHeader || passHeader !== process.env.CRON_PASSWORD) {
    res.status(403).json({ error: "Forbidden: invalid or missing pass header" });
    return;
  }
  next();
};

// Endpoints for CRON jobs
router.route("/reload/cmcTokens").get(checkCronPassword, asyncHandler(coinMarketCapController.reloadCmcTokens));
router.route("/reload/dailyPools").get(checkCronPassword, asyncHandler(subgraphController.reloadDailyPools));
router.route("/import/masterPool/:date").get(checkCronPassword, asyncHandler(subgraphController.importMasterPool));

export default router;
