import { Request, Response } from "express";
import userService from "./user.service";
import ApiError from "../../utils/api-error";
import catchAsync from "../../utils/catch-async";
import User, { UserArgs } from "../../../.types/User";
import { db } from "../firebase/firebase.config";

const setUserChatId = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  if (req.params.telegramId == null) {
    throw new ApiError(400, "Missing telegramId in request params");
  } else if (req.params.chatId == null) {
    throw new ApiError(400, "Missing chatId in request params");
  }
  return res.json({ chatId: await userService.setUserChatId(req.params.telegramId, req.params.chatId) });
});

const updateUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  // Directly use the data from req.body, assuming it's of type User
  const userData: User = req.body;

  if (!userData.walletId) {
    throw new ApiError(400, "Missing walletId in request body");
  }

  // Convert date strings to Date objects if they are strings
  if (typeof userData.lastLoggedIn === 'string') {
    userData.lastLoggedIn = new Date(userData.lastLoggedIn);
  }
  
  if (typeof userData.dateCreated === 'string') {
    userData.dateCreated = new Date(userData.dateCreated);
  }

  // Call the userService.updateUser method, passing the User object directly
  const updatedUser = await userService.updateUser(userData);

  if (!updatedUser) {
    throw new ApiError(404, `User with telegramId ${userData.telegramId} not found`);
  }

  return res.json({ message: "User updated successfully", user: updatedUser });
});

const createUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  if (req.body.walletId == null) {
    throw new ApiError(400, "Missing walletId in request body");
  }
  return res.json({ user: await userService.createUser(req.body) });
});

const login = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { walletId, username, referralId } = req.body;

  if (!walletId || typeof walletId !== 'string') {
    throw new ApiError(400, "Missing or invalid walletId in request body");
  }
  // username and referralId are optional for legacy support

  let user = await userService.getUserByWalletId(walletId);
  let isNewUser = false;

  if (!user) {
    const newUserData: UserArgs = {
      dateCreated: new Date(),
      username: null,
      lastLoggedIn: new Date(),
      referralId: referralId || null,
      telegramId: null,
      walletId,
    };
    user = await userService.createUser(newUserData);
    isNewUser = true;
  } else {
    // Update lastLoggedIn
    user.lastLoggedIn = new Date();
    await userService.updateUser(user);
  }

  return res.status(200).json({ user, isNewUser });
});

const checkUsernameAvailability = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { username } = req.query;
  if (!username || typeof username !== 'string') {
    throw new ApiError(400, 'Missing or invalid username in query');
  }
  // Query users collection for username (case-insensitive)
  const usersRef = db.collection('users');
  const q = usersRef.where('username', '==', username);
  const snapshot = await q.get();
  const available = snapshot.empty;
  return res.json({ available });
});

export default {
  setUserChatId,
  updateUser,
  createUser,
  login,
  checkUsernameAvailability,
};
