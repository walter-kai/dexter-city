import { Timestamp } from "firebase-admin/firestore";
import { Telegraf } from "telegraf";
import logger from "../config/logger";
import { db } from "../config/firebase";
import {BotConfig} from "../../client/src/models/Bot"

 /**
 * Get all bots' details created by a specific wallet ID
 * @param {string} walletId - The wallet ID to retrieve bots for
 * @returns {Promise<any[] | null>} An array of bot details or null if no bots are found
 */
const getMyBots = async (walletId: string): Promise<any[] | null> => {
  const breadcrumb = `getMyBots(${walletId})`;

  if (!walletId) {
    throw new Error(`Invalid walletId provided. ${breadcrumb}`);
  }

  const botsRef = db.collection("bots");
  const q = botsRef.where("creator", "==", walletId);
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    logger.info(`No bots found for walletId: ${walletId}.`);
    return null;
  }

  const bots = querySnapshot.docs.map((doc) => doc.data());

  logger.info(`Fetched ${bots.length} bot(s) for walletId: ${walletId}`);

  // Return the array of bot details
  return bots;
};


/**
 * Get a bot's details by its botId
 * @param {string} botName - the ID of the bot to retrieve details for
 * @returns {Promise<string | null>} The message we want to return
 */
const get = async (botName: string): Promise<any | null> => {
  const breadcrumb = `getBot(${botName})`;

  if (!botName) {
    throw new Error(`Invalid botId provided. ${breadcrumb}`);
  }

  const botsRef = db.collection("bots");
  const q = botsRef.where("botName", "==", botName).limit(1);
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    logger.info(`No bot found with botId: ${botName}.`);
    return null;
  }

  const botDoc = querySnapshot.docs[0];
  const botData = botDoc.data();

  logger.info(`Fetched bot data: ${JSON.stringify(botData)} for botId: ${botName}`);

  // Return the bot's name or any other relevant data from the bot document
  return botData || null;
};

/**
 * Create a new bot entry
 * @param {string} botName - Name of the bot
 * @param {string} botConfig - Message to store for the bot
 * @returns {Promise<string>} The message we want to return after creating the bot
 */
const create = async (botConfig: BotConfig): Promise<string> => {
  const breadcrumb = `createBot(${botConfig.botName})`;
  const timeNow = Timestamp.now();

  const botsRef = db.collection("bots");
  // const bot = new Telegraf(process.env.TELEGRAM_TOKEN as string);

  logger.info(JSON.stringify({ breadcrumb, botConfig: botConfig.botName }));

  // Check if a bot with the same botId already exists
  const q = botsRef.where("botName", "==", botConfig.botName);
  const querySnapshot = await q.get();

  if (!querySnapshot.empty) {
    // Bot exists, return existing bot data
    logger.info(`Bot with botId ${botConfig.botName} already exists.`);
    return `Bot with botId ${botConfig.botName} already exists.`;
  }

  // Set the current timestamp for bot creation
  const botPayload = {
    ...botConfig,
    createdAt: timeNow,
  };

  // Add a new bot document with the provided data
  const newBotRef = await botsRef.add(botPayload);

  logger.info(`Created new bot with auto-generated ID: ${newBotRef.id}.`);

  // Return a success message
  return `Bot with botName ${botConfig.botName} successfully created.`;
};

export default {
  getMyBots,
  get,
  create,
};
