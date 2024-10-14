import { Request, Response } from "express";
import exampleService from "../services/game.service";

// eslint-disable-next-line no-unused-vars
const getTestMessage = async (req: Request, res: Response): Promise<Response> => {
  // TODO: Add authentication here
  if (req.body.telegramId) {
  }
  return res.json({ test: await exampleService.getTestMessage() });
};
const betRequest = async (req: Request, res: Response): Promise<Response> => {
  // TODO: Add authentication here
  if (req.body.telegramId) {
  }
  return res.json({ test: await exampleService.getTestMessage() });
};

export default {
  getTestMessage,betRequest
};
