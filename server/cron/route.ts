import express from "express";
import subgraphController from "../routes/subgraph/controller";
import coinMarketCapController from "../routes/cmc/controller";

const router = express.Router();

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error(`Error in cron route: ${req.path}`, error);
    next(error);
  });

// Inline CRON_PASSWORD middleware
const checkCronPassword = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`Cron request received for: ${req.path}`);
  
  // TEMP DEBUG: allow all cron requests without password for testing
  console.log("DEBUG: Bypassing cron password check for testing");
  return next();
  
  // Original code:
  /*
  const passHeader = req.header('pass');
  if (!passHeader || passHeader !== process.env.CRON_PASSWORD) {
    console.log("Cron access denied: invalid password");
    res.status(403).json({ error: "Forbidden: invalid or missing pass header" });
    return;
  }
  next();
  */
};

// Basic health check endpoint
router.route("/health").get((req, res) => {
  console.log("Cron health check passed");
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Endpoints for CRON jobs
router.route("/reload/cmcTokens").get(checkCronPassword, asyncHandler(coinMarketCapController.reloadCmcTokens));
router.route("/reload/dailyPools").get(checkCronPassword, asyncHandler(subgraphController.reloadDailyPools));
router.route("/import/masterPool/:date").get(checkCronPassword, asyncHandler(subgraphController.importMasterPool));

export default router;
