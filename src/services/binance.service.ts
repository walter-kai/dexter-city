import crypto from 'crypto'; // For HMAC SHA256 signature generation
import { Request, Response } from "express";

// Binance API credentials
const API_KEY: string = 'phDMYGRMJtNdHl3wdVsSfYU2q8EYBUFjMdgOOvLEU0UPPS2M6imGvo4S6WY47CrA';
const API_SECRET: string = '0zdO18SGLCi11YEcEkvHXlkRKEv9DuPwfeSUtrxBkVNoE24M32uDMldovqCmaTB1';

// Base URL for Binance Testnet
const BASE_URL = 'https://testnet.binance.vision';

class BinanceAPI {
  private apiKey: string;
  private apiSecret: string;

  constructor(apiKey: string = API_KEY, apiSecret: string = API_SECRET) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  // Generate HMAC SHA256 signature
  private generateSignature(queryString: string): string {
    return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
  }

  // Fetch server timestamp
  private async serverTimestamp(): Promise<number> {
    const url = `${BASE_URL}/api/v3/time`;
    const response = await fetch(url);
    const data = await response.json();
    return data.serverTime;
  }

  // Get account trade list
  public async getAccountTradeList(symbol: string): Promise<any> {
    const timestamp = await this.serverTimestamp();
    const params = {
      symbol,
      timestamp,
    } as Record<string, string | number>;
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const signature = this.generateSignature(queryString);
    const signedQueryString = `${queryString}&signature=${signature}`;
    
    const url = `${BASE_URL}/api/v3/myTrades?${signedQueryString}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': this.apiKey,
      },
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    return response.json();
  }

  // Get exchange information
  public async getExchangeInfo(): Promise<any> {
    const url = `${BASE_URL}/api/v3/exchangeInfo`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': this.apiKey,
      },
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    return response.json();
  }

  // Generate authorization URL
  public authorize(clientId: string, redirectUri: string, state: string = '', scope: string): string {
    const url = `https://accounts.binance.com/en/oauth/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scope)}`;
    return url;
  }
}

export default BinanceAPI;
