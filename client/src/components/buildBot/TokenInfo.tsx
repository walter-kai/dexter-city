import React, { useEffect, useState } from "react";
import { Subgraph } from "../../models/Token";
import LoadingScreenDots from "../common/LoadingScreenDots";

interface TokenInfoProps {
  tokenAddress: string;
}

const TokenInfo: React.FC<TokenInfoProps> = ({ tokenAddress }) => {
  const [tokenData, setTokenData] = useState<Subgraph.TokenDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/firebase/tokenInfo?tokenAddress=${tokenAddress}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch token info: ${response.statusText}`);
        }
        const data = await response.json();
        setTokenData(data as Subgraph.TokenDetails);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load token information.");
      } finally {
        setLoading(false);
      }
    };

    fetchTokenInfo();
  }, [tokenAddress]);

  if (loading) {
    return <LoadingScreenDots />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!tokenData) {
    return <div className="text-gray-500">No token data available.</div>;
  }

  return (
    <div className="p-4 bg-gray-800 rounded text-white">
      <h2 className="text-lg font-bold mb-2">{tokenData.name || "N/A"}</h2>
      <p><strong>Address:</strong> {tokenData.address || "N/A"}</p>
      <p><strong>Symbol:</strong> {tokenData.symbol || "N/A"}</p>
      <p><strong>Price:</strong> ${tokenData.price?.toFixed(6) || "N/A"}</p>
      <p><strong>Volume:</strong> {tokenData.volume?.toLocaleString() || "N/A"}</p>
      <p><strong>Circulating Supply:</strong> {tokenData.circulating_supply?.toLocaleString() || "N/A"}</p>
      <p><strong>Max Supply:</strong> {tokenData.max_supply?.toLocaleString() || "N/A"}</p>
      <p><strong>Total Supply:</strong> {tokenData.total_supply?.toLocaleString() || "N/A"}</p>
      <p><strong>CMC Rank:</strong> {tokenData.cmc_rank || "N/A"}</p>
      <p><strong>Date Added:</strong> {tokenData.date_added || "N/A"}</p>
      <p><strong>Platform:</strong> {tokenData.platform?.name || "N/A"} ({tokenData.platform?.symbol || "N/A"})</p>
      <p><strong>Market Cap:</strong> ${tokenData.quote?.USD?.market_cap?.toLocaleString() || "N/A"}</p>
      <p><strong>24h Volume:</strong> ${tokenData.quote?.USD?.volume_24h?.toLocaleString() || "N/A"}</p>
      <p><strong>Percent Change (24h):</strong> {tokenData.quote?.USD?.percent_change_24h?.toFixed(2) || "N/A"}%</p>
      <p><strong>Tags:</strong> {tokenData.tags?.join(", ") || "N/A"}</p>
    </div>
  );
};

export default TokenInfo;
