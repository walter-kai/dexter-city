import React, { createContext, useContext, useEffect, useState } from 'react';
import { WebSocketService } from '../services/WebSocket';
import { CoinMarketCap } from '../models/Token';

// Define the context type
interface PairDetailsContextType {
  pairDetails: Record<string, CoinMarketCap.TradingPair>;
  subscribeToPair: (pairName: string, callback: (pair: CoinMarketCap.TradingPair) => void) => void;
  unsubscribeFromPair: (pairName: string, callback: (pair: CoinMarketCap.TradingPair) => void) => void;
  availablePairs: CoinMarketCap.TradingPair[];
}

// Create the context
const PairDetailsContext = createContext<PairDetailsContextType | undefined>(undefined);

// Initialize the WebSocketService instance
const websocketService = new WebSocketService();

// In PairDetailsContext
export const PairDetailsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pairDetails, setPairDetails] = useState<Record<string, CoinMarketCap.TradingPair>>({});

  useEffect(() => {
    // Connect to WebSocket when the component is mounted
    websocketService.connect();
    websocketService.onError((error: string) => {
      console.error("WebSocket error:", error);
    });

    // Subscribe to "all" pairs initially
    websocketService.subscribeToPair("all", (pair) => {
      setPairDetails((prev) => ({
        ...prev,
        [pair.name]: pair,
      }));
    });

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Subscribe to a specific pair by name
  const subscribeToPair = (pairName: string, callback: (pair: CoinMarketCap.TradingPair) => void) => {
    websocketService.subscribeToPair(pairName, callback);
  };

  // Unsubscribe from a specific pair by name
  const unsubscribeFromPair = (pairName: string, callback: (pair: CoinMarketCap.TradingPair) => void) => {
    websocketService.unsubscribeFromPair(pairName, callback);
  };

  // Expose available pairs as part of the context
  const availablePairs = Object.values(pairDetails); // This returns an array of all trading pairs

  return (
    <PairDetailsContext.Provider value={{ pairDetails, subscribeToPair, unsubscribeFromPair, availablePairs }}>
      {children}
    </PairDetailsContext.Provider>
  );
};

// Custom hook to use the context
export const usePairDetails = (): PairDetailsContextType => {
  const context = useContext(PairDetailsContext);
  if (!context) {
    throw new Error('usePairDetails must be used within a PairDetailsProvider');
  }
  return context;
};
