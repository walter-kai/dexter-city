import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

// Create a new Plaid API client
const client = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments.sandbox, // Change to production or development as needed
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': '67416eb3d94f3d001ac3a52b', // Replace with your Plaid client ID
        'PLAID-SECRET': 'a4ed96fc9e4e0f120bc88de2472ee9', // Replace with your Plaid secret
      },
    },
  })
);

export default client;
