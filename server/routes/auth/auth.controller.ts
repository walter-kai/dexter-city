import { Request, Response, NextFunction } from 'express';
import { authenticateWithMetaMask } from './auth.service';
import catchAsync from '../../utils/catch-async';
import ApiError from '../../utils/api-error';

interface AuthRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

/**
 * POST /auth/metamask
 * Authenticate user with MetaMask signature
 */
export const authenticateMetaMask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { walletAddress, signature, message }: AuthRequest = req.body;

  if (!walletAddress || !signature || !message) {
    throw new ApiError(400, 'Missing required fields: walletAddress, signature, message');
  }

  const result = await authenticateWithMetaMask({ walletAddress, signature, message });

  return res.status(200).json({
    success: true,
    data: result
  });
});
