import User, { UserArgs, TelegramUser } from "../models/User";

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
    walletId: user.walletId,
    username: user.username,
    // lastName: user.lastName,
    // telegramHandle: user.telegramHandle,
    referralId: user.referralId,
    // photoId: user.photoId || '',
    // photoUrl: user.photoUrl || '',
    // favoriteTokens: user.favoriteTokens,
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

export const handleUserLogin = async (walletId: string, username?: string, referralId?: string): Promise<{ user: User, isNewUser: boolean }> => {
  let res: Response = await fetch(`/api/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletId, username, referralId }),
  });
  if (!res.ok) {
    throw new Error('Login failed');
  }
  const { user, isNewUser } = await res.json();
  return { user: new User(user), isNewUser };
};