import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import ApiError from '../../utils/api-error';
import logger from '../../utils/logger';

export interface AuthRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    walletAddress: string;
    uid: string;
    username: string;
    email: string;
    createdAt: Date;
    lastLogin: Date;
    referralId?: string;
    telegramId?: string;
    photoUrl?: string;
  };
  expiresIn: number;
}

/**
 * Verify MetaMask signature and authenticate user
 */
export async function authenticateWithMetaMask(authRequest: AuthRequest): Promise<AuthResponse> {
  const { walletAddress, signature, message } = authRequest;

  try {
    // Basic validation
    if (!walletAddress || !signature || !message) {
      throw new ApiError(400, 'Missing required authentication data');
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new ApiError(401, 'Invalid wallet address format');
    }

    // Optional: Verify the signature matches the wallet address
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new ApiError(401, 'Signature does not match wallet address');
      }
      logger.info(`Signature verified for wallet: ${walletAddress}`);
    } catch (verifyError) {
      logger.error('Signature verification failed:', verifyError);
      throw new ApiError(401, 'Invalid signature');
    }

    // Validate wallet address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new ApiError(401, 'Invalid wallet address format');
    }

    // For now, skip message format validation to test the flow
    // TODO: Add proper signature verification in production
    
    // Check if message contains timestamp for basic validation
    if (!message || message.length < 10) {
      throw new ApiError(401, 'Invalid message');
    }

    // Use wallet address as user ID
    const uid = walletAddress.toLowerCase();

    // Create JWT payload
    const payload = {
      uid,
      walletAddress: walletAddress.toLowerCase(),
      authMethod: 'metamask',
      iat: Math.floor(Date.now() / 1000),
    };

    // Create JWT (expires in 24 hours)
    const expiresIn = 24 * 60 * 60; // 24 hours in seconds
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      { 
        expiresIn,
        issuer: 'dexter-city',
        audience: 'dexter-city-users'
      }
    );

    // Create or update user in Firestore using Admin SDK
    const userDocRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    let userData;

    if (!userDoc.exists) {
      // Create new user document
      userData = {
        walletAddress: walletAddress.toLowerCase(),
        username: '',
        email: '',
        createdAt: new Date(),
        lastLogin: new Date(),
      };
      
      await userDocRef.set({
        ...userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Update last login and get existing data
      await userDocRef.update({
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      const existingData = userDoc.data();
      userData = {
        walletAddress: walletAddress.toLowerCase(),
        username: existingData?.username || '',
        email: existingData?.email || '',
        createdAt: existingData?.createdAt?.toDate() || new Date(),
        lastLogin: new Date(),
        ...(existingData?.referralId && { referralId: existingData.referralId }),
        ...(existingData?.telegramId && { telegramId: existingData.telegramId }),
        ...(existingData?.photoUrl && { photoUrl: existingData.photoUrl }),
      };
    }

    logger.info(`User authenticated with JWT: ${walletAddress}`);

    return {
      accessToken,
      user: {
        ...userData,
        uid
      },
      expiresIn
    };

  } catch (error) {
    logger.error('MetaMask authentication error:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, 'Authentication failed');
  }
}
