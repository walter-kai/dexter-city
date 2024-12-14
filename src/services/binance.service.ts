// Import Binance MainClient
import { MainClient } from 'binance';

// Binance API credentials
const API_KEY: string = 'phDMYGRMJtNdHl3wdVsSfYU2q8EYBUFjMdgOOvLEU0UPPS2M6imGvo4S6WY47CrA';
const API_SECRET: string = '0zdO18SGLCi11YEcEkvHXlkRKEv9DuPwfeSUtrxBkVNoE24M32uDMldovqCmaTB1';

// Initialize Binance client for Testnet
const client = new MainClient({
  api_key: API_KEY,
  api_secret: API_SECRET,
  baseUrl: 'https://testnet.binance.vision', // Testnet REST API base URL
});


// Fetch account trade list
const getAccountTradeList = async (symbol: string): Promise<any> => {
  try {
    const result = await client.getAccountTradeList({ symbol: symbol })
    console.log('getAccountTradeList result: ', result);
    return result;
  } catch (err) {
    console.error('getAccountTradeList error: ', err);
    throw err;
  }
};

// Fetch exchange information
const getExchangeInfo = async (): Promise<any> => {
  try {
    const result = await client.getExchangeInfo();
    // console.log('getExchangeInfo result: ', result);
    return result;
  } catch (err) {
    console.error('getExchangeInfo error: ', err);
    throw err;
  }
};

// Export functions for use in other modules
export default { getAccountTradeList, getExchangeInfo };
