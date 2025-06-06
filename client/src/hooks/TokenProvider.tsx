import React, { createContext, useContext, useState, useEffect } from "react";

interface TokenContextType {
  privateToken: string | null;
  publicToken: string | null;
  fetchPublicToken: () => Promise<string | null>;
  fetchPrivateToken: (authCode: string) => Promise<void>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publicToken, setPubToken] = useState<string | null>(null);
  const [privateToken, setPrivToken] = useState<string | null>(null);
  const [pubExpiration, setPubExpiration] = useState<number | null>(null);
  const [privateExpiration, setPrivExpiration] = useState<number | null>(null);

  const fetchPublicToken = async (): Promise<string | null> => {
    if (!publicToken || (pubExpiration && Date.now() > pubExpiration)) {
      try {
        const response = await fetch("/api/auth");
        const data = await response.json();
  
        if (data.access_token && data.expires_in) {
          setPubToken(data.access_token);
          setPubExpiration(Date.now() + data.expires_in * 1000); // Store expiration time
          console.log("Public token received:", data.access_token);
          return data.access_token;
        } else {
          console.error("No public token or expiration time received", data);
          return null;
        }
      } catch (error) {
        console.error("Error fetching public auth token:", error);
        return null;
      }
    }
    return publicToken; // Return current token if still valid
  };
  

  const fetchPrivateToken = async (authCode: string) => {
    if (!privateToken || (privateExpiration && Date.now() > privateExpiration)) {
      try {
        const response = await fetch(`/api/auth/private?authCode=${encodeURIComponent(authCode)}`, {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        });
  
        const data = await response.json();
  
        if (data.access_token && data.expires_in) {
          setPrivToken(data.access_token);
          setPrivExpiration(Date.now() + data.expires_in * 1000); // Store expiration time
          console.log("Private token received and set:", data.access_token);
          return data.access_token;
        } else {
          console.error("No private token or expiration time received", data);
        }
      } catch (error) {
        console.error("Error fetching private auth token:", error);
      }
    }
  };
  
  

  return (
    <TokenContext.Provider value={{ publicToken, privateToken, fetchPrivateToken, fetchPublicToken }}>
      {children}
    </TokenContext.Provider>
  );
};


export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useToken must be used within a TokenProvider");
  }
  return context;
};
