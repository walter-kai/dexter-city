import { Request, Response } from "express";
import ApiError from "../../utils/api-error";
import catchAsync from "../../utils/catch-async";

import authService from "./auth.service";

const login = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { walletId } = req.body;

  if (!walletId || typeof walletId !== 'string') {
    throw new ApiError(400, "Missing or invalid walletId in request body");
  }

  const user = await authService.login(walletId);

  return res.status(200).json(user);
});

export default {
  login
};
