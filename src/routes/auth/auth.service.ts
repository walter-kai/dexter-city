import userService from "../user/user.service";
import User, { UserArgs } from '../../../client/src/models/User';
import logger from "../../config/logger";

/**
 * Get a test message
 * @returns {string} The message we want to return
 */
const getTestMessage = async (): Promise<string> => {
  return "The message is hello!";
};

/**
 * Login or create a user based on their walletId.
 * @param {string} walletId - The wallet ID to login with
 * @returns {Promise<User>} The user data
 */
const login = async (walletId: string): Promise<User> => {
  try {
    // Fetch the user based on walletId
    let existingUser: User | null = await userService.getUserByWalletId(walletId);

    // If the user does not exist, create a new one
    if (!existingUser) {
      logger.info(`Creating new user with walletId: ${walletId}`);
      
      const newUserData: UserArgs = {
        dateCreated: new Date(),
        firstName: "New User",
        lastName: null,
        telegramHandle: null,
        lastLoggedIn: new Date(),
        referralId: null,
        telegramId: "",
        walletId: walletId,
        favoriteTokens: null,
        photoId: null,
        photoUrl: null,
      };

      existingUser = await userService.createUser(newUserData);
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

    return updatedUser || existingUser;
  } catch (error) {
    console.error("Error during login or create:", error);
    throw new Error("Failed to login user");
  }
};

export default {
  getTestMessage,
  login,
};
