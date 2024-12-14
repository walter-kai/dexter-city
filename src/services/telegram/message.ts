import skylarBot from "../telegram.service";

// const prefix = IS_TEST_MODE ? '⚠️ ' : '';

// Admin user IDs
const ADMIN_USER_IDS = new Set([5030917144, 5025509571]);

export const statsText = `Stats`;
export const connectText = `Connect`;

// Define the interface for inline keyboard buttons
interface InlineKeyboardButton {
    text: string;
    url?: string;
    callback_data?: string;
  }

  // Check if a user is an admin
const isAdmin = (userId: number | string | undefined): boolean => {
    if (userId === undefined) return false;
  
    // Convert string userId to number if it's a string
    const normalizedUserId = typeof userId === 'string' ? parseInt(userId) : userId;
  
    return ADMIN_USER_IDS.has(normalizedUserId);
  };

// Define the options for sending messages
interface SendMessageOptions {
    parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
    reply_markup?: {
      inline_keyboard: InlineKeyboardButton[][];
    };
  }
  
  // Define the options for sending photos
interface SendPhotoOptions {
    caption: string; // Update to string type
    parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
    reply_markup?: {
      inline_keyboard: InlineKeyboardButton[][];
    };
  }

// Define the common inline keyboard
const getCommonInlineKeyboard = (userId: number | undefined): InlineKeyboardButton[][] => [
    [{ text: statsText, url: 'https://t.me/TENAMINT_bot/Picks' }],
    [{ text: statsText, callback_data: statsText }],
    [{ text: connectText, callback_data: connectText }],
    // [{ text: olympicsText, url: 'https://t.me/TENAMINT_bot/Picks?startapp=league_OLYMPICS' }],
    ...(isAdmin(userId) ? [
    ] : [])
  ];

export function sendPhoto(chatId: number, msg: string, caption?: string): void {


    const photoOps: SendPhotoOptions = {
      caption: caption ? caption : msg, // Use welcomeMessage or any other string
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: getCommonInlineKeyboard(chatId)
      }
    };

    skylarBot.sendPhoto(chatId, msg, photoOps)
    .catch((err: any) => console.error('Error sending /start message with photo:', err));
  }

export function showMenu(chatId: number): void {


    const options: SendMessageOptions = {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: getCommonInlineKeyboard(chatId)
      }
    };

    skylarBot.sendMessage(chatId, 'Home', options)
    .catch((err: any) => console.error('Error sending /start message with photo:', err));
  }