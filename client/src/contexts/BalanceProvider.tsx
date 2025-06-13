import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSDK } from "@metamask/sdk-react";
import { useAuth } from './AuthContext';

interface Balance {
  symbol: string;
  balance: string;
  usdValue?: string;
}

interface BalanceContextType {
  balances: Balance[];
  ethPrice: number | null;
  balancesLoaded: boolean;
  showLoadingTooltip: boolean;
  refreshBalances: () => void;
  isLoading: boolean;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const useBalances = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalances must be used within a BalanceProvider');
  }
  return context;
};

interface BalanceProviderProps {
  children: ReactNode;
}

export const BalanceProvider: React.FC<BalanceProviderProps> = ({ children }) => {
  const { sdk, connected } = useSDK();
  const { user } = useAuth();
  
  const [balances, setBalances] = useState<Balance[]>(() => {
    // Initialize from session storage
    try {
      const stored = sessionStorage.getItem('user_balances');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if data is not too old (5 minutes)
        const now = Date.now();
        if (parsed.timestamp && (now - parsed.timestamp) < 5 * 60 * 1000) {
          return parsed.balances || [];
        }
      }
    } catch (err) {
      console.error('Error loading balances from session storage:', err);
    }
    return [];
  });
  
  const [ethPrice, setEthPrice] = useState<number | null>(() => {
    // Initialize ETH price from session storage
    try {
      const stored = sessionStorage.getItem('eth_price');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if data is not too old (5 minutes)
        const now = Date.now();
        if (parsed.timestamp && (now - parsed.timestamp) < 5 * 60 * 1000) {
          return parsed.price || null;
        }
      }
    } catch (err) {
      console.error('Error loading ETH price from session storage:', err);
    }
    return null;
  });
  
  const [balancesLoaded, setBalancesLoaded] = useState(() => {
    // If we have balances from storage, consider them loaded
    try {
      const stored = sessionStorage.getItem('user_balances');
      return !!stored;
    } catch {
      return false;
    }
  });
  const [showLoadingTooltip, setShowLoadingTooltip] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch ETH price
  const fetchEthPrice = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await res.json();
      if (data.ethereum && data.ethereum.usd) {
        setEthPrice(data.ethereum.usd);
        return data.ethereum.usd;
      }
    } catch (err) {
      console.error('Error fetching ETH price:', err);
      setEthPrice(null);
    }
    return null;
  };

  // Fetch all token balances (ETH + ERC20s)
  const fetchAllBalances = async (walletId: string, currentEthPrice?: number) => {
    setIsLoading(true);
    
    // Start the timeout for loading tooltip
    const timeoutId = setTimeout(() => {
      if (!balancesLoaded) {
        setShowLoadingTooltip(true);
      }
    }, 10000); // 10 seconds
    setLoadingTimeout(timeoutId);

    try {
      const provider = sdk?.getProvider();
      if (!provider) {
        console.error("Provider not available for fetchAllBalances");
        return;
      }

      // Verify connection first
      const accounts = await provider.request({ method: "eth_accounts" }) as string[];
      if (!accounts || accounts.length === 0) {
        console.error("No accounts for fetchAllBalances");
        return;
      }

      // ETH balance
      const ethBalance = await provider.request({
        method: "eth_getBalance",
        params: [walletId, "latest"],
      }) as string;
      const ethBalanceInEth = (parseInt(ethBalance, 16) / 1e18).toFixed(4);
      
      const balancesArr: Balance[] = [{ 
        symbol: "ETH", 
        balance: ethBalanceInEth,
        usdValue: currentEthPrice ? (parseFloat(ethBalanceInEth) * currentEthPrice).toFixed(2) : undefined
      }];

      // Well-known mainnet tokens
      const tokens = [
        { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
        { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
        { symbol: "DAI",  address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
        { symbol: "WBTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
        { symbol: "UNI",  address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18 },
      ];

      // Check network ID to ensure we're on mainnet before checking tokens
      try {
        const chainId = await provider.request({ method: "eth_chainId" }) as string;
        const isMainnet = parseInt(chainId, 16) === 1;
        
        if (isMainnet) {
          // Use Promise.allSettled to handle individual token failures gracefully
          const tokenPromises = tokens.map(async (token) => {
            try {
              // First check if the contract exists by getting its code
              const code = await provider.request({
                method: "eth_getCode",
                params: [token.address, "latest"],
              }) as string;
              
              // If no code, it's not a contract
              if (code === "0x") {
                return null;
              }

              const balance = await provider.request({
                method: "eth_call",
                params: [{
                  to: token.address,
                  data: "0x70a08231000000000000000000000000" + walletId.replace("0x", "").toLowerCase()
                }, "latest"],
              }) as string;
              
              const tokenBalance = parseInt(balance, 16) / Math.pow(10, token.decimals);
              if (tokenBalance > 0.0001) { // Only include if balance is meaningful
                return { symbol: token.symbol, balance: tokenBalance.toFixed(4) };
              }
              return null;
            } catch (e) {
              console.log(`Failed to fetch ${token.symbol} balance:`, e);
              return null;
            }
          });

          const tokenResults = await Promise.allSettled(tokenPromises);
          tokenResults.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
              balancesArr.push(result.value);
            }
          });
        } else {
          console.log("Not on mainnet, skipping token balance checks. Chain ID:", chainId);
        }
      } catch (e) {
        console.log("Failed to get network info, skipping token checks:", e);
      }

      setBalances(balancesArr);
      
      // Save to sessionStorage with timestamp
      try {
        const balanceData = {
          balances: balancesArr,
          timestamp: Date.now(),
          walletId: walletId
        };
        sessionStorage.setItem('user_balances', JSON.stringify(balanceData));
        
        if (currentEthPrice) {
          const priceData = {
            price: currentEthPrice,
            timestamp: Date.now()
          };
          sessionStorage.setItem('eth_price', JSON.stringify(priceData));
        }
      } catch (err) {
        console.error('Error saving balances to session storage:', err);
      }
      
    } catch (err) {
      console.error("Error fetching all balances:", err);
      // Fallback to just ETH if everything fails
      try {
        const provider = sdk?.getProvider();
        if (provider) {
          const ethBalance = await provider.request({
            method: "eth_getBalance",
            params: [walletId, "latest"],
          }) as string;
          const ethBalanceInEth = (parseInt(ethBalance, 16) / 1e18).toFixed(4);
          const fallbackBalance = [{ 
            symbol: "ETH", 
            balance: ethBalanceInEth,
            usdValue: currentEthPrice ? (parseFloat(ethBalanceInEth) * currentEthPrice).toFixed(2) : undefined
          }];
          setBalances(fallbackBalance);
          
          // Save fallback to storage too
          try {
            const balanceData = {
              balances: fallbackBalance,
              timestamp: Date.now(),
              walletId: walletId
            };
            sessionStorage.setItem('user_balances', JSON.stringify(balanceData));
          } catch (saveErr) {
            console.error('Error saving fallback balances:', saveErr);
          }
        }
      } catch (fallbackErr) {
        console.error("Even ETH balance failed:", fallbackErr);
        setBalances([]);
        // Clear storage on failure
        try {
          sessionStorage.removeItem('user_balances');
        } catch {}
      }
    } finally {
      // Clear timeout and hide tooltip
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
      setShowLoadingTooltip(false);
      setBalancesLoaded(true);
      setIsLoading(false);
    }
  };

  const refreshBalances = async () => {
    if (user?.walletId && connected && sdk) {
      setBalancesLoaded(false);
      setShowLoadingTooltip(false);
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
      
      const currentEthPrice = await fetchEthPrice();
      await fetchAllBalances(user.walletId, currentEthPrice || undefined);
    } else {
      console.error("Cannot refresh balances: missing requirements", {
        hasUser: !!user,
        hasWalletId: !!user?.walletId,
        connected,
        hasSDK: !!sdk
      });
    }
  };

  // Initial load
  useEffect(() => {
    if (user && user.walletId && connected && sdk) {
      refreshBalances();
    }
  }, [user, connected, sdk]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [loadingTimeout]);

  // Clear storage when user changes
  useEffect(() => {
    if (user?.walletId) {
      // Check if stored data is for a different wallet
      try {
        const stored = sessionStorage.getItem('user_balances');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.walletId && parsed.walletId !== user.walletId) {
            // Different wallet, clear storage
            sessionStorage.removeItem('user_balances');
            sessionStorage.removeItem('eth_price');
            setBalances([]);
            setBalancesLoaded(false);
          }
        }
      } catch (err) {
        console.error('Error checking wallet ID in storage:', err);
      }
    }
  }, [user?.walletId]);

  const value: BalanceContextType = {
    balances,
    ethPrice,
    balancesLoaded,
    showLoadingTooltip,
    refreshBalances,
    isLoading,
  };

  return (
    <BalanceContext.Provider value={value}>
      {children}
    </BalanceContext.Provider>
  );
};
