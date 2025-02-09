import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "chartjs-chart-financial";
import { Subgraph } from "../models/Token";

interface PairDetailsProps {
  swapPair: Subgraph.PairData | undefined;
}

const PairChart2: React.FC<PairDetailsProps> = ({ swapPair }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const [swaps, setSwaps] = useState<Subgraph.SwapData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const barCount = 60; // You can adjust this based on how much data you want to display
  const initialDate = new Date();

  // Generate OHLC data from swap data
  const generateOHLCData = (swaps: Subgraph.SwapData[]) => {
    const barData: { x: number; o: number; h: number; l: number; c: number }[] = [];
    const lineData: { x: number; y: number }[] = [];
    let lastClose = 30; // Initial close price

    swaps.forEach((swap, index) => {
      const { amount0In, amount1In, amount0Out, amount1Out, timestamp } = swap;
      let price = 0;

      if (amount0In !== 0 && amount1Out !== 0) {
        price = amount1Out / amount0In;
      } else if (amount1In !== 0 && amount0Out !== 0) {
        price = amount1In / amount0Out;
      }

      const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds

      // Open, High, Low, Close calculations
      const open = lastClose;
      const high = Math.max(lastClose, price);
      const low = Math.min(lastClose, price);
      const close = price;

      barData.push({ x: date.getTime(), o: open, h: high, l: low, c: close });
      lineData.push({ x: date.getTime(), y: close });

      lastClose = close;
    });

    return { barData, lineData };
  };

  // Fetch swaps data when swapPair is available
  useEffect(() => {
    if (!swapPair) return;

    const fetchSwaps = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/chain/swaps/${swapPair.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch trades: ${response.statusText}`);
        }
        const data = await response.json();
        setSwaps(data.data); // Assuming the API returns an array of swaps in `data.data`
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        setLoading(false);
      }
    };

    fetchSwaps();
  }, [swapPair]);

  // Initialize Chart.js
  useEffect(() => {
    if (!swaps.length || !chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Generate OHLC data from the swaps data
    const { barData, lineData } = generateOHLCData(swaps);

    const newChart = new Chart(ctx, {
      type: "candlestick",
      data: {
        datasets: [
          {
            label: "CHRT - Chart.js Corporation",
            data: barData,
          },
        ],
      },
    });

    setChartInstance(newChart);
  }, [swaps]); // Re-run when swaps data changes

  // Update Chart Configurations
  const updateChart = () => {
    if (!chartInstance) return;

    const scaleType = (document.getElementById("scale-type") as HTMLSelectElement).value;
    const colorScheme = (document.getElementById("color-scheme") as HTMLSelectElement).value;
    const border = (document.getElementById("border") as HTMLSelectElement).value;
    const mixed = (document.getElementById("mixed") as HTMLSelectElement).value;

    chartInstance.options.scales!.y!.type = scaleType as "linear" | "logarithmic";

    if (border === "false") {
      (chartInstance.data.datasets[0] as any).borderColors = "rgba(0, 0, 0, 0)";
    } else {
      delete (chartInstance.data.datasets[0] as any).borderColors;
    }

    chartInstance.data.datasets[1].hidden = mixed !== "true";

    chartInstance.update();
  };

  return (
    <div>
      <h2>Sample Chart</h2>
      {loading && <p>Loading swaps...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <div style={{ width: "1000px" }}>
        <canvas ref={chartRef}></canvas>
      </div>
      <div>
        Bar Type:
        <select id="border" onChange={updateChart}>
          <option value="true" selected>
            Candlestick
          </option>
          <option value="false">OHLC</option>
        </select>
        Scale Type:
        <select id="scale-type" onChange={updateChart}>
          <option value="linear" selected>
            Linear
          </option>
          <option value="logarithmic">Logarithmic</option>
        </select>

        <button onClick={updateChart}>Update</button>
      </div>
    </div>
  );
};

export default PairChart2;
