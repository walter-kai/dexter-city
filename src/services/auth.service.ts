import userService from "./user.service";
import { TelegramUser } from '../../client/src/models/User'; // Adjust path as necessary
import ApiError from "../utils/api-error";

/**
 * Get a test message
 * @returns {string} The message we want to return
 */
const getTestMessage = async (): Promise<string> => {
  return "The message is hello!";
};

/**
 * Login or create a user based on their telegramId.
 * @param {TelegramUser} userData - The user data to create the user if not found.
 * @returns {Promise<{ message: string, user: any }>} A message or user data.
 */
const loginOrCreate = async (userData: TelegramUser): Promise<{ message: string, user: any }> => {
  try {
    // Fetch the user based on telegramId
    const users = await userService.getUsersByTelegramId([userData.id]);

    // Check if the user is found
    const existingUser = users ? users[userData.id] : null;

    // If user is not found, create a new user
    if (!existingUser) {
      // Map TelegramUser to the structure expected by createUser
      const newUserPayload = {
        telegramid: userData.id,           // Map 'id' to 'telegramid'
        firstName: userData.first_name,    // Map 'first_name' to 'firstName'
        lastName: userData.last_name,      // Optional field
        handle: userData.handle,           // Optional field
        referral: userData.referral,       // Optional field
        // Add other fields if needed
      };

      const newUser = await userService.createUser(newUserPayload);
      return {
        message: "User created",
        user: newUser,
      };
    } else {
      // If user is found, update the user document
      const updatedUser = await userService.updateUserDocByTelegramId(existingUser); // Pass the existing user to update
      return {
        message: "User updated",
        user: updatedUser,
      };
    }

    // If user is found, return a success message or user data
    return {
      message: "User found",
      user: existingUser,
    };
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      // User not found, proceed to create
      const newUserPayload = {
        telegramid: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        handle: userData.handle,
        referral: userData.referral,
        // Add other fields if needed
      };

      const newUser = await userService.createUser(newUserPayload);
      return {
        message: "User created after 404",
        user: newUser,
      };
    }

    // Handle any other errors
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
