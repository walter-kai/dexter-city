import User, { UserArgs, TelegramUser,  } from "../models/User";
import { getTelegram } from "./Telegram";
import { Timestamp } from "firebase-admin/firestore"; // Firestore's Timestamp object


/**
 * Create a new user in the DB.
 *
 * @returns {Promise<User>} The newly created User.
 */
const newUser = async (): Promise<User> => {
  // Fetch Telegram user data
  const telegramUserData = (await getTelegram()) as {
    user: {
      id: string;
      firstName?: string; // Optional
      lastName?: string; // Optional
      username?: string; // Optional
    };
  };

  const { user: telegramUser } = telegramUserData;

  // Prepare the request body to create a new user
  const requestBody = {
    telegramid: telegramUser.id,
    firstname: telegramUser.firstName || null,
    lastname: telegramUser.lastName || null,
    handle: telegramUser.username || null,
    referral: null, // Set to null or provide referral logic
    firstTime: true, // Set firstTime to true for new users
  };

  const req = await fetch(`/api/user/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody), // Send the request body
  });

  if (!req.ok) {
    throw new Error("There was an error creating the new user.");
  }

  const response = await req.json();

  const { user } = response as { user: UserArgs };

  return new User(user); // Return the created User
};

/**
 * Get the current user based on Telegram ID
 *
 * @param {string} telegramId - Telegram ID of the user to fetch
 * @param {boolean} createUserIfNoneExists - If true, creates a new user if none exists.
 * @returns {Promise<User>} Returns the user associated with the telegram ID.
 */
export const updateUser = async (
  telegramUser: { id: string; firstName?: string; lastName?: string; username?: string },
  createUserIfNoneExists: boolean = false
): Promise<User> => {
  // This is the fetch request to update the user using PUT
  let res: Response = await fetch(`/api/user/update`, {
    method: "PUT", // Use PUT for updating existing user data
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      telegramId: telegramUser.id,
      firstname: telegramUser.firstName || null,
      lastname: telegramUser.lastName || null,
      handle: telegramUser.username || null,
    }),
  });

  // If the update fails and the user doesn't exist, create a new one if the flag is set
  if (!res.ok) {
    if (createUserIfNoneExists) {
      return await newUser(); // Create a new user if none exists
    }
    throw new Error("Failed to update or fetch the current user.");
  }

  // Parse the response and return the updated user
  const { user } = (await res.json()) as { user: UserArgs };
  return new User(user); // Return updated user
};


/**
 * Get the current user based on Telegram ID
 *
 * @param {string} telegramId - Telegram ID of the user to fetch
 * @param {boolean} createUserIfNoneExists - If true, creates a new user if none exists.
 * @returns {Promise<User>} Returns the user associated with the telegram ID.
 */
export const login = async (): Promise<User> => {
  const telegramUser: TelegramUser = (await getTelegram()).user;

  let res: Response = await fetch(`/api/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: telegramUser.id,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name,
      handle: telegramUser.handle,
      pickScore: telegramUser.pickScore,
      missionScore: telegramUser.missionScore,
      totalWins: telegramUser.totalWins,
      totalLosses: telegramUser.totalLosses,
      // Add other optional fields if they exist
      dateCreated: telegramUser.dateCreated,
      lastLoggedIn: telegramUser.lastLoggedIn,
      referral: telegramUser.referral,
    }),
  });

  // Handle response
  if (!res.ok) {
    // Handle error, create user logic in backend
    // Alternatively, throw an error here if needed
    throw new Error('Login failed');
  }

  const { user } = (await res.json()) as { user: User };

  return new User(user);
};


/**
 * Get the current user based on Telegram ID
 *
 * @param {string} telegramId - Telegram ID of the user to fetch
 * @param {boolean} createUserIfNoneExists - If true, creates a new user if none exists.
 * @returns {Promise<User>} Returns the user associated with the telegram ID.
 */
export const getCurrentUser = async (
  telegramId?: string,
  createUserIfNoneExists: boolean = false
): Promise<User> => {
  const telegramUserData = (await getTelegram()) as {
    user: {
      id: string;
    };
  };
  const { user: telegramUser } = telegramUserData;

  let res: Response = await fetch(`/api/auth/me`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      telegramId: telegramUser.id,
    }),
  });

  if (!res.ok) {
    if (createUserIfNoneExists) {
      return await newUser(); // Create a new user if none exists
    }
    throw new Error("Failed to fetch the current user.");
  }

  const { user } = (await res.json()) as { user: UserArgs };

  return new User(user);
};

/**
 * Get all users in the DB.
 *
 * @returns {Promise<ReadonlyArray<User>>} All Users in the DB
 */
export const getUsers = async (): Promise<ReadonlyArray<User>> => {
  const req = await fetch(`/api/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!req.ok) {
    throw new Error("There was an error fetching the users.");
  }

  const { users } = (await req.json()) as { users: UserArgs[] };

  return users.map((user) => new User(user));
};
