import { Request, Response } from "express";
import userService from "../services/user.service";
import ApiError from "../utils/api-error";
import catchAsync from "../utils/catch-async";
import User, { UserArgs } from "../../client/src/models/User";

const setUserChatId = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  if (req.params.telegramId == null) {
    throw new ApiError(400, "Missing telegramId in request params");
  } else if (req.params.chatId == null) {
    throw new ApiError(400, "Missing chatId in request params");
  }
  return res.json({ chatId: await userService.setUserChatId(req.params.telegramId, req.params.chatId) });
});

const getUsers = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  if (req.query.telegramIds == null || typeof req.query.telegramIds != "string") {
    throw new ApiError(400, "Missing telegramIds in request query");
  }
  const telegramIds = req.query.telegramIds.split(",");
  if (telegramIds.length > 30) {
    throw new ApiError(400, "Too many telegramIds, max is 30.");
  }
  return res.json({ users: await userService.getUsersByTelegramId(telegramIds) });
});

const updateUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  // Directly use the data from req.body, assuming it's of type User
  const userData: User = req.body;

  if (!userData.telegramId) {
    throw new ApiError(400, "Missing telegramId in request body");
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
  if (req.body.telegramId == null) {
    throw new ApiError(400, "Missing telegramId in request body");
  }
  return res.json({ user: await userService.createUser(req.body) });
});

const getUsersPickScores = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  if (req.query.telegramIds == null || typeof req.query.telegramIds !== "string") {
    throw new ApiError(400, "Missing telegramIds in request query");
  }

  const telegramIds = req.query.telegramIds.split(",");
  if (telegramIds.length > 30) {
    throw new ApiError(400, "Too many telegramIds, max is 30.");
  }

  if (req.query.timeFrame == null || typeof req.query.timeFrame !== "string") {
    throw new ApiError(400, "Missing timeFrame in request query");
  }

  if (req.query.date != null && typeof req.query.date !== "string") {
    throw new ApiError(400, "date must be of type string");
  }

  const scores = 0;
  return res.json({ scores });
});


const addUsersFavoriteSports = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  if (req.body.telegramId == null) {
    throw new ApiError(400, "Missing telegramId in request params");
  }

  if (req.body.favoriteSports == null || !Array.isArray(req.body.favoriteSports)) {
    throw new ApiError(400, "Missing favoriteSports in request body");
  }


  return res.json({ success: true });
});

export default {
  setUserChatId,
  updateUser,
  createUser,
  getUsers,
  getUsersPickScores,
  addUsersFavoriteSports,
};
