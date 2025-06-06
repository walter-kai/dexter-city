import express from "express";
import { getTokenByAddress } from "./firebase.service";

const router = express.Router();

/**
 * GET /firebase/tokenInfo
 * Fetch a single token by its contract address.
 */
router.get("/tokenInfo", async (req, res) => {
  const { tokenAddress } = req.query;

  if (!tokenAddress || typeof tokenAddress !== "string") {
    return res.status(400).json({ message: "Missing or invalid tokenAddress parameter." });
  }

  try {
    const token = await getTokenByAddress(tokenAddress);
    res.status(200).json(token);
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ message: err.message || "Internal Server Error" });
  }
});

export default router;
