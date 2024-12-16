// Import necessary dependencies
import userService from "../services/user.service";
import ApiError from "../utils/api-error";
import catchAsync from "../utils/catch-async";
import { Request, Response } from "express";

// Get a user by Telegram ID
// Get a user by Telegram ID
const getUserByWalletId = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { walletId } = req.query;

  const wallet: string = walletId ? String(walletId) : '';

  // If neither walletId nor telegramId are provided, return a 400 error
  if (!walletId) {
    throw new ApiError(400, "Missing walletId to get user");
  }

  // Otherwise, search for the user by walletId and telegramId
  const user = await userService.getUserByWalletId(wallet);

  // If user is not found, return a 404 error
  if (!user) {
    return res.status(404).json({ error: `User not found` });
  }

  // Return the found user
  return res.json({ user });
});

// Get a user by Telegram ID
const getUserByTelegramId = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { telegramId, username } = req.query;

  const telegram: string = telegramId ? String(telegramId) : '';
  const name: string = username ? String(username) : '';

  // If neither walletId nor telegramId are provided, return a 400 error
  if (!telegramId) {
    throw new ApiError(400, "Missing telegramId to get user");
  }

  // Otherwise, search for the user by walletId and telegramId
  const user = await userService.getUserByTelegramId(telegram, name);

  // If user is not found, return a 404 error
  if (!user) {
    return res.status(404).json({ error: `User not found` });
  }

  // Return the found user
  return res.json({ user });
});

// Update a user's document by Telegram ID
const updateUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { telegramId, walletId, updateData } = req.body;

  // Ensure at least one of walletId or telegramId is provided
  if (!telegramId && !walletId) {
    throw new ApiError(400, "Missing telegramId or walletId in request body");
  }

  // Ensure updateData is provided
  if (!updateData || Object.keys(updateData).length === 0) {
    throw new ApiError(400, "Missing update data in request body");
  }

  // Call the updateUser service
  const updatedUser = await userService.updateUser(walletId, telegramId, updateData);

  if (!updatedUser) {
    return res.status(404).json({ error: `User not found` });
  }

  return res.json({ message: "User updated successfully", user: updatedUser });
});


// Create a new user
const createUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { walletId, telegramId } = req.body;

  if (!walletId || !telegramId) {
    throw new ApiError(400, "Missing walletId or telegramId in request body");
  }

  const newUser = await userService.createUser(req.body);
  return res.json({ message: "User created successfully", user: newUser });
});

export default {
  getUserByWalletId,
  getUserByTelegramId,
  updateUser,
  createUser,
};
