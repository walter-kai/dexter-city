import { Request, Response } from "express";
import userService from "../services/user.service";
import ApiError from "../utils/api-error";
import catchAsync from "../utils/catch-async";

import authService from "../services/auth.service";
import { TelegramUser } from '../../client/src/models/User'; // Adjust path as necessary

const login = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userData: TelegramUser = req.body; // Validate the structure

  if (!userData) {
    throw new ApiError(400, "Missing TelegramUser in request params");
  }

  // Attempt to login the user, or create if they don't exist
  const user = await authService.loginOrCreate(userData);

  return res.status(200).json( user );
});


const getCurrentUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  // TODO: Add authentication here
  const { telegramId, handle, firstname, lastname, referral } = req.body;

  if (telegramId == null) {
    throw new ApiError(400, "Missing telegramId in request body");
  }

  const user = await userService.getUsersByTelegramId([telegramId.toString()]);
  
  // Check if the user is found
  const existingUser = user ? user[telegramId.toString()] : null;

  // If user not found, return a 200 response with a message
  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if the request body differs from the existing user
  const shouldUpdate = 
    (handle && handle !== existingUser.handle) ||
    (firstname && firstname !== existingUser.firstname) ||
    (lastname && lastname !== existingUser.lastname) ||
    (referral && referral !== existingUser.referral);

  if (shouldUpdate) {
    // Call updateUserInfoByTelegramId if any field differs
    await userService.updateUserInfoByTelegramId(telegramId, {
      handle: handle || existingUser.handle,
      firstname: firstname || existingUser.firstname,
      lastname: lastname || existingUser.lastname,
      referral: referral || existingUser.referral,
    });
  }

  return res.json({ user: existingUser });
});

export default {
  getCurrentUser, login
};
