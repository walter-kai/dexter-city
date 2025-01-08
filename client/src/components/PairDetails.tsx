import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { CoinMarketCap } from "../models/Token";
import "chart.js/auto"; // Automatically registers required chart.js components

interface PairDetailsProps {
  tradingPair: CoinMarketCap.TradingPair | undefined; // Example: "DGE/WETH"
}

interface Trade {
  date: string;
  type: string;
  quote: {
    price: number;
    amount_base_asset: number;
    amount_quote_asset: number;
    total: number;
    price_by_quote_asset: number;
  }[];
}

const PairDetails: React.FC<PairDetailsProps> = ({ tradingPair }) => {
  const [error, setError] = useState<string | null>(null);
  const [trades, setTrades] = useState<Trade[] | null>(null);

  useEffect(() => {
    if (!tradingPair) return;

    const fetchTrades = async () => {
      try {
        const response = await fetch(
          `/api/chain/trades?network=${tradingPair.network_slug}&contractAddress=${tradingPair.contract_address}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch trades: ${response.statusText}`);
        }
        const data = await response.json();
        const tradesList: Trade[] = data.data;
        setTrades(tradesList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      }
    };

    fetchTrades();
  }, [tradingPair]);

  // Prepare data for the line chart
  const chartData = trades
    ? {
        labels: trades.map((trade) => new Date(trade.date).toLocaleTimeString()), // Use trade dates as labels
        datasets: [
          {
            label: "Price",
            data: trades.map((trade) => trade.quote[0].price), // Use prices for data points
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.2)",
            fill: true,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price",
        },
      },
    },
  };

  return (
    <div className="text-white">
      <h3>Details for {tradingPair?.name}</h3>
      {error ? (
        <p>Error: {error}</p>
      ) : tradingPair ? (
        <div>
          <p>
            <strong>Base Asset:</strong> {tradingPair.base_asset_name} (
            {tradingPair.base_asset_symbol})
          </p>
          <p>
            <strong>Quote Asset:</strong>{" "}
            {tradingPair.quote[0].quote_asset_name} (
            {tradingPair.quote[0].quote_asset_symbol})
          </p>
          <p>
            <strong>Price:</strong> {tradingPair.quote[0].price}{" "}
            {tradingPair.quote[0].quote_asset_symbol}
          </p>
          <p>
            <strong>Volume (24h):</strong> {tradingPair.quote[0].volume_24h}
          </p>
          <p>
            <strong>Liquidity:</strong> {tradingPair.quote[0].liquidity}
          </p>
          <p>
            <strong>24h Price Change:</strong>{" "}
            {tradingPair.quote[0].percent_change_price_24h}%
          </p>
          <p>
            <strong>1h Price Change:</strong>{" "}
            {tradingPair.quote[0].percent_change_price_1h}%
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {new Date(tradingPair.lastUpdated).toLocaleString()}
          </p>

          {/* Render Line Chart */}
          {trades && chartData ? (
            <div style={{ height: "300px", width: "100%" }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <p>Loading chart...</p>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default PairDetails;
