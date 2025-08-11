import express from "express";
import coinMarketCapController from "./controller";


const router = express.Router();

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Data fetch endpoints
router.route("/tokens/:symbol").get(asyncHandler(coinMarketCapController.getTokenBySymbol));
router.route("/tokensReload/").get(asyncHandler(coinMarketCapController.reloadTokens));



export default router;
