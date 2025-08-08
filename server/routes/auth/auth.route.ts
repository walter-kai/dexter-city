import express from 'express';
import { connectWallet, verifySignature } from './auth.controller';

const router = express.Router();

// POST /auth/connect - Connect wallet and get Firebase custom token (no signature required)
router.post('/connect', connectWallet);

// POST /auth/verify - Verify signature and get Firebase custom token (legacy)
router.post('/verify', verifySignature);

export default router;
