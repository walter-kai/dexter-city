import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import ApiError from "../utils/api-error";
import BinanceAPI from "../services/binance.service";

// Instantiate BinanceAPI with the API credentials
const binanceAPI = new BinanceAPI();

// Function to generate the authorization URL
const authorize = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { clientId, redirectUri, state, scope } = req.query;

  // Validate query parameters
  if (!clientId || !redirectUri || !scope) {
    throw new ApiError(400, "Missing required query parameters: clientId, redirectUri, or scope");
  }

  // Call the authorize method from the BinanceAPI class
  const url = binanceAPI.authorize(clientId as string, redirectUri as string, state as string, scope as string);

  // Return the authorization URL
  return res.status(200).json({ success: true, data: url });
});

// Express route to receive account trade list
const getAccountTradeList = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { symbol } = req.query;

  // Validate symbol query parameter
  if (!symbol || typeof symbol !== "string") {
    throw new ApiError(400, "Missing or invalid 'symbol' in request query");
  }

  try {
    // Call BinanceAPI to fetch account trade list
    const tradeList = await binanceAPI.getAccountTradeList(symbol as string);
    return res.status(200).json({ success: true, data: tradeList });
  } catch (error) {
    console.error("Error fetching trade list:", error);
    throw new ApiError(500, "Failed to fetch account trade list");
  }
});

// Express route to get exchange info
const getExchangeInfo = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  try {
    // Call BinanceAPI to get exchange info
    const exchangeInfo = await binanceAPI.getExchangeInfo();
    return res.status(200).json({ success: true, data: exchangeInfo });
  } catch (error) {
    console.error("Error fetching exchange info:", error);
    throw new ApiError(500, "Failed to fetch exchange info");
  }
});

export default {
  authorize,
  getAccountTradeList,
  getExchangeInfo
};
