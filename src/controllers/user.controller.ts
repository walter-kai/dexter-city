// Import necessary dependencies
import userService from "../services/user.service";
import ApiError from "../utils/api-error";
import catchAsync from "../utils/catch-async";
import { Request, Response } from "express";

// Get a user by Telegram ID
const getUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { walletId, telegramId } = req.query;

  const wallet: string = walletId ? String(walletId) : '';
  const telegram: string = telegramId ? String(telegramId) : '';

  if (!telegramId && !walletId) {
    throw new ApiError(400, "Missing params to get user");
  }

  const user = await userService.getUser(wallet, telegram);

  if (!user) {
    throw new ApiError(404, `User with telegramId ${telegramId} not found`);
  }

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
    throw new ApiError(404, `User with telegramId ${telegramId} or walletId ${walletId} not found`);
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
  getUser,
  updateUser,
  createUser,
};
