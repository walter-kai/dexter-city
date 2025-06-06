import { Request, Response } from "express";
import { getTokenByAddress } from "./firebase.service";

/**
 * Fetch a single token by its contract address.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const fetchTokenInfo = async (req: Request, res: Response): Promise<void> => {
  const { tokenAddress } = req.query;

  if (!tokenAddress || typeof tokenAddress !== "string") {
    res.status(400).json({ message: "Missing or invalid tokenAddress parameter." });
    return;
  }

  try {
    const token = await getTokenByAddress(tokenAddress);
    if (!token) {
      res.status(404).json({ message: "Token not found." });
      return;
    }

    res.status(200).json(token);
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ message: err.message || "Internal Server Error" });
  }
};
