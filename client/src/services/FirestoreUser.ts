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
    walletId: user.walletId,              // Assuming `walletId` is required
    username: user.username,       // Optional username
    telegramId: user.telegramId || null,   // Optional telegramId
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

  const { newUser, user } = (await res.json()) as { newUser: boolean, user: User };

  // You can log the message if needed
  console.log(newUser); // Optional: log the message

  return { newUser, user }; // Return the user directly
};



/**
 * Get the current user based on Telegram ID and optional wallet ID
 *
 * @param {boolean} createUserIfNoneExists - If true, creates a new user if none exists.
 * @returns {Promise<User | null>} Returns the user associated with the telegram ID or null if not found.
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const { user: telegramUser } = TelegramApp.getUserDetails();

  // Check sessionStorage for walletId
  const walletId = sessionStorage.getItem("walletId");

  // Prepare the URL with query parameters (walletId and telegramId)
  const url = new URL(`/api/user`, window.location.origin);
  if (walletId) {
    url.searchParams.append("walletId", walletId);
  }
  if (telegramUser.id) {
    url.searchParams.append("telegramId", telegramUser.id);
  }

  // Send GET request
  let res: Response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Check if the response status is 404 and return null if so
  if (res.status === 404) {
    return null;
  }

  // If the response is successful, extract and return the user data
  const { user } = (await res.json()) as { user: UserArgs };
  return new User(user);
};

