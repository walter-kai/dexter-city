import express from "express";
import subgraphController from "../subgraph/controller";
import coinMarketCapController from "./controller";


const router = express.Router();

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Data fetch endpoints
router.route("/tokens/:symbol").get(asyncHandler(coinMarketCapController.getTokenBySymbol));



export default router;
