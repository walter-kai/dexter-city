import { ethers } from "ethers";
import admin from "firebase-admin";
import { db } from "../firebase/firebase.config";
import logger from "../../utils/logger";

/**
 * Create Firebase custom token for a wallet address (no signature verification)
 * @param walletAddress - The Ethereum wallet address
 * @returns Firebase custom token
 */
const createTokenForWallet = async (walletAddress: string): Promise<string> => {
  const breadcrumb = `createTokenForWallet(${walletAddress})`;
  console.log('Auth service createTokenForWallet called:', { walletAddress });

  if (!walletAddress || !ethers.isAddress(walletAddress)) {
    throw new Error(`Invalid wallet address provided. ${breadcrumb}`);
  }

  try {
    // Create Firebase custom token with wallet address as UID
    const customToken = await admin.auth().createCustomToken(walletAddress.toLowerCase());

    logger.info(`Created custom token for wallet: ${walletAddress}`);
    return customToken;

  } catch (error) {
    logger.error(`Token creation failed: ${error}`);
    throw new Error(`Token creation failed. ${breadcrumb}`);
  }
};

/**
 * Verify the signature and create Firebase custom token
 * @param walletAddress - The Ethereum wallet address
 * @param signature - The signed message from MetaMask
 * @param message - The original message that was signed
 * @returns Firebase custom token
 */
const verifySignatureAndCreateToken = async (
  walletAddress: string,
  signature: string,
  message: string
): Promise<string> => {
  const breadcrumb = `verifySignatureAndCreateToken(${walletAddress})`;
  console.log('Auth service called:', { walletAddress, signature: signature.substring(0, 20) + '...', message });

  if (!walletAddress || !ethers.isAddress(walletAddress)) {
    throw new Error(`Invalid wallet address provided. ${breadcrumb}`);
  }

  if (!signature || !message) {
    throw new Error(`Missing signature or message. ${breadcrumb}`);
  }

  try {
    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    console.log('Recovered address:', recoveredAddress, 'Expected:', walletAddress);
    
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error(`Signature verification failed. ${breadcrumb}`);
    }

    logger.info(`Signature verified for wallet: ${walletAddress}`);

    // Create Firebase custom token with wallet address as UID
    const customToken = await admin.auth().createCustomToken(walletAddress.toLowerCase());

    logger.info(`Created custom token for wallet: ${walletAddress}`);
    return customToken;

  } catch (error) {
    logger.error(`Signature verification failed: ${error}`);
    throw new Error(`Signature verification failed. ${breadcrumb}`);
  }
};

export default {
  createTokenForWallet,
  verifySignatureAndCreateToken,
};
