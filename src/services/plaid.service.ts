import { CountryCode, Products } from "plaid"; 

import plaidClient from "./plaid.client"; // Assuming your Plaid client is initialized

// Function to create the link token
const createLinkToken = async (): Promise<string> => {
  const response = await plaidClient.linkTokenCreate({
    user: {
      client_user_id: "unique-user-id", // Customize this based on the logged-in user
    },
    client_name: "Skylar", // Your app name
    products: ["auth", "transactions"] as Products[], // Specify the products you're using
    country_codes: ["CA"] as CountryCode[], // Supported countries
    language: "en", // Optional language
  });

  return response.data.link_token;
};

// Function to exchange the public token for an access token
const exchangePublicToken = async (publicToken: string): Promise<string> => {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });

  return response.data.access_token;
};

// Function to fetch item details using the access token
const getItemDetails = async (accessToken: string): Promise<any> => {
  const request = {
    access_token: accessToken, // The access token to identify the item
  };

  // Fetch the item details using Plaid's itemGet API
  const response = await plaidClient.itemGet(request);

  return response.data.item; // Return the item data (e.g., account details)
};

// Function to fetch item details using the access token
const getAccounts = async (accessToken: string): Promise<any> => {
  const request = {
    access_token: accessToken, // The access token to identify the item
  };

  // Fetch the account details using Plaid's itemGet API
  const response = await plaidClient.accountsGet(request);

  return response.data.accounts; // Return the item data (e.g., account details)
};

export default {
  createLinkToken,
  exchangePublicToken,
  getItemDetails,
  getAccounts,
};
