import { Request, Response, NextFunction } from 'express';
import authService from './auth.service';
import catchAsync from '../../utils/catch-async';

// Connect wallet and create Firebase custom token (no signature required)
export const connectWallet = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  console.log('Auth connect endpoint hit:', req.body);
  
  const { walletAddress } = req.body;
  
  if (!walletAddress) {
    console.log('Missing wallet address');
    return res.status(400).json({ 
      error: 'Wallet address is required' 
    });
  }

  try {
    const customToken = await authService.createTokenForWallet(walletAddress);
    
    return res.json({ customToken });
  } catch (error) {
    console.error('Error creating token for wallet:', error);
    return res.status(500).json({ error: 'Failed to authenticate wallet' });
  }
});

// Verify signature and create Firebase custom token
export const verifySignature = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  console.log('Auth verify endpoint hit:', req.body);
  
  const { walletAddress, signature, message } = req.body;
  
  if (!walletAddress || !signature || !message) {
    console.log('Missing required fields:', { walletAddress: !!walletAddress, signature: !!signature, message: !!message });
    return res.status(400).json({ 
      error: 'Wallet address, signature, and message are required' 
    });
  }

  try {
    const customToken = await authService.verifySignatureAndCreateToken(
      walletAddress, 
      signature, 
      message
    );
    
    return res.json({ customToken });
  } catch (error) {
    console.error('Error verifying signature:', error);
    return res.status(401).json({ error: 'Invalid signature' });
  }
});
