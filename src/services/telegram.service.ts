// import { usersCollection } from "../controllers/telegram.controller";
import { GetGamePromptArgs, getGames }from '../../client/src/services/FirestoreGames'; // Adjust path as necessary


import TelegramBot, { CallbackQuery, Message } from "node-telegram-bot-api";
import { showMenu, statsText } from './telegram/message';
import { config } from 'dotenv';
config(); // Ensure .env is loaded
// Constants for test mode and official chat ID
export const IS_TEST_MODE = true; // Set to true to enable test mode
export const OFFICIAL_CHAT_ID = -1002127205519; // The official chat ID


// Initialize the Telegram bot

// In-memory storage for welcome message and photo
export let welcomeMessage: string = "Update Aug 7,2024\nDM to all will attempt to DM each user from firebase.";
export let welcomePhotoId: string = '';


if (!process.env.TELEGRAM_TOKEN) {
  console.error('Telegram token missing. Exiting program.');
  process.exit(1); // Quit the program with a non-zero exit code
}

export const skylarBot: TelegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });









// Handle the /start command
const handleStartMenuDM = (msg: Message) => {
  showMenu(msg.chat.id)

};



// Handle commands
skylarBot.onText(/^\/start$/, handleStartMenuDM);



/////////////////////////////

// Handle callback queries
skylarBot.on('callback_query', async (callbackQuery: CallbackQuery) => {

  const responseChatId = callbackQuery.message?.chat.id || 0;

  // Remove any old listeners when a new callback query is triggered
  skylarBot.removeAllListeners('message');


  if (callbackQuery.data === statsText) {
    

  }

  skylarBot.answerCallbackQuery(callbackQuery.id)
    .catch((err: any) => console.error('Error answering callback query:', err));
});

export default skylarBot;