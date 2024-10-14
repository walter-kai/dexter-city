import { Request, Response } from "express";
import userService from "../services/user.service";
import ApiError from "../utils/api-error";
import catchAsync from "../utils/catch-async";
// import pickService from "../services/pick.service";
// import { TimeFrame } from "../models/leaderboard.model";

const setUserChatId = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  if (req.params.telegramId == null) {
    throw new ApiError(400, "Missing telegramId in request params");
  } else if (req.params.chatId == null) {
    throw new ApiError(400, "Missing chatId in request params");
  }
  return res.json({ chatId: await userService.setUserChatId(req.params.telegramId, req.params.chatId) });
});

// const getUsersPicks = catchAsync(async (req: Request, res: Response): Promise<Response> => {
//   if (req.params.telegramId == null) {
//     throw new ApiError(400, "Missing telegramId in request params");
//   }

//   if (req.query.offsetDocId != null && typeof req.query.offsetDocId !== "string") {
//     throw new ApiError(400, "Offset doc id must be of type string");
//   }

//   if (req.query.limit != null && typeof req.query.limit !== "string") {
//     throw new ApiError(400, "limit must be of type string");
//   }

//   return res.json({
//     picks: await userService.getUsersPicks({
//       telegramId: req.params.telegramId,
//       offsetDocId: req.query.offsetDocId,
//       limit: req.query.limit != null ? parseInt(req.query.limit) : undefined,
//     }),
//   });
// });

// const getUsersMissions = catchAsync(async (req: Request, res: Response): Promise<Response> => {
//   if (req.params.telegramId == null) {
//     throw new ApiError(400, "Missing telegramId in request params");
//   }
//   return res.json({ missions: await userService.getUsersMissions([req.params.telegramId]) });
// });

const getAllUsers = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  return res.json({ users: await userService.getAllUsers() });
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

// const processUsersScore = catchAsync(async (req: Request, res: Response): Promise<Response> => {
//   if (req.params.telegramIds == null) {
//     throw new ApiError(400, "Missing telegramIds in request params");
//   }
//   const telegramIds = req.params.telegramIds.split(",");
//   if (telegramIds.length > 30) {
//     throw new ApiError(400, "Too many telegramIds, max is 30.");
//   }
//   const users = await userService.getUsersByTelegramId(telegramIds);
//   return res.json({
//     score: (await userService.processUsersScore(Object.values(users)))[req.params.telegramId].totalScore,
//   });
// });

// const processAllUsersScore = catchAsync(async (req: Request, res: Response): Promise<Response> => {
//   for await (const users of userService.getAllUsersInChunks({ chunkSize: 30 })) {
//     await userService.processUsersScore(users);
//   }

//   return res.json({ success: true });
// });

const updateUserDocByTelegramId = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  if (req.body.telegramId == null) {
    throw new ApiError(400, "Missing telegramId in request body");
  }
  return res.json({ user: await userService.createUser(req.body) });
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
  // await userService.addUsersFavoriteSports({
  //   telegramId: req.body.telegramId,
  //   favoriteSports: req.body.favoriteSports,
  // });

  return res.json({ success: true });
});

export default {
  setUserChatId,
  // getUsersPicks,
  getAllUsers,
  // getUsersMissions,
  // processUsersScore,
  updateUserDocByTelegramId,
  createUser,
  getUsers,
  getUsersPickScores,
  addUsersFavoriteSports,
};
