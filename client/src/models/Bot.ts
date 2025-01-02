export interface BotForSale {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface BotConfig {
  creator: string;
  botName: string;
  tradingPair: string;
  startingBalance: string;
  initialOrderSize: string;
  priceDeviation: string;
  safetyOrders: string;
  safetyOrderMultiplier: string;
  maxTradeSize: string;
  stopLoss: string;
  takeProfit: string;
  trailingTakeProfit: string;
  maxDrawdown: string;
  orderType: "Market" | string;  // Assuming there may be other order types
  cooldownPeriod: string;
  minTradeSize: string;
  notifications: boolean;
}
