import React, { useEffect, useRef, useState } from "react";
import Chart, { TooltipItem } from "chart.js/auto";
import { CandlestickController, OhlcController, CandlestickElement, OhlcElement } from "chartjs-chart-financial";
import "chartjs-chart-financial";
import "chartjs-adapter-date-fns";
import { FaChartBar, FaChartLine, FaChartColumn } from "react-icons/fa6";
import { LuChartColumnBig, LuChartCandlestick } from "react-icons/lu";
import { Subgraph } from "../models/Token";
import LoadingScreenDots from "./LoadingScreenDots";
import { BotConfig } from "../models/Bot";

const generateOHLCData = (swaps: Subgraph.SwapDataV3[], priceType: "tradeToken" | "USD") => {
  const barData: { x: number; o: number; h: number; l: number; c: number }[] = [];
  const lineData: { x: number; y: number }[] = [];

  if (swaps.length === 0) return { barData, lineData };

  let lastCloseNotRounded = priceType === "tradeToken" 
    ? Math.abs(swaps[0].amount1) / swaps[0].amount0 
    : swaps[0].amountUSD / Math.abs(swaps[0].amount0);
  let lastClose = Number(lastCloseNotRounded.toExponential(5));

  const groupedSwaps: { [key: number]: { open?: number; high: number; low: number; close?: number } } = {};

  swaps.forEach((swap) => {
    const { amount0, amount1, amountUSD, timestamp } = swap;
    const price = priceType === "tradeToken" 
    ? Math.abs(amount1) / Math.abs(amount0) 
    : amountUSD / Math.abs(amount0);
    const priceRounded = Number(price.toExponential(5));

    // Normalize timestamp to 24-hour bins
    const date = new Date(timestamp * 1000);
    date.setUTCHours(0, 0, 0, 0);
    const timeKey = date.getTime(); // Group by this key

    if (!groupedSwaps[timeKey]) {
      groupedSwaps[timeKey] = { open: priceRounded, high: priceRounded, low: priceRounded, close: priceRounded };
    } else {
      groupedSwaps[timeKey].high = Math.max(groupedSwaps[timeKey].high, priceRounded);
      groupedSwaps[timeKey].low = Math.min(groupedSwaps[timeKey].low, priceRounded);
      groupedSwaps[timeKey].close = priceRounded;
    }

    lastClose = priceRounded;
  });

  const sortedTimes = Object.keys(groupedSwaps).map(Number).sort((a, b) => a - b);
  let previousClose = lastClose;

  for (let i = 0; i < sortedTimes.length; i++) {
    const time = sortedTimes[i];
    const { open, high, low, close } = groupedSwaps[time];

    if (open !== undefined && close !== undefined) {
      barData.push({ x: time, o: open, h: high, l: low, c: close });
      lineData.push({ x: time, y: close });
      previousClose = close;
    }

    // Fill missing days
    if (i < sortedTimes.length - 1) {
      let nextTime = sortedTimes[i + 1];
      let currentDate = new Date(time);
      let nextDate = new Date(nextTime);

      while (currentDate.getTime() + 86400000 < nextDate.getTime()) {
        currentDate = new Date(currentDate.getTime() + 86400000);
        barData.push({
          x: currentDate.getTime(),
          o: previousClose,
          h: previousClose,
          l: previousClose,
          c: previousClose,
        });
        lineData.push({ x: currentDate.getTime(), y: previousClose });
      }
    }
  }

  return { barData, lineData };
};

const fillMissingDays = (barData: { x: number; o: number; h: number; l: number; c: number }[]) => {
  if (barData.length === 0) return barData;

  const filledData = [];
  let previousBar = barData[0];
  filledData.push(previousBar);

  for (let i = 1; i < barData.length; i++) {
    const currentBar = barData[i];
    let previousDate = new Date(previousBar.x);
    let currentDate = new Date(currentBar.x);

    // Fill missing days
    while (previousDate.getTime() + 86400000 < currentDate.getTime()) {
      previousDate = new Date(previousDate.getTime() + 86400000);
      filledData.push({
        x: previousDate.getTime(),
        o: previousBar.c,
        h: previousBar.c,
        l: previousBar.c,
        c: previousBar.c,
      });
    }

    filledData.push(currentBar);
    previousBar = currentBar;
  }

  return filledData;
};

const generateSafetyOrderAndProfitLines = (currentPrice: number, botForm: BotConfig) => {
  const lines: { price: number; color: string; dash: number[] }[] = [];
  let safetyOrderPrice = currentPrice * (1 - botForm.priceDeviation);
  let safetyOrderGap = botForm.safetyOrderGapMultiplier;

  // Generate safety order lines
  for (let i = 0; i < botForm.safetyOrders; i++) {
    lines.push({ price: safetyOrderPrice, color: "blue", dash: [5, 5] });
    safetyOrderPrice *= (1 - botForm.priceDeviation * safetyOrderGap);
    safetyOrderGap *= botForm.safetyOrderGapMultiplier;
  }

  // Generate take profit line
  const takeProfitPrice = currentPrice * (1 + botForm.takeProfit);
  lines.push({ price: takeProfitPrice, color: "green", dash: [10, 5] });

  // Generate current price line
  lines.push({ price: currentPrice, color: "black", dash: [5, 5] });

  return lines;
};

const calculatePercentChange = (currentPrice: number, previousPrice: number) => {
  if (!previousPrice) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
};

interface PairDetailsProps {
  // swapPair: Subgraph.PoolData | undefined;
  botForm: BotConfig;
  pool: Subgraph.PoolData | undefined;
}

const PairChart2: React.FC<PairDetailsProps> = ({ botForm, pool }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lineState, setLine] = useState<boolean>(false);
  const [barType, setBarType] = useState<boolean>(false);
  const [scaleType, setScaleType] = useState<"linear" | "logarithmic">("linear");
  const [swaps, setSwaps] = useState<Subgraph.SwapDataV3[]>([]);
  const [percentChange, setPercentChange] = useState<number | null>(null);
  const [fadeIn, setFadeIn] = useState<boolean>(false);
  const [priceType, setPriceType] = useState<"tradeToken" | "USD">("tradeToken");

  useEffect(() => {
    if (!pool) return;

    const fetchSwaps = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/chain/uni/swaps/${pool.address}`);
        if (!response.ok) throw new Error(`Failed to fetch trades: ${response.statusText}`);
        const data = await response.json();
        if (!Array.isArray(data.data)) {
          console.error("Invalid swaps data format:", data);
          return;
        }
        setSwaps(data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSwaps();
  }, [pool]);

  useEffect(() => {
    if (!chartInstanceRef.current) return;
    if (barType) {
      (chartInstanceRef.current.data.datasets[0] as any).borderColors = "rgba(0, 0, 0, 0)";
    } else {
      delete (chartInstanceRef.current.data.datasets[0] as any).borderColors;
    }
    chartInstanceRef.current.update();
  }, [barType]);

  useEffect(() => {
    if (!chartInstanceRef.current) return;
    chartInstanceRef.current.data.datasets[1].hidden = !lineState;
    chartInstanceRef.current.update();
  }, [lineState]);

  useEffect(() => {
    if (!chartInstanceRef.current) return;
    chartInstanceRef.current.options.scales!.y!.type = scaleType as "linear" | "logarithmic";
    // Update chart
    chartInstanceRef.current.update();
  }, [scaleType]);

  const updateChart = () => {
    if (!chartInstanceRef.current) return;
    const ctx = chartInstanceRef.current.ctx;
    const yScale = chartInstanceRef.current.scales.y;
    const { barData } = generateOHLCData(swaps, priceType);
    if (barData.length === 0) return; // Ensure barData is not empty
    const lastBar = barData[barData.length - 1];
    if (!lastBar || typeof lastBar.c === 'undefined') return; // Ensure lastBar and lastBar.c are defined
    const lines = generateSafetyOrderAndProfitLines(lastBar.c, botForm);

    ctx.save(); // Save context before drawing
    lines.forEach(({ price, color, dash }) => {
      if (price >= yScale.min && price <= yScale.max) {
        const y = yScale.getPixelForValue(price);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash(dash);
        ctx.beginPath();
        ctx.moveTo(chartInstanceRef.current!.chartArea.left, y);
        ctx.lineTo(chartInstanceRef.current!.chartArea.right, y);
        ctx.stroke();
      }
    });
    ctx.restore(); // Restore context after drawing

    chartInstanceRef.current.update();
  };

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    Chart.register(CandlestickController, OhlcController, CandlestickElement, OhlcElement);

    const { barData, lineData } = generateOHLCData(swaps, priceType);
    const filledBarData = fillMissingDays(barData);

    // 🔹 Transform lineData to match candlestick format
    const transformedLineData = lineData.map(({ x, y }) => ({
      x,
      y,
      o: 0,
      h: 0,
      l: 0,
      c: 0,
    }));

    const plugins = {
      // Keep your existing tooltip configuration:
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<"line" | "candlestick">) => {
            const dataset = tooltipItem.chart.data.datasets[tooltipItem.datasetIndex].data;
            const currentIndex = tooltipItem.dataIndex;
            const currentData = dataset[currentIndex] as { o: number; h: number; l: number; c: number };

            let labels: string[] = [];
            const currentClose = currentData.c;

            // Get previous data point if available
            const previousData = dataset[currentIndex - 1] as { o: number; h: number; l: number; c: number };

            if (previousData) {
              const previousClose = previousData.c;
              const percentChange = ((currentClose - previousClose) / previousClose) * 100;
              const percentChangeFormatted = percentChange.toFixed(2);
              const percentColor = percentChange > 0 ? "green" : "red";

              labels.push(`Price: ${currentClose.toExponential(5)} (${percentChangeFormatted}%)`);
            } else {
              labels.push(`Price: ${currentClose.toExponential(5)}`);
            }

            return labels;
          },
        },
        displayColors: false,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: 'white',
        caretSize: 5,
      },
      legend: {
        display: false,
      },
      // The improved beforeDraw hook:
      beforeDraw: (chart: Chart) => {
        const ctx = chart.ctx;
        const yScale = chart.scales.y;
        const lines = generateSafetyOrderAndProfitLines(filledBarData[filledBarData.length - 1].c, botForm);

        ctx.save(); // Save context before drawing
        lines.forEach(({ price, color, dash }) => {
          if (price >= yScale.min && price <= yScale.max) {
            const y = yScale.getPixelForValue(price);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.setLineDash(dash);
            ctx.beginPath();
            ctx.moveTo(chart.chartArea.left, y);
            ctx.lineTo(chart.chartArea.right, y);
            ctx.stroke();
          }
        });
        ctx.restore(); // Restore context after drawing
      },
    };

    chartInstanceRef.current = new Chart(ctx, {
      type: "candlestick",
      data: {
        datasets: [
          {
            label: "OHLC Data",
            data: filledBarData,
            borderColor: barType ? "rgba(0, 0, 0, 0)" : undefined,
          },
          {
            label: "Close Price",
            type: "line",
            data: transformedLineData,  // Use the correct data format for line chart
            hidden: !lineState,
            borderColor: "red",
          },
        ],
      },
      options: {
        interaction: {
          axis: "xy",
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: "day",
            },
          },
          y: {
            type: scaleType,
            ticks: {
              callback: (value) => Number(value).toExponential(5), // Formats Y-axis labels to 5 decimal places
            },
          },
        },
        plugins: plugins,
      },
    });
    setFadeIn(true);
    chartInstanceRef.current.update();
  }, [swaps, barType, lineState, scaleType, botForm.priceDeviation, botForm.safetyOrderGapMultiplier, botForm.takeProfit, botForm.safetyOrders, botForm, priceType]);

  useEffect(() => {
    updateChart();
  }, [botForm]);

  return (
    <div>
      <a href={`https://coinmarketcap.com/dexscan/ethereum/${pool?.address}`} target="_blank" rel="noopener noreferrer">
      {pool?.name.slice(4)}
      </a>
      <div className="text-gray-300">
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

        <span>Price Type:</span>
        <button onClick={() => setPriceType("tradeToken")} className={`${priceType === "USD" ? "" : "text-teal-200"}`}>
          {pool?.name.split(':')[2]}
        </button>
        <button onClick={() => setPriceType("USD")} className={`${priceType === "USD" ? "text-teal-200" : ""}`}>
          USD
        </button>

        {percentChange !== null && (
          <div style={{ color: percentChange >= 0 ? "green" : "red" }}>
            <strong>Percent Change: {percentChange.toFixed(2)}%</strong>
          </div>
        )}
      </div>
      <div style={{ width: "1000px" }}>
        { loading ? ( 
          <LoadingScreenDots />
        ) : (
          <canvas
            ref={chartRef}
            className={`transition-opacity duration-2000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
          ></canvas>
        ) }
      </div>
    </div>
  );
};

export default PairChart2;
