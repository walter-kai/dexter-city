// Import Binance MainClient
import crypto from 'crypto'; // For HMAC SHA256 signature generation

// Binance API credentials
const API_KEY: string = 'phDMYGRMJtNdHl3wdVsSfYU2q8EYBUFjMdgOOvLEU0UPPS2M6imGvo4S6WY47CrA';
const API_SECRET: string = '0zdO18SGLCi11YEcEkvHXlkRKEv9DuPwfeSUtrxBkVNoE24M32uDMldovqCmaTB1';

// Base URL for Binance Testnet
const BASE_URL = 'https://testnet.binance.vision';

// Fetch server timestamp
async function serverTimestamp(): Promise<number> {
  const url = `${BASE_URL}/api/v3/time`;
  const response = await fetch(url);
  const data = await response.json();
  return data.serverTime;
}

// Generate HMAC SHA256 signature
function generateSignature(queryString: string): string {
  return crypto.createHmac('sha256', API_SECRET).update(queryString).digest('hex');
}

// Fetch account trade list
const getAccountTradeList = async (symbol: string): Promise<any> => {
  try {
    // Add server timestamp to the request
    const timestamp = await serverTimestamp();
    const params = {
      symbol,
      timestamp,
    } as Record<string, string | number>;

    // Create query string
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    // Generate signature
    const signature = generateSignature(queryString);

    // Append signature to query string
    const signedQueryString = `${queryString}&signature=${signature}`;

    // Make the API call using fetch
    const url = `${BASE_URL}/api/v3/myTrades?${signedQueryString}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error('getAccountTradeList error: ', err);
    throw err;
  }
};

// Fetch exchange information
const getExchangeInfo = async (): Promise<any> => {
  try {
    const url = `${BASE_URL}/api/v3/exchangeInfo`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error('getExchangeInfo error: ', err);
    throw err;
  }
};

// Export functions for use in other modules
export default { getAccountTradeList, getExchangeInfo };
