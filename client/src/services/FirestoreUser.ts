import User, { UserArgs, TelegramUser,  } from "../models/User";
import TelegramApp from "./Telegram";
import { Timestamp } from "firebase-admin/firestore"; // Firestore's Timestamp object


/**
 * Create a new user in the DB.
 *
 * @returns {Promise<User>} The newly created User.
 */
const newUser = async (): Promise<User> => {


  // const { user: telegramUser } = telegramUserData;
  const { user: telegramUser } = TelegramApp.getUserDetails();

  // Prepare the request body to create a new user
  const requestBody = {
    telegramid: telegramUser.id,
    firstname: telegramUser.first_name || null,
    lastname: telegramUser.last_name || null,
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
    walletId: user.walletId || null,              // Assuming `walletId` is required
    username: user.username,       // Optional username
    telegramId: user.telegramId,   // Optional telegramId
    referralId: user.referralId || null,   // Optional referralId
    dateCreated: user.dateCreated || new Date(), // Fallback to current date if not provided
    lastLoggedIn: user.lastLoggedIn,       // Last login timestamp
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
export const login = async (): Promise<{ newUser: boolean; user: User }> => {

  const { user: telegramUser, referral } = TelegramApp.getUserDetails();


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
    }),
  });

  // Handle response
  if (!res.ok) {
    // Handle error, create user logic in backend
    throw new Error('Login failed');
  }

  const { newUser, user } = (await res.json()) as { newUser: boolean, user: User };

  // You can log the message if needed
  console.log(newUser); // Optional: log the message

  return { newUser, user }; // Return the user directly
};


/**
 * Fetch the user based on their Telegram ID.
 *
 * @returns {Promise<User | null>} Returns the user associated with the Telegram ID or null if not found.
 */
export const getTelegramUser = async (): Promise<User | null> => {
  const { user: telegramUser } = TelegramApp.getUserDetails();

  if (!telegramUser.id) {
    console.warn("Telegram ID is missing");
    return null;
  }

  // Prepare the URL with the Telegram ID as a query parameter
  const url = new URL(`/api/user/telegram`, window.location.origin);
  url.searchParams.append("telegramId", telegramUser.id);
  url.searchParams.append("username", telegramUser.first_name);

  // Send GET request
  const res: Response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // If the user is not found, return null
  if (res.status === 404) {
    return null;
  }

  // If the response is successful, extract and return the user data
  const { user } = (await res.json()) as { user: UserArgs };
  return new User(user);
};

/**
 * Fetch the user based on their Wallet ID (from sessionStorage).
 *
 * @returns {Promise<User | null>} Returns the user associated with the Wallet ID or null if not found.
 */
export const getWalletUser = async (): Promise<User | null> => {
  const walletId = sessionStorage.getItem("walletId");

  if (!walletId) {
    console.warn("Wallet ID is missing in sessionStorage");
    return null;
  }

  // Prepare the URL with the Wallet ID as a query parameter
  const url = new URL(`/api/user/wallet`, window.location.origin);
  url.searchParams.append("walletId", walletId);

  // Send GET request
  const res: Response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // If the user is not found, return null
  if (res.status === 404) {
    return null;
  }

  // If the response is successful, extract and return the user data
  const { user } = (await res.json()) as { user: UserArgs };
  return new User(user);
};

