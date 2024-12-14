import { Request, Response } from "express";
import TelegramBot, { CallbackQuery, Message } from "node-telegram-bot-api";
import catchAsync from "../utils/catch-async";
import ApiError from "../utils/api-error";

import { db } from "../config/firebase";

// import { Timestamp, collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore/lite";
// import { getGamePrompts, getGamePromptsPickCounts, getGames, getGamesPickCounts } from "../hooks/backendGames";
import BinanceService from "../services/binance.service";


// Express route to receive updates
const getAccountTradeList = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { symbol } = req.query;

  // Validate symbol query parameter
  if (!symbol || typeof symbol !== "string") {
    throw new ApiError(400, "Missing or invalid 'symbol' in request query");
  }

  try {
    // Call BinanceService to fetch account trade list
    const tradeList = await BinanceService.getAccountTradeList(symbol);
    return res.status(200).json({ success: true, data: tradeList });
  } catch (error) {
    console.error("Error fetching trade list:", error);
    throw new ApiError(500, "Failed to fetch account trade list");
  }
});


// Express route to receive updates
const getExchangeInfo = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  BinanceService.getExchangeInfo();
  return res.sendStatus(200);
});



export default {
  getAccountTradeList,
  getExchangeInfo
};
