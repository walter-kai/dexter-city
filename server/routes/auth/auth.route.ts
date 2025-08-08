import express from 'express';
import { authenticateMetaMask } from './auth.controller';

const router = express.Router();

/**
 * POST /auth/metamask
 * Authenticate user with MetaMask signature
 */
router.post('/metamask', authenticateMetaMask);

export default router;
