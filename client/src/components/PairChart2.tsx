import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { CandlestickController, OhlcController, CandlestickElement, OhlcElement } from "chartjs-chart-financial";
import "chartjs-chart-financial";
import "chartjs-adapter-date-fns";
import { FaChartBar, FaChartLine, FaChartColumn } from "react-icons/fa6";
import { LuChartColumnBig, LuChartCandlestick } from "react-icons/lu";
import { Subgraph } from "@/models/Token";

interface PairDetailsProps {
  swapPair: Subgraph.PairData | undefined;
}

const PairChart2: React.FC<PairDetailsProps> = ({ swapPair }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [lineState, setLine] = useState<boolean>(false);
  const [barType, setBarType] = useState<boolean>(false);
  const [scaleType, setScaleType] = useState<"linear" | "logarithmic">("linear");
  const [swaps, setSwaps] = useState<Subgraph.SwapData[]>([]);

  const generateOHLCData = (swaps: Subgraph.SwapData[]) => {
    const barData: { x: number; o: number; h: number; l: number; c: number }[] = [];
    const lineData: { x: number; y: number }[] = [];
  
    if (swaps.length === 0) return { barData, lineData };
  
    let lastClose = swaps[0].amount0In > 0 ? swaps[0].amount1Out / swaps[0].amount0In : 30;
  
    const groupedSwaps: { [key: number]: { open?: number; high: number; low: number; close?: number } } = {};
  
    swaps.forEach((swap) => {
      const { amount0In, amount1In, amount0Out, amount1Out, timestamp } = swap;
      let price = lastClose;
  
      if (amount0In > 0 && amount1Out > 0) {
        price = amount1Out / amount0In;
      } else if (amount1In > 0 && amount0Out > 0) {
        price = amount1In / amount0Out;
      }
  
      // Normalize timestamp to 24-hour bins
      const date = new Date(timestamp * 1000);
      date.setUTCHours(0, 0, 0, 0);
      const timeKey = date.getTime(); // Group by this key
  
      if (!groupedSwaps[timeKey]) {
        groupedSwaps[timeKey] = { open: price, high: price, low: price, close: price };
      } else {
        groupedSwaps[timeKey].high = Math.max(groupedSwaps[timeKey].high, price);
        groupedSwaps[timeKey].low = Math.min(groupedSwaps[timeKey].low, price);
        groupedSwaps[timeKey].close = price;
      }
  
      lastClose = price;
    });
  
    Object.entries(groupedSwaps).forEach(([time, { open, high, low, close }]) => {
      if (open !== undefined && close !== undefined) {
        barData.push({ x: Number(time), o: close, h: high, l: low, c: open });
        lineData.push({ x: Number(time), y: close });
      }
    });
  
    return { barData, lineData };
  };
  

  useEffect(() => {
    if (!swapPair) return;

    const fetchSwaps = async () => {
      try {
        const response = await fetch(`/api/chain/swaps/${swapPair.id}`);
        if (!response.ok) throw new Error(`Failed to fetch trades: ${response.statusText}`);
        const data = await response.json();
        if (!Array.isArray(data.data)) {
          console.error("Invalid swaps data format:", data);
          return;
        }
        setSwaps(data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSwaps();
  }, [swapPair]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    Chart.register(CandlestickController, OhlcController, CandlestickElement, OhlcElement);

    const { barData, lineData } = generateOHLCData(swaps);

      // 🔹 Transform lineData to match candlestick format
      const transformedLineData = lineData.map(({ x, y }) => ({
        x,
        y,
        o: 0,
        h: 0,
        l: 0,
        c: 0,
      }));

      
    chartInstanceRef.current = new Chart(ctx, {
      type: "candlestick",
      data: {
        datasets: [
          {
            label: "OHLC Data",
            data: barData,
            borderColor: barType ? "rgba(0, 0, 0, 0)" : undefined,
          },
          {
            label: "Close Price",
            type: "line",
            data: transformedLineData,
            hidden: !lineState,
            borderColor: "red",
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: "time",
            time: {
              unit: "day",
            },
          },
          y: {
            type: scaleType,
          },
        },
      },
    });
  }, [swaps, barType, lineState, scaleType]);

  return (
    <div>
      <h1>Chart.js - Financial Chart</h1>
      <div style={{ width: "1000px" }}>
        <canvas ref={chartRef}></canvas>
      </div>
      <div className="text-white">
        <span>Bar Type:</span>
        <button onClick={() => setBarType((prev) => !prev)}>
          {barType ? <LuChartCandlestick /> : <LuChartColumnBig />}
        </button>

        <span>Scale Type:</span>
        <button onClick={() => setScaleType((prev) => (prev === "linear" ? "logarithmic" : "linear"))}>
          {scaleType === "linear" ? <FaChartLine /> : <FaChartColumn />}
        </button>

        <span>Line:</span>
        <button onClick={() => setLine((prev) => !prev)}>
          {lineState ? <FaChartLine /> : <FaChartColumn />}
        </button>
      </div>
    </div>
  );
};

export default PairChart2;
