import { Request, Response } from "express";
import ApiError from "../utils/api-error";
import catchAsync from "../utils/catch-async";

import authService from "../services/auth.service";
import userService from "../services/user.service";
import { UserArgs } from '../../client/src/models/User'; // Adjust path as necessary

const login = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userData: UserArgs = req.body; // Validate the structure

  if (!userData) {
    throw new ApiError(400, "Missing TelegramUser in request params");
  }

  // Attempt to login the user, or create if they don't exist
  let user = (await authService.login(userData)).user;
  if(!user){
    user = await userService.createUser(userData);
  }

  return res.status(200).json( user );
});



export default {
  login
};
