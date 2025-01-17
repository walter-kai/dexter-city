import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, Plugin } from "chart.js";
import "chart.js/auto"; // Automatically registers required chart.js components
import LoadingScreenDots from "./LoadingScreenDots";
import { Subgraph } from "@/models/Token";

interface PairDetailsProps {
  tradingPair: Subgraph.PairData | undefined;
  safetyOrdersCount: number;
  priceDeviation: number; // as a fraction (e.g., 0.04 for 4%)
  gapMultiplier: number;
}

const PairChart: React.FC<PairDetailsProps> = ({
  tradingPair: swapPair,
  safetyOrdersCount,
  priceDeviation,
  gapMultiplier
}) => {
  const [error, setError] = useState<string | null>(null);
  const [swaps, setSwaps] = useState<Subgraph.SwapData[]>([]); // Corrected to use the Swap interface
  const [calculatedValues, setCalculatedValues] = useState<{
    currentPrice: number;
    safetyOrderPrices: number[];
  } | null>(null);

  useEffect(() => {
    if (!swapPair) return;

    const fetchSwaps = async () => {
      try {
        const response = await fetch(
          `/api/chain/swaps?contractAddress=${swapPair.id}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch trades: ${response.statusText}`);
        }
        const data = await response.json();
        const swapList: Subgraph.SwapData[] = data.data; // Corrected to use Swap[] instead of Subgraph.SwapData[]
        setSwaps(swapList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      }
    };

    fetchSwaps();
  }, [swapPair]);

  const calculateSafetyOrderPrices = () => {
    if (!swaps || swaps.length === 0) return null;

    const mostRecentPrice = swaps[swaps.length - 1].amountUSD; // Assuming amountUSD as the price for simplicity
    const safetyOrderPrices: number[] = [];

    for (let i = 0; i < safetyOrdersCount; i++) {
      const deviationMultiplier = priceDeviation * Math.pow(gapMultiplier, i);
      const safetyOrderPrice = (safetyOrderPrices.length > 0 ? safetyOrderPrices[i - 1] : mostRecentPrice) - mostRecentPrice * deviationMultiplier / 100;
      safetyOrderPrices.push(safetyOrderPrice);
    }

    return {
      currentPrice: mostRecentPrice,
      safetyOrderPrices,
    };
  };

  useEffect(() => {
    if (swaps.length > 0) {
      const values = calculateSafetyOrderPrices();
      if (values) setCalculatedValues(values);
    }
  }, [swaps, safetyOrdersCount, priceDeviation, gapMultiplier]);

  const safetyOrdersPlugin: Plugin = {
    id: "safetyOrders",
    beforeDraw(chart) {
      const ctx = chart.ctx;
      const yScale = chart.scales.y;
  
      if (!ctx || !yScale || !calculatedValues) return;
  
      const { currentPrice, safetyOrderPrices } = calculatedValues;
  
      // Clip to the chart's drawing area
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        chart.chartArea.left,
        chart.chartArea.top,
        chart.chartArea.right - chart.chartArea.left,
        chart.chartArea.bottom - chart.chartArea.top
      );
      ctx.clip();
  
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
  
      ctx.restore(); // Restore the original clipping area
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
          color: "white",
        },
        ticks: {
          color: "white", // Set label color to white for x-axis
        },
      },
      y: {
        title: {
          display: true,
          text: "Price",
          color: "white",
        },
        ticks: {
          color: "white", // Set label color to white for y-axis
        },
      },
    },
  };

  const chartData = swaps
    ? {
        labels: swaps
          .slice() 
          .reverse()
          .map((swap) =>
            new Date(swap.timestamp).toLocaleTimeString("en-GB", { hour12: false }) // Use timestamp here
          ),
        datasets: [
          {
            label: "Price",
            data: swaps.map((swap) => swap.amountUSD), // Assuming amountUSD as the price for simplicity
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.2)",
            fill: true,
          },
        ],
      }
    : null;

  return (
    <div className="text-white ">
      {/* Details for <h2>{swapPair?.base_asset_name} 🔁 {swapPair?.quote_asset_name}</h2> */}
      {error ? (
        <p>Error: {error}</p>
      ) : swapPair ? (
        <>
          <div className="grid grid-cols-3 text-xs">
            <p>
              {/* <strong>Price:</strong> {swapPair.quote[0].price}{" "}
              {swapPair.quote_asset_symbol}
            </p>
            <p>
              <strong>1h Price Change:</strong>{" "}
              {parseFloat(swapPair.quote[0].percent_change_price_1h.toPrecision(4)) * 100}%
            </p>
            <p>
              <strong>Liquidity:</strong> {swapPair.quote[0].liquidity}
            </p>
            <p>
              <strong>24h Price Change:</strong>{" "}
              {parseFloat(swapPair.quote[0].percent_change_price_24h.toPrecision(4)) * 100}%
            </p>
            <p>
              <strong>Volume (24h):</strong> {swapPair.quote[0].volume_24h}
            </p>
            <p>
              <div>
                <strong>Last Updated:</strong>{" "}
                {new Date(swapPair.last_updated).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}{" "}
                {new Date(swapPair.last_updated).toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </div> */}
            </p>
          </div>
          {swaps && chartData ? (
            <div className="h-[550px]">
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

export default PairChart;
