import { Request, Response } from "express";
import catchAsync from "../utils/catch-async"; // Assuming you have a utility to catch async errors
import plaidService from "../services/plaid.service"; // Import the Plaid service

// Controller to fetch the link token
const getToken = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const token = await plaidService.createLinkToken(); // Fetch the link token from Plaid service
  return res.json({ link_token: token });
});

// Controller to exchange the public token for an access token
const exchangePublicToken = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { public_token } = req.body; // Extract public token from the request body

  if (!public_token) {
    return res.status(400).json({ error: 'Public token is required' });
  }

  try {
    const access_token = await plaidService.exchangePublicToken(public_token); // Call Plaid service
    return res.json({ access_token });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to exchange public token', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Controller to fetch details about the item using the access token
const getItem = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { access_token } = req.body; // Extract the access token from the request body

  if (!access_token) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    const itemData = await plaidService.getItemDetails(access_token); // Call Plaid service to get item details
    return res.json({ item: itemData });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch item details', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Controller to fetch details about the item using the access token
const getAccounts = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { access_token } = req.body; // Extract the access token from the request body

  if (!access_token) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    const itemData = await plaidService.getAccounts(access_token); // Call Plaid service to get item details
    return res.json({ item: itemData });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch item details', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default {
  getToken,
  exchangePublicToken,
  getItem,
  getAccounts,
};
