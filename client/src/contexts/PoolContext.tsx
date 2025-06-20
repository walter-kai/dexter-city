import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PoolData } from '../models/subgraph/Pools';

interface PoolContextType {
  availablePools: PoolData[] | null;
  loading: boolean;
}

const PoolContext = createContext<PoolContextType>({
  availablePools: null,
  loading: true
});

export const usePools = () => useContext(PoolContext);

export const PoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [availablePools, setAvailablePools] = useState<PoolData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/chain/uni/pools");
        if (!response.ok) throw new Error("Failed to fetch pools");
        const data = await response.json();
        setAvailablePools(data.pools);
      } catch (error) {
        console.error("Error fetching pools:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPools();
  }, []);

  return (
    <PoolContext.Provider value={{ availablePools, loading }}>
      {children}
    </PoolContext.Provider>
  );
};
