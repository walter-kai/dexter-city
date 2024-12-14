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
 * Updates an existing user based on the provided User object.
 *
 * @param {User} user - The user object containing the updated user data.
 * @returns {Promise<User>} - Returns the updated user.
 */
export const updateUser = async (user: User): Promise<User> => {
  // Map User object to the structure expected by userService
  const userPayload: UserArgs = {
    telegramId: user.telegramId,
    firstName: user.firstName,
    lastName: user.lastName,
    telegramHandle: user.telegramHandle,
    referralTelegramId: user.referralTelegramId,
    photoId: user.photoId || '',
    photoUrl: user.photoUrl || '',
    lastLoggedIn: user.lastLoggedIn,
    dateCreated: user.dateCreated || new Date(),
  };

  // This is the fetch request to update the user using PUT
  const res: Response = await fetch(`/api/user/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userPayload), // Send the full payload
  });

  // If the update fails, throw an error
  if (!res.ok) {
    throw new Error("Failed to update the user.");
  }

  // Parse and return the updated user from the response
  const { updatedUser } = (await res.json()) as { updatedUser: User };
  return updatedUser;
};


/**
 * Log in the user based on their Telegram information.
 *
 * @returns {Promise<User>} The logged-in user.
 */
export const login = async (): Promise<User> => {
  const{ user: telegramUser, referral } = (await getTelegram());

  let res: Response = await fetch(`/api/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
    id: telegramUser.id,
    first_name: telegramUser.first_name,
    last_name: telegramUser.last_name || undefined, // Optional field
    username: telegramUser.username || undefined, // Optional field
    // Optional fields from TelegramUser
    is_bot: telegramUser.is_bot,
    language_code: telegramUser.language_code,
    is_premium: telegramUser.is_premium,
    added_to_attachment_menu: telegramUser.added_to_attachment_menu,
    can_join_groups: telegramUser.can_join_groups,
    can_read_all_group_messages: telegramUser.can_read_all_group_messages,
    supports_inline_queries: telegramUser.supports_inline_queries,
    can_connect_to_business: telegramUser.can_connect_to_business,
    has_main_web_app: telegramUser.has_main_web_app,
    referral: referral || undefined, // Optional field
    }),
  });

  // Handle response
  if (!res.ok) {
    // Handle error, create user logic in backend
    throw new Error('Login failed');
  }

  const { message, user } = (await res.json()) as { message: string, user: User };

  // You can log the message if needed
  console.log(message); // Optional: log the message

  return user; // Return the user directly
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
