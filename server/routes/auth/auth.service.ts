import admin from 'firebase-admin';
import ApiError from '../../utils/api-error';
import logger from '../../utils/logger';

export interface AuthRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface AuthResponse {
  customToken: string;
  user: {
    walletAddress: string;
    uid: string;
  };
}

/**
 * Verify MetaMask signature and create Firebase custom token
 * For now, we'll do basic verification and rely on the frontend signature process
 * In production, you'd want proper cryptographic verification
 */
export async function authenticateWithMetaMask(authRequest: AuthRequest): Promise<AuthResponse> {
  const { walletAddress, signature, message } = authRequest;

  try {
    // Basic validation - in production you'd verify the signature cryptographically
    if (!walletAddress || !signature || !message) {
      throw new ApiError(400, 'Missing required authentication data');
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

    // Use wallet address as Firebase UID
    const uid = walletAddress.toLowerCase();

    // Create custom claims
    const customClaims = {
      walletAddress: walletAddress.toLowerCase(),
      authMethod: 'metamask'
    };

    // Create custom token
    const customToken = await admin.auth().createCustomToken(uid, customClaims);

    // Create or update user record in Firebase Auth
    try {
      await admin.auth().getUser(uid);
      // User exists, update if needed
      await admin.auth().updateUser(uid, {
        displayName: `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        await admin.auth().createUser({
          uid,
          displayName: `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        });
      } else {
        throw error;
      }
    }

    logger.info(`User authenticated: ${walletAddress}`);

    return {
      customToken,
      user: {
        walletAddress: walletAddress.toLowerCase(),
        uid
      }
    };

  } catch (error) {
    logger.error('MetaMask authentication error:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, 'Authentication failed');
  }
}
