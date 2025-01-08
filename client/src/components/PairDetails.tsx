import React, { useEffect, useState } from "react";
import { coinmarketcap } from "../models/Token";

interface PairDetailsProps {
  tradingPair: coinmarketcap.TradingPair | undefined; // Example: "DGE/WETH"
}


const PairDetails: React.FC<PairDetailsProps> = ({ tradingPair }) => {
  // const [tradingPair, setPairDetails] = useState<coinmarketcap.TradingPair | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="text-white">
      <h3>Details for {tradingPair?.name}</h3>
      {error ? (
        <p>Error: {error}</p>
      ) : tradingPair ? (
        <div>
          <p><strong>Base Asset:</strong> {tradingPair.base_asset_name} ({tradingPair.base_asset_symbol})</p>
          <p><strong>Quote Asset:</strong> {tradingPair.quote[0].quote_asset_name} ({tradingPair.quote[0].quote_asset_symbol})</p>
          <p><strong>Price:</strong> {tradingPair.quote[0].price} {tradingPair.quote[0].quote_asset_symbol}</p>
          <p><strong>Volume (24h):</strong> {tradingPair.quote[0].volume_24h}</p>
          <p><strong>Liquidity:</strong> {tradingPair.quote[0].liquidity}</p>
          <p><strong>24h Price Change:</strong> {tradingPair.quote[0].percent_change_price_24h}%</p>
          <p><strong>1h Price Change:</strong> {tradingPair.quote[0].percent_change_price_1h}%</p>
          <p><strong>Last Updated:</strong> {new Date(tradingPair.lastUpdated).toLocaleString()}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default PairDetails;
