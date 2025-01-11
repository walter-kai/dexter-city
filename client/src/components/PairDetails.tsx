import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, Plugin } from "chart.js";
import { CoinMarketCap } from "../models/Token";
import "chart.js/auto"; // Automatically registers required chart.js components
import LoadingScreenDots from "./LoadingScreenDots";

interface PairDetailsProps {
  tradingPair: CoinMarketCap.TradingPair | undefined;
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
  const [trades, setTrades] = useState<Trade[]>([]);
  const [calculatedValues, setCalculatedValues] = useState<{
    currentPrice: number;
    safetyOrderPrices: number[];
  } | null>(null);

  const [safetyOrdersCount, setSafetyOrdersCount] = useState(8);
  const [priceDeviation, setPriceDeviation] = useState(0.04); // 4%
  const [gapMultiplier, setGapMultiplier] = useState(1.2);

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

  const calculateSafetyOrderPrices = () => {
    if (!trades || trades.length === 0) return null;

    const mostRecentPrice = trades[trades.length - 1].quote[0].price;
    const safetyOrderPrices: number[] = [];
    let lastPrice = 0;

    for (let i = 0; i < safetyOrdersCount; i++) {
      const deviationMultiplier = priceDeviation * Math.pow(gapMultiplier, i);
      const safetyOrderPrice = mostRecentPrice - mostRecentPrice * deviationMultiplier;
      safetyOrderPrices.push(safetyOrderPrice);
    }

    return {
      currentPrice: mostRecentPrice,
      safetyOrderPrices,
    };
  };

  useEffect(() => {
    if (trades.length > 0) {
      const values = calculateSafetyOrderPrices();
      if (values) setCalculatedValues(values);
    }
  }, [trades, safetyOrdersCount, priceDeviation, gapMultiplier]);

  const safetyOrdersPlugin: Plugin = {
    id: "safetyOrders",
    beforeDraw(chart) {
      const ctx = chart.ctx;
      const yScale = chart.scales.y;

      if (!ctx || !yScale || !calculatedValues) return;

      const { currentPrice, safetyOrderPrices } = calculatedValues;

      ctx.save();

      // Draw the current price line
      const currentPriceY = yScale.getPixelForValue(currentPrice);
      ctx.beginPath();
      ctx.setLineDash([10, 5]); // White dotted line
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.moveTo(chart.chartArea.left, currentPriceY);
      ctx.lineTo(chart.chartArea.right, currentPriceY);
      ctx.stroke();

      // Draw safety order lines
      safetyOrderPrices.forEach((price) => {
        const y = yScale.getPixelForValue(price);
        ctx.beginPath();
        ctx.setLineDash([5, 5]); // Orange dotted line
        ctx.strokeStyle = "orange";
        ctx.lineWidth = 1;
        ctx.moveTo(chart.chartArea.left, y);
        ctx.lineTo(chart.chartArea.right, y);
        ctx.stroke();
      });

      ctx.restore();
    },
  };

  useEffect(() => {
    Chart.register(safetyOrdersPlugin);
    return () => {
      Chart.unregister(safetyOrdersPlugin);
    };
  }, [calculatedValues]);

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

  const chartData = trades
    ? {
        labels: trades.map((trade) => new Date(trade.date).toLocaleTimeString()),
        datasets: [
          {
            label: "Price",
            data: trades.map((trade) => trade.quote[0].price),
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.2)",
            fill: true,
          },
        ],
      }
    : null;

  return (
    <div className="text-white ">
      Details for <h2>{tradingPair?.base_asset_name} 🔁 {tradingPair?.quote_asset_name}</h2>
      {error ? (
        <p>Error: {error}</p>
      ) : tradingPair ? (
        <>
          <div className="grid grid-cols-3 text-xs">
            <p>
              <strong>Price:</strong> {tradingPair.quote[0].price}{" "}
              {tradingPair.quote_asset_symbol}
            </p>
            <p>
              <strong>1h Price Change:</strong>{" "}
              {parseFloat(tradingPair.quote[0].percent_change_price_1h.toPrecision(4)) * 100}%
            </p>
            <p>
              <strong>Liquidity:</strong> {tradingPair.quote[0].liquidity}
            </p>
            <p>
              <strong>24h Price Change:</strong>{" "}
              {parseFloat(tradingPair.quote[0].percent_change_price_24h.toPrecision(4)) * 100}%
            </p>
            <p>
              <strong>Volume (24h):</strong> {tradingPair.quote[0].volume_24h}
            </p>
            <p>
              <div>
                <strong>Last Updated:</strong>{" "}
                {new Date(tradingPair.last_updated).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}{" "}
                {new Date(tradingPair.last_updated).toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </div>
            </p>
          </div>
          <div>
            <div className="inputs">
              <label>
                Safety Orders Count:
                <input
                  type="number"
                  className="text-black mx-2 px-2 w-16"
                  value={safetyOrdersCount}
                  onChange={(e) => setSafetyOrdersCount(parseInt(e.target.value))}
                />
              </label>
              <label>
                Price Deviation (%):
                <input
                  type="number"
                  step="0.001"
                  className="text-black mx-2 px-2 w-16"
                  value={priceDeviation}
                  onChange={(e) => setPriceDeviation(parseFloat(e.target.value))}
                />
              </label>
              <label>
                Gap Multiplier:
                <input
                  type="number"
                  step="0.1"
                  className="text-black mx-2 px-2 w-16"
                  value={gapMultiplier}
                  onChange={(e) => setGapMultiplier(parseFloat(e.target.value))}
                />
              </label>
            </div>
          </div>
          {trades && chartData ? (
            <div className="h-full">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <LoadingScreenDots />
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default PairDetails;
