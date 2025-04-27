import React, { useEffect, useRef, useState } from "react";
import Chart, { TooltipItem } from "chart.js/auto";
import { CandlestickController, OhlcController, CandlestickElement, OhlcElement } from "chartjs-chart-financial";
import "chartjs-chart-financial";
import "chartjs-adapter-date-fns";
import { FaChartBar, FaChartLine, FaChartColumn } from "react-icons/fa6";
import { LuChartColumnBig, LuChartCandlestick } from "react-icons/lu";
import { Subgraph } from "../../models/Token";
import LoadingScreenDots from "../LoadingScreenDots";
import { BotConfig } from "../../models/Bot";
import { generateOHLCData, fillMissingDays, generateSafetyOrderAndProfitLines } from "./ChartUtil";

const calculatePercentChange = (currentPrice: number, previousPrice: number) => {
  if (!previousPrice) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
};

interface PairDetailsProps {
  botForm: BotConfig;
  pool: Subgraph.PoolData | undefined;
  className?: string; // Added className prop
}

const PairChart: React.FC<PairDetailsProps> = ({ botForm, pool, className }) => {
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
    chartInstanceRef.current.update();
  }, [scaleType]);

  const updateChart = () => {
    if (!chartInstanceRef.current) return;
    const ctx = chartInstanceRef.current.ctx;
    const yScale = chartInstanceRef.current.scales.y;
    const { barData } = generateOHLCData(swaps, priceType);
    if (barData.length === 0) return;
    const lastBar = barData[barData.length - 1];
    if (!lastBar || typeof lastBar.c === 'undefined') return;
    const lines = generateSafetyOrderAndProfitLines(lastBar.c, botForm);

    ctx.save();
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
    ctx.restore();

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

    const transformedLineData = lineData.map(({ x, y }) => ({
      x,
      y,
      o: 0,
      h: 0,
      l: 0,
      c: 0,
    }));

    const plugins = {
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<"line" | "candlestick">) => {
            const dataset = tooltipItem.chart.data.datasets[tooltipItem.datasetIndex].data;
            const currentIndex = tooltipItem.dataIndex;
            const currentData = dataset[currentIndex] as { o: number; h: number; l: number; c: number };

            let labels: string[] = [];
            const { o, h, l, c } = currentData;

            labels.push(`Open: ${o.toFixed(3)}`);
            labels.push(`High: ${h.toFixed(3)}`);
            labels.push(`Low: ${l.toFixed(3)}`);
            labels.push(`Close: ${c.toFixed(3)}`);

            const previousData = dataset[currentIndex - 1] as { o: number; h: number; l: number; c: number };

            if (previousData) {
              const previousClose = previousData.c;
              const percentChange = ((c - previousClose) / previousClose) * 100;
              const percentChangeFormatted = percentChange.toFixed(2);
              labels.push(`Change: ${percentChangeFormatted}%`);
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
      beforeDraw: (chart: Chart) => {
        const ctx = chart.ctx;
        const yScale = chart.scales.y;
        const lines = generateSafetyOrderAndProfitLines(filledBarData[filledBarData.length - 1].c, botForm);

        ctx.save();
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
        ctx.restore();
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
            data: transformedLineData,
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
            ticks: {
              source: "auto",
              color: "white", // Set X-axis label color to white
            },
            grid: {
              color: "rgba(200, 200, 200, 0.2)", // Set X-axis grid lines to a lighter gray
            },

            min: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).getTime(),
            max: new Date(Date.now() + 3 * 60 * 60 * 1000).getTime(),
          },
          y: {
            type: scaleType,
            ticks: {
              callback: (value) => {
                const num = Number(value);
                const decimals = num === 0 ? 0 : Math.max(0, -Math.floor(Math.log10(Math.abs(num))));
                return num.toFixed(decimals + 4);
              },
              color: "white", // Set Y-axis label color to white
            },
            border: {
              color: "rgba(200, 200, 200, 0.2)"
            },
            grid: {
              color: "rgba(200, 200, 200, 0.2)"
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
    <div > {/* Apply className prop */}
      <a href={`https://coinmarketcap.com/dexscan/ethereum/${pool?.address}`} target="_blank" rel="noopener noreferrer">
        {pool?.name.slice(4)}
      </a>
      <div className="text-gray-300">
        {percentChange !== null && (
          <div style={{ color: percentChange >= 0 ? "green" : "red" }}>
            <strong>Percent Change: {percentChange.toFixed(2)}%</strong>
          </div>
        )}
      </div>
      <div className={className}>
        {loading ? (
          <LoadingScreenDots />
        ) : (
          <canvas
            ref={chartRef}
            className={`transition-opacity duration-2000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
          ></canvas>
        )}
      </div>
    </div>
  );
};

export default PairChart;
