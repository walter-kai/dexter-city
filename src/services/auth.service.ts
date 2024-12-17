import userService from "./user.service";
import { TelegramUser, UserArgs } from '../../client/src/models/User'; // Adjust path as necessary
import ApiError from "../utils/api-error";
import User from "../../client/src/models/User";
import { Telegraf } from 'telegraf';
import admin from "firebase-admin"; // Import admin SDK
import logger from "../config/logger";

import { PassThrough } from 'stream';

/**
 * Get a test message
 * @returns {string} The message we want to return
 */
const getTestMessage = async (): Promise<string> => {
  return "The message is hello!";
};

/**
 * Download the file from Telegram and upload it to Firebase Storage.
 * @param {Telegraf} bot - The Telegraf bot instance.
 * @param {string} fileId - The file ID to fetch the image.
 * @param {string} userId - The user's Telegram ID to create a unique filename.
 * @returns {Promise<string | null>} The download URL in Firebase Storage or null if not successful.
 */
const downloadAndUploadToFirebase = async (bot: Telegraf, fileId: string, userId: string): Promise<string | null> => {
  try {
    const file = await bot.telegram.getFile(fileId);
    if (file && file.file_path) {
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file.file_path}`;

      // Download the image
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Failed to fetch file from Telegram');

      // Create a reference to the Firestore Storage bucket
      const bucket = admin.storage().bucket(); // Initialize the storage bucket
      const fileName = `${userId}.jpg`; // Create a unique filename
      const fileUploadStream = bucket.file(`profilePics/${fileName}`).createWriteStream({
        metadata: {
          contenttype: response.headers.get('content-type'), // Correct property name
        },
      });

      // Convert the ReadableStream from fetch to a Node.js stream
      const passThroughStream = new PassThrough();
      const reader = response.body?.getReader();

      // Read the stream and push chunks to PassThrough
      const pump = async () => {
        while (true) {
          const result = await reader?.read(); // Read the next chunk
          if (result?.done) break; // Exit loop if done

          // Push the chunk into the PassThrough stream
          passThroughStream.write(result?.value);
        }
        passThroughStream.end(); // End the PassThrough stream
      };

      pump().catch(err => {
        console.error('Error reading response stream:', err);
        passThroughStream.destroy(err); // Handle errors and destroy stream
      });

      // Pipe PassThrough to the upload stream
      passThroughStream.pipe(fileUploadStream);

      return new Promise((resolve, reject) => {
        fileUploadStream.on('finish', () => {
          // Get the public URL of the uploaded file
          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/profilePics%2F${encodeURIComponent(fileName)}?alt=media`;

          // Log successful upload
          logger.info(`Successfully uploaded profile picture for userId: ${userId}, URL: ${publicUrl}`);
          resolve(publicUrl);
        });
        fileUploadStream.on('error', (error) => {
          console.error('Error uploading file to Firestore Storage:', error);
          reject(null);
        });
      });
    }
    return null;
  } catch (error) {
    console.error("Error downloading or uploading file:", error);
    return null;
  }
};

/**
 * Login or create a user based on their telegramId.
 * @param {TelegramUser} telegramUser - The user data to create the user if not found.
 * @returns {Promise<{ message: string, user: User | null }>} A message or user data.
 */
const loginOrCreate = async (telegramUser: TelegramUser): Promise<{ message: string, user: User | null }> => {
  try {
    const bot = new Telegraf(process.env.TELEGRAM_TOKEN as string);

    // Fetch the user based on telegramId
    const users = await userService.getUsersByTelegramId([telegramUser.id]);
    const existingUser = users && users[telegramUser.id] ? users[telegramUser.id] : null;

    // Log user activity
    const breadcrumb = `Logging in user: ${telegramUser.id}`;
    const newBreadcrumb = `loginOrCreate(${telegramUser.id}):${breadcrumb}`;
    logger.info(JSON.stringify({ breadcrumb: newBreadcrumb }));

    // Fetch the profile photo using Telegraf's bot.telegram
    const profilePhotos = await bot.telegram.getUserProfilePhotos(Number(telegramUser.id));

    // Safely handle the response and fetch profilePicId
    const profilePicId = profilePhotos?.photos?.[0]?.[0]?.file_id || null;

    // Download and upload the profile picture
    const profilePicUrl = profilePicId ? await downloadAndUploadToFirebase(bot, profilePicId, telegramUser.id) : null;

    // Create or update the user
    const userPayload: UserArgs = {
      telegramId: telegramUser.id.toString(),
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name || null,
      telegramHandle: telegramUser.username || null,
      referralTelegramId: null,
      photoId: profilePicId || null,
      photoUrl: profilePicUrl || null,
      lastLoggedIn: new Date(),
      favoriteTokens: existingUser?.favoriteTokens || null,
      dateCreated: existingUser?.dateCreated || new Date(), // Keep original creation date if exists
    };

    // Map UserArgs to the structure expected by userService (createUser or updateUserDocByTelegramId)
    const mappedPayload = {
      telegramid: userPayload.telegramId,
      firstName: userPayload.firstName,
      lastName: userPayload.lastName,
      handle: userPayload.telegramHandle,
      referral: userPayload.referralTelegramId,
      photoId: userPayload.photoId,
      photoUrl: userPayload.photoUrl,
    };

    if (!existingUser) {
      const newUser = await userService.createUser(mappedPayload);
      return {
        message: "User created",
        user: newUser,
      };
    } else {
      const updatedUser = await userService.updateUser(userPayload);
      return {
        message: "User updated",
        user: updatedUser || null,
      };
    }
  } catch (error) {
    console.error("Error during login or create:", error);
    return {
      message: "An error occurred",
      user: null,
    };
  }
};

export default {
  getTestMessage,
  loginOrCreate,
};
