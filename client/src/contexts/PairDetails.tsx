import React, { createContext, useContext, useEffect, useState } from 'react';
import { WebSocketService } from '../hooks/WebSocket';
import { Subgraph } from '../models/Token';

// Define the context type
interface PairDetailsContextType {
  pairDetails: Record<string, Subgraph.PoolData>;
  subscribeToPair: (pairName: string, callback: (pair: Subgraph.PoolData) => void) => void;
  unsubscribeFromPair: (pairName: string, callback: (pair: Subgraph.PoolData) => void) => void;
}

// Create the context
const PairDetailsContext = createContext<PairDetailsContextType | undefined>(undefined);

// Initialize the WebSocketService instance
const websocketService = new WebSocketService();

// Adjust this type if needed to match what your WebSocket service expects
type PairUpdateCallback = (pair: Subgraph.PoolData) => void;

// export const PairDetailsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [pairDetails, setPairDetails] = useState<Record<string, Subgraph.PairData>>({});

  // useEffect(() => {
  //   // Connect to WebSocket when the component is mounted
  //   websocketService.connect();
    
  //   // Handle WebSocket error
  //   websocketService.onError((error: string) => {
  //     console.error("WebSocket error:", error);
  //   });

  //   // Subscribe to all pairs
  //   const handlePairUpdate: PairUpdateCallback = (pair: Subgraph.PairData) => {
  //     setPairDetails((prev) => {
  //       const pairKey = `${pair.name}`;
  //       return {
  //         ...prev,
  //         [pairKey]: pair,
  //       };
  //     });
  //   };

  //   websocketService.subscribeToPair("all", handlePairUpdate);

  //   // Cleanup WebSocket connection on unmount
  //   return () => {
  //     websocketService.disconnect();
  //     websocketService.unsubscribeFromPair("all", handlePairUpdate);
  //   };
  // }, []);

  // // Subscribe to a specific pair by name
  // const subscribeToPair = (pairName: string, callback: (pair: Subgraph.PairData) => void) => {
  //   websocketService.subscribeToPair(pairName, callback);
  // };

  // // Unsubscribe from a specific pair by name
  // const unsubscribeFromPair = (pairName: string, callback: (pair: Subgraph.PairData) => void) => {
  //   websocketService.unsubscribeFromPair(pairName, callback);
  // };

  // return (
  //   <PairDetailsContext.Provider value={{ pairDetails, subscribeToPair, unsubscribeFromPair }}>
  //     {children}
  //   </PairDetailsContext.Provider>
  // );
// };

// Custom hook to use the context
export const usePairDetails = (): PairDetailsContextType => {
  const context = useContext(PairDetailsContext);
  if (!context) {
    throw new Error('usePairDetails must be used within a PairDetailsProvider');
  }
  return context;
};
