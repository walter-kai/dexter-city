import { Request, Response } from "express";
import botService from "../services/bot.service";
// import botConfig from "../../client/src/models/Bot"

const getBot = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Ensure botName is provided in the request query
    const { botName } = req.query;

    if (!botName) {
      return res.status(400).json({ error: "botName is required" });
    }

    // Fetch bot by botName using the botService's get method
    const bot = await botService.get(botName as string); // Ensure botName is treated as a string

    if (!bot) {
      return res.status(404).json({ error: "Bot not found" });
    }

    return res.json(bot);
  } catch (error) {
    console.error("Error fetching bot:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getMyBots = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Ensure botName is provided in the request query
    const { walletId } = req.query;

    if (!walletId) {
      return res.status(400).json({ error: "botName is required" });
    }

    // Fetch bot by botName using the botService's get method
    const bot = await botService.getMyBots(walletId as string); // Ensure botName is treated as a string

    if (!bot) {
      return res.status(404).json({ error: "Bot not found" });
    }

    return res.json(bot);
  } catch (error) {
    console.error("Error fetching bot:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const createBot = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Ensure walletId and botConfig are provided in the request body
    const botConfig = req.body;

    if (!botConfig.creator) {
      return res.status(400).json({ error: "walletId is required" });
    }

    if (!botConfig || typeof botConfig !== 'object') {
      return res.status(400).json({ error: "botConfig is required and must be an object" });
    }

    // Create a new bot with the provided walletId and botConfig
    const newBot = await botService.create(botConfig);

    return res.status(201).json(newBot);
  } catch (error) {
    console.error("Error creating bot:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  getBot,
  createBot,
  getMyBots
};
