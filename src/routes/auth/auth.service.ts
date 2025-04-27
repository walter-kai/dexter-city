import userService from "../user/user.service";
import User, {  UserArgs } from '../../../client/src/models/User'; // Adjust path as necessary
// import ApiError from "../../utils/api-error";
// import { Telegraf } from 'telegraf';
// import admin from "firebase-admin"; // Import admin SDK
import logger from "../../config/logger";

import { PassThrough } from 'stream';

/**
 * Get a test message
 * @returns {string} The message we want to return
 */
const getTestMessage = async (): Promise<string> => {
  return "The message is hello!";
};



/**
 * Login or create a user based on their walletId.
 * @param {User} user - The user data to create the user if not found.
 * @returns {Promise<{ message: string, user: User | null }>} A message or user data.
 */
const login = async (user: User): Promise<{ message: string, user: User | null }> => {
  try {

    // Fetch the user based on walletId
    const existingUser: User | null = await userService.getUserByWalletId(user.walletId);

    // If the user does not exist, return early with null
    if (!existingUser) {
      logger.info(`No user found with walletId: ${user.walletId}`);
      return {
        message: "User not found",
        user: null,
      };
    }

    // Log user activity
    const breadcrumb = `login: ${existingUser.walletId}`;
    logger.info(JSON.stringify({ breadcrumb }));

    // Update the user logged in timestamp
    const userPayload: User = {
      ...existingUser,
      lastLoggedIn: new Date(),
    };

    const updatedUser = await userService.updateUser(userPayload, breadcrumb);

    return {
      message: "User updated",
      user: updatedUser || null,
    };
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
  login,
};
