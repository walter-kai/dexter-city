import { Request, Response } from "express";
// import TelegramBot, { CallbackQuery, Message } from "node-telegram-bot-api";
import catchAsync from "../../utils/catch-async";

import { db } from "../../config/firebase";

// import { Timestamp, collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore/lite";
// import { getGamePrompts, getGamePromptsPickCounts, getGames, getGamesPickCounts } from "../hooks/backendGames";
import TelegramService from "./telegram.service";


// Express route to receive updates
const receiveUpdates = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  TelegramService.processUpdate(req.body);
  return res.sendStatus(200);
});



export default {
  receiveUpdates
};
