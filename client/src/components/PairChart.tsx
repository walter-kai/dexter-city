import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import LoadingScreenDots from "./LoadingScreenDots";
import { Subgraph } from "../models/Token";
import zoomPlugin from "chartjs-plugin-zoom"; // Import the zoom plugin

// Register necessary chart components
Chart.register(...registerables, zoomPlugin); // Register all components, including zoom plugin

interface PairDetailsProps {
  swapPair: Subgraph.PairData | undefined;
  safetyOrdersCount: number;
  priceDeviation: number; // as a fraction (e.g., 0.04 for 4%)
  gapMultiplier: number;
}

const PairChart: React.FC<PairDetailsProps> = ({
  swapPair,
  safetyOrdersCount,
  priceDeviation,
  gapMultiplier,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [swaps, setSwaps] = useState<Subgraph.SwapData[]>([]);
  const [calculatedValues, setCalculatedValues] = useState<{
    currentPrice: number;
    safetyOrderPrices: number[];
  } | null>(null);
  const [timeInterval, setTimeInterval] = useState<string>('1m'); // Track the selected time interval

  useEffect(() => {
    if (!swapPair) return;

    const fetchSwaps = async () => {
      try {
        // Adjust the API endpoint to include the selected time interval
        const response = await fetch(`/api/chain/swaps/${swapPair.id}?interval=${timeInterval}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch trades: ${response.statusText}`);
        }
        const data = await response.json();
        setSwaps(data.data); // Assuming the API returns an array of swaps in `data.data`
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      }
    };

    fetchSwaps();
  }, [swapPair, timeInterval]); // Fetch data when swapPair or timeInterval changes

  useEffect(() => {
    const calculateSafetyOrderPrices = () => {
      if (!swaps || swaps.length === 0) return null;

      const mostRecentPrice = swaps[swaps.length - 1].amountUSD;
      const safetyOrderPrices: number[] = [];

      for (let i = 0; i < safetyOrdersCount; i++) {
        const deviationMultiplier = priceDeviation * Math.pow(gapMultiplier, i);
        const safetyOrderPrice =
          (safetyOrderPrices.length > 0 ? safetyOrderPrices[i - 1] : mostRecentPrice) -
          mostRecentPrice * deviationMultiplier;
        safetyOrderPrices.push(safetyOrderPrice);
      }

      return {
        currentPrice: mostRecentPrice,
        safetyOrderPrices,
      };
    };

    if (swaps.length > 0) {
      const values = calculateSafetyOrderPrices();
      if (values) setCalculatedValues(values);
    }
  }, [swaps, safetyOrdersCount, priceDeviation, gapMultiplier]);

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
          color: "white",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price",
          color: "white",
        },
        ticks: {
          color: "white",
        },
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy' as 'xy',
          speed: 10,  // Adjust the panning speed
          threshold: 10,  // Minimum movement required for panning
        },
        zoom: {
          mode: 'x' as 'x', 
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          limits: {
            y: {min: 0, max: 100},
            y2: {min: -5, max: 5}
          },
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
            new Date(swap.timestamp * 1000).toLocaleTimeString("en-GB", {
              hour12: false,
            })
          ),
        datasets: [
          {
            label: `${swapPair?.name.split(":")[1]} Price (USD)`,
            data: swaps.map((swap) => {
              // Determine price for each swap based on direction
              if (swap.amount0In && swap.amount1Out) {
                // If swapping amount0 for amount1
                return swap.amount0In / swap.amount1Out;
              } else if (swap.amount1In && swap.amount0Out) {
                // If swapping amount1 for amount0
                return swap.amount1In / swap.amount0Out;
              }
              return 0; // Default case (if no price can be determined)
            }),
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.2)",
            fill: false,
          },
        ],
      }
    : null;

  const handleIntervalChange = (interval: string) => {
    setTimeInterval(interval);
  };

  return (
    <div className="text-white">
      {error ? (
        <p>Error: {error}</p>
      ) : swapPair ? (
        <>
          <h2>
            {swapPair?.name.split(":")[1]} 🔁 {swapPair?.name.split(":")[0]}
          </h2>

          {/* Time Interval Buttons */}
          <div className="flex space-x-4">
            {['1m', '15m', '1h', '1d'].map((interval) => (
              <button
                key={interval}
                className={`p-2 ${timeInterval === interval ? 'bg-blue-500' : 'bg-gray-700'} text-white`}
                onClick={() => handleIntervalChange(interval)}
              >
                {interval}
              </button>
            ))}
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
