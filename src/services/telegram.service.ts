// import { usersCollection } from "../controllers/telegram.controller";
import { GetGamePromptArgs, getGames }from '../../client/src/services/FirestoreGames'; // Adjust path as necessary

import { getDocs } from "firebase/firestore/lite";
import TelegramBot, { CallbackQuery, Message } from "node-telegram-bot-api";

// Constants for test mode and official chat ID
export const IS_TEST_MODE = true; // Set to true to enable test mode
export const OFFICIAL_CHAT_ID = -1002127205519; // The official chat ID

// Admin user IDs
const ADMIN_USER_IDS = new Set([5030917144, 5025509571]);

// Initialize the Telegram bot
export const bot: TelegramBot = new TelegramBot('7984928972:AAH5NACu0Q0pI6-04aj7jrr_3m2Itfyj8BI', { polling: false });

// In-memory storage for welcome message and photo
export let welcomeMessage: string = "Update Aug 7,2024\nDM to all will attempt to DM each user from firebase.";
export let welcomePhotoId: string = '';

// Define the interface for inline keyboard buttons
interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

// Define the options for sending messages
export interface SendMessageOptions {
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  reply_markup?: {
    inline_keyboard: InlineKeyboardButton[][];
  };
}

// Define the options for sending photos
export interface SendPhotoOptions {
  caption: string; // Update to string type
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  reply_markup?: {
    inline_keyboard: InlineKeyboardButton[][];
  };
}

// Check if a user is an admin
const isAdmin = (userId: number | string | undefined): boolean => {
  if (userId === undefined) return false;

  // Convert string userId to number if it's a string
  const normalizedUserId = typeof userId === 'string' ? parseInt(userId) : userId;

  return ADMIN_USER_IDS.has(normalizedUserId);
};


const prefix = IS_TEST_MODE ? '⚠️ ' : '';

const homeText = `${prefix}Home`;
const olympicsText = `${prefix}Olympics`;
const mlbText = `${prefix}MLB`;
const sendGeneralText = `${prefix}Send to General Chat`;
const sendToAllText = `${prefix}Send DM to All`;
const sendToListText = `${prefix}Send DM to List`;
const editWelcomeText = `${prefix}Edit Welcome Message`;
const showGamesText = `${prefix}Show Games`;

// Define the common inline keyboard
const getCommonInlineKeyboard = (userId: number | undefined): InlineKeyboardButton[][] => [
  [{ text: homeText, url: 'https://t.me/TENAMINT_bot/Picks' }],
  [{ text: olympicsText, url: 'https://t.me/TENAMINT_bot/Picks?startapp=league_OLYMPICS' }],
  [{ text: mlbText, url: 'https://t.me/TENAMINT_bot/Picks?startapp=league_MLB' }],
  ...(isAdmin(userId) ? [
    [{ text: sendGeneralText, callback_data: "sendGeneral" }],
    [{ text: sendToAllText, callback_data: "sendToAll" }],
    [{ text: sendToListText, callback_data: "sendToList" }],
    [{ text: editWelcomeText, callback_data: "edit_welcome" }],
    [{ text: showGamesText, callback_data: "show_games" }],
  ] : [])
];

// export function setWelcomeMessage(msg: string): undefined {
//   welcomeMessage = msg;
// }

// export function setWelcomePhoto(photo: string): undefined {
//   welcomePhotoId = photo;
// }

export function createMsgOptions(showInlineButtons: boolean, msg: Message): SendMessageOptions {
  
  return {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: showInlineButtons ? getCommonInlineKeyboard(msg.from?.id) : []
    }
  }
}

// function createPhotoOptions(msg: Message): SendPhotoOptions {
export function createPhotoOptions(showInlineButtons: boolean, msg: Message, caption?: string): SendPhotoOptions {
  return {
    caption: caption ? caption : welcomeMessage, // Use welcomeMessage or any other string
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: showInlineButtons ? getCommonInlineKeyboard(msg.from?.id) : []
    }
  };
}

// Handle the /start command
const handleStartMenuDM = (msg: Message) => {
  if (welcomePhotoId.length !== 0) {
    const opts: SendPhotoOptions = createPhotoOptions(true, msg);
    bot.sendPhoto(msg.chat.id, welcomePhotoId, opts)
      .catch((err: any) => console.error('Error sending /start message with photo:', err));
  } else {
    const opts: SendMessageOptions = createMsgOptions(true, msg);
    bot.sendMessage(msg.chat.id, welcomeMessage, opts)
      .catch((err: any) => console.error('Error sending /start message:', err));
  }
};

// Handle the /start@TENAMINT_bot command
const handleStartMenuGeneral = (msg: Message) => {
  const opts: SendMessageOptions = {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: getCommonInlineKeyboard(undefined)
    }
  };

  bot.sendMessage(msg.chat.id, welcomeMessage, opts)
    .catch((err: any) => console.error('Error sending /start@TENAMINT_bot message:', err));
};

const getUsers = async () => {
  // const userQuerySnapshots = await getDocs(usersCollection);
  
  // // Map and filter users
  // return userQuerySnapshots.docs
  //   .map(doc => doc.data()) // Extract user data
  //   // .filter(user => {
    //   // If IS_TEST_MODE is true, only return admin users, otherwise return all users
    //   return !IS_TEST_MODE || isAdmin(user.telegramid);
    // })
    // .map(user => user.telegramid); // Return only the telegram IDs
};

// Function to send messages in batches, fetching users dynamically
// Function to send messages in batches, using either the provided list or fetching users dynamically
const sendMessagesInBatches = async (
  notificationText: string, 
  opts: any, 
  responseChatId: number,
  idList?: string // Optional parameter for a list of Telegram IDs
) => {
  const BATCH_SIZE = 25; // Telegram limit: 25 messages per second
  const DELAY_MS = 1000; // 1-second delay between batches

  let users: string[] = [];

  try {
    if (idList) {
      // If idList is provided, use it
      users = idList.split('\n').map(id => id.trim()).filter(id => id !== '');
    } else {
      // If idList is not provided, fetch the users dynamically
      // users = await getUsers();
    }

    if (users.length === 0) {
      await bot.sendMessage(responseChatId, 'No users available to send messages.')
        .catch((err: any) => console.error('Error sending no users message:', err));
      return;
    }

    const totalUsers = users.length;

    for (let i = 0; i < totalUsers; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE); // Get the next batch of users

      // Send messages to each user in the current batch
      await Promise.all(
        batch.map(telegramId => 
          bot.sendMessage(parseInt(telegramId), notificationText, opts)
            .catch((err: any) => console.error(`Error sending message to ${telegramId}:`, err))
        )
      );

      // Calculate the progress percentage
      const progressPercent = Math.min(100, Math.floor(((i + BATCH_SIZE) / totalUsers) * 100));

      // Send progress update to the chat
      await bot.sendMessage(responseChatId, `Progress: ${progressPercent}% complete`)
        .catch((err: any) => console.error('Error sending progress update:', err));

      // Wait for 1 second before processing the next batch
      if (i + BATCH_SIZE < totalUsers) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    // Final message when 100% complete
    await bot.sendMessage(responseChatId, 'All messages sent successfully!')
      .catch((err: any) => console.error('Error sending completion message:', err));

  } catch (err) {
    console.error('Error fetching users or sending messages:', err);
    await bot.sendMessage(responseChatId, 'An error occurred while fetching users or sending messages.')
      .catch((err: any) => console.error('Error sending error message:', err));
  }
};

// Function to send photos in batches
const sendPhotosInBatches = async (
  fileId: string,          // The fileId for the photo to be sent
  photoOpts: any,          // Options for sending the photo
  responseChatId: number,  // Chat ID for sending progress updates
  idList?: string          // Optional parameter for a list of Telegram IDs
) => {
  const BATCH_SIZE = 25;    // Telegram limit: 25 messages per second
  const DELAY_MS = 1000;    // 1-second delay between batches

  let users: string[] = [];

  try {
    if (idList) {
      // If idList is provided, use it
      users = idList.split('\n').map(id => id.trim()).filter(id => id !== '');
    } else {
      // If idList is not provided, fetch the users dynamically
      // users = await getUsers();
    }

    if (users.length === 0) {
      await bot.sendMessage(responseChatId, 'No users available to send photos.')
        .catch((err: any) => console.error('Error sending no users message:', err));
      return;
    }

    const totalUsers = users.length;

    for (let i = 0; i < totalUsers; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE); // Get the next batch of users

      // Send photos to each user in the current batch
      await Promise.all(
        batch.map(telegramId => 
          bot.sendPhoto(telegramId, fileId, photoOpts)
            .catch((err: any) => console.error(`Error sending message with photo to ${telegramId}:`, err))
        )
      );

      // Calculate the progress percentage
      const progressPercent = Math.min(100, Math.floor(((i + BATCH_SIZE) / totalUsers) * 100));

      // Send progress update to the chat
      await bot.sendMessage(responseChatId, `Progress: ${progressPercent}% complete`)
        .catch((err: any) => console.error('Error sending progress update:', err));

      // Wait for 1 second before processing the next batch
      if (i + BATCH_SIZE < totalUsers) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    // Final message when 100% complete
    await bot.sendMessage(responseChatId, 'All photos sent successfully!')
      .catch((err: any) => console.error('Error sending completion message:', err));

  } catch (err) {
    console.error('Error fetching users or sending photos:', err);
    await bot.sendMessage(responseChatId, 'An error occurred while fetching users or sending photos.')
      .catch((err: any) => console.error('Error sending error message:', err));
  }
};



// Handle commands
bot.onText(/^\/start$/, handleStartMenuDM);
bot.onText(/^\/start@TENAMINT_bot$/, handleStartMenuGeneral);



/////////////////////////////

// Handle callback queries
bot.on('callback_query', async (callbackQuery: CallbackQuery) => {

  const responseChatId = callbackQuery.message?.chat.id || 0;

  // Remove any old listeners when a new callback query is triggered
  bot.removeAllListeners('message');


  if (callbackQuery.data === 'edit_welcome') {
    bot.sendMessage(responseChatId, 'Please enter the new welcome message:')
      .catch((err: any) => console.error('Error sending prompt message:', err));

    bot.once('text', async (msg: Message) => {
      if (msg.chat.id === responseChatId) {
        const broadcastMessage = msg.text || '';
        bot.sendMessage(responseChatId, 'Please send a picture to accompany the message:')
          .catch((err: any) => console.error('Error sending picture prompt:', err));

        // Store the updated welcome message and photo
        // setWelcomeMessage(broadcastMessage);

        bot.once('photo', async (photoMsg: Message) => {
          if (photoMsg.chat.id === responseChatId) {
            // handlePrivateMessage(photoMsg)
            const fileId = photoMsg.photo?.[photoMsg.photo.length - 1]?.file_id; // Get the highest resolution photo
            if (fileId) {
              // setWelcomePhoto(fileId);
              await bot.sendMessage(responseChatId, "Welcome message set to: ")
              .catch((err: any) => console.error('Error updating welcome message:', err));
              const opts: SendPhotoOptions = createPhotoOptions(false, msg, broadcastMessage);
              bot.sendPhoto(responseChatId, welcomePhotoId, opts)
                .catch((err: any) => console.error('Error sending /start message with photo:', err));
            }
          }
          return;
        });
        bot.once('text', async (msg: Message) => {
          if (msg.chat.id === responseChatId) {
            // If no photo is provided, send the message as text
            await bot.sendMessage(responseChatId, "Welcome message set to: " + broadcastMessage)
              .catch((err: any) => console.error('Error updating welcome message:', err));
          }
          return;
        });
      }
    });
  } else if (callbackQuery.data === 'show_games') {
    try {
      // Fetch the games and game prompts
      const [games, ] = await Promise.all([
        getGames({
          occursBefore: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
          occursAfter: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
        }),
        // getGamePrompts({
        //   dateStarts: new Date().toISOString(),
        //   dateExpires: new Date(new Date().getTime() - 0.5 * 60 * 60 * 1000).toISOString(),
        // }),
      ]);

      // Transform the games data
      // const gameList = games.map((game, index) => ({
      //   index: index + 1,
      //   apiMatchId: game.apiMatchId,
      //   apiLeagueId: game.apiLeagueId,
      //   date: game.date,
      //   teamAway: game.teamADetails.name,
      //   teamHome: game.teamBDetails.name,
      //   time: new Date(game.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      // }));

      // Create the string to send
      // const gameListString = gameList.map(game => `${game.index}. ${game.teamAway} vs ${game.teamHome} on ${new Date(game.date).toLocaleDateString()} at ${game.time}`
      // ).join('\n');

      // const finalMessage = `Show games\nPlease type the index of the game:\n${gameListString}`;

      // Send the message
      // await bot.sendMessage(responseChatId, finalMessage)
      //   .catch((err: any) => console.error('Error sending notification prompt:', err));

      bot.once('message', async (msg: Message) => {
        if (msg.chat.id === responseChatId) {
          // msg.txt 
        }
      });

    } catch (error) {
      console.error('Error fetching or transforming games:', error);
      throw error;
    }

  } else if (callbackQuery.data === 'sendToList') {
    bot.sendMessage(responseChatId, 'Send DM to list\nPlease enter the list of Telegram IDs:')
        .catch((err: any) => console.error('Error sending ID list prompt:', err));

    bot.once('message', async (msg: Message) => {
        if (msg.chat.id === responseChatId) {
            const idList = msg.text || '';
            const telegramIds = idList.split('\n').map(id => id.trim()).filter(id => id !== '');

            bot.sendMessage(responseChatId, 'Please enter the DM text:')
                .catch((err: any) => console.error('Error sending DM text prompt:', err));

            bot.once('message', async (msg: Message) => {
                if (msg.chat.id === responseChatId) {
                    const notificationText = msg.text || '';

                    bot.sendMessage(responseChatId, 'Please send a picture to accompany the message (or type \'n\' if no picture):')
                        .catch((err: any) => console.error('Error sending picture prompt:', err));

                    bot.once('message', async (msg: Message) => {
                      if (msg.chat.id === responseChatId) {
                        const opts: SendMessageOptions = createMsgOptions(false, msg);
                        if (msg.text && msg.text.toLowerCase() === 'n') {
                            // No picture scenario
                            if (IS_TEST_MODE) {
                                const chatId = callbackQuery.message?.chat.id || 0; // Use 0 if chatId is undefined
                                bot.sendMessage(chatId, notificationText, opts)
                                    .catch((err: any) => console.error('Error sending message:', err));
                            } else {
                                for (const telegramId of telegramIds) {
                                    bot.sendMessage(telegramId, notificationText, opts)
                                        .catch((err: any) => console.error(`Error sending message to ${telegramId}:`, err));
                                }
                            }
                            bot.sendMessage(responseChatId, `You have just sent: ${notificationText}`, opts)
                                .catch((err: any) => console.error('Error sending confirmation message:', err));
                        } else if (msg.photo) {
                          // Picture provided scenario
                          const photoOpts: SendPhotoOptions = createPhotoOptions(false, msg, notificationText);
                            const fileId = msg.photo[msg.photo.length - 1]?.file_id; // Get the highest resolution photo
                            if (fileId) {
                              if (IS_TEST_MODE) {
                                const chatId = callbackQuery.message?.chat.id || 0; // Use 0 if chatId is undefined
                                bot.sendPhoto(chatId, fileId, photoOpts)
                                .catch((err: any) => console.error('Error sending message with photo:', err));
                              } else {
                                for (const telegramId of telegramIds) {
                                    bot.sendPhoto(telegramId, fileId, photoOpts)
                                        .catch((err: any) => console.error(`Error sending message with photo to ${telegramId}:`, err));
                                }
                              }
                              bot.sendMessage(responseChatId, `You have just sent:`, opts)
                                  .catch((err: any) => console.error('Error sending confirmation message:', err));
                              bot.sendPhoto(responseChatId, fileId, photoOpts)
                                  .catch((err: any) => console.error('Error sending confirmation photo:', err));
                            }
                        }
                      }
                    });
                }
            });
        }
    });
  } else if (callbackQuery.data === 'sendToAll') {

    bot.sendMessage(responseChatId, 'Send DM to all\nPlease enter the DM text:')
        .catch((err: any) => console.error('Error sending DM text prompt:', err));

    bot.once('message', async (msg: Message) => {
        if (msg.chat.id === responseChatId) {
            const notificationText = msg.text || '';

            bot.sendMessage(responseChatId, 'Please send a picture to accompany the message (or type \'n\' if no picture):')
                .catch((err: any) => console.error('Error sending picture prompt:', err));

            bot.once('message', async (msg: Message) => {
                if (msg.chat.id === responseChatId) {
                  const opts: SendMessageOptions = createMsgOptions(false, msg);
                    if (msg.text && msg.text.toLowerCase() === 'n') {
                        // No picture scenario
                        sendMessagesInBatches(notificationText, opts, responseChatId);
                        
                    } else if (msg.photo) {
                        // Picture provided scenario
                        const fileId = msg.photo[msg.photo.length - 1]?.file_id; // Get the highest resolution photo
                        if (fileId) {
                            const photoOpts: SendPhotoOptions = createPhotoOptions(false, msg, notificationText);
                            sendPhotosInBatches(fileId, photoOpts, responseChatId);
                        }
                    }
                }
            });
        }
    });
  } else if (callbackQuery.data === 'sendGeneral') {

    
    bot.sendMessage(responseChatId, 'Send DM to General Chat\nPlease enter the notification text:')
      .catch((err: any) => console.error('Error sending notification prompt:', err));

    bot.once('message', async (msg: Message) => {
      if (msg.chat.id === responseChatId) {
        const notificationText = msg.text || '';

        bot.sendMessage(responseChatId, 'Please send a picture to accompany the message (or type \'n\'):')
          .catch((err: any) => console.error('Error sending picture prompt:', err));

        const chatId = IS_TEST_MODE ? callbackQuery.message?.chat.id || 0 : OFFICIAL_CHAT_ID; // Use 0 if chatId is undefined
        bot.once('photo', async (photoMsg: Message) => {
          if (photoMsg.chat.id === responseChatId) {
            const fileId = photoMsg.photo?.[photoMsg.photo.length - 1]?.file_id; // Get the highest resolution photo

            // Send the welcome message with or without photo
            const responseConfirm = '🎆You have just sent: ';
            if (fileId) {
              const opts: SendPhotoOptions = createPhotoOptions(false, photoMsg, msg.text);
              bot.sendPhoto(chatId, fileId, opts)
                .catch((err: any) => console.error('Error sending /start message with photo:', err));
              // relay back to sender
              bot.sendMessage(responseChatId, responseConfirm, opts)
                .catch((err: any) => console.error('Error sending /start message:', err));
              bot.sendPhoto(responseChatId, fileId, opts)
                .catch((err: any) => console.error('Error sending /start message with photo:', err));
            } else {
              const opts: SendMessageOptions = createMsgOptions(false, photoMsg);
              bot.sendMessage(chatId, notificationText, opts)
                .catch((err: any) => console.error('Error sending /start message:', err));
              // relay back to sender
              bot.sendMessage(responseChatId, responseConfirm, opts)
                .catch((err: any) => console.error('Error sending /start message:', err));
              bot.sendMessage(responseChatId, notificationText, opts)
                .catch((err: any) => console.error('Error sending /start message:', err));
            }
            return;
          }
        });
        await bot.sendMessage(chatId, notificationText)
          .catch((err: any) => console.error('Error sending notification message:', err));

      }
    });
  }

  bot.answerCallbackQuery(callbackQuery.id)
    .catch((err: any) => console.error('Error answering callback query:', err));
});

export default bot;