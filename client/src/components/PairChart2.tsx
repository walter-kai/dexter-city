import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { CandlestickController, OhlcController, CandlestickElement, OhlcElement } from "chartjs-chart-financial";
import "chartjs-chart-financial";
import "chartjs-adapter-date-fns"; // Ensure the date adapter is imported
import { FaChartBar, FaBorderAll, FaBorderNone } from "react-icons/fa";
import { FaChartLine, FaChartColumn } from "react-icons/fa6";
import { LuChartColumnBig, LuChartCandlestick } from "react-icons/lu";
import { Subgraph } from "@/models/Token";


interface PairDetailsProps {
  swapPair: Subgraph.PairData | undefined;
}

const PairChart2: React.FC<PairDetailsProps> = ({ swapPair }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const [lineState, setLine] = useState<boolean>(false);
  const [barType, setBarType] = useState<boolean>(false);
  const [scaleType, setScaleType] = useState<"linear" | "logarithmic">("linear");
  const [swaps, setSwaps] = useState<Subgraph.SwapData[]>([]);

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
        // setLoading(true);
        const response = await fetch(`/api/chain/swaps/${swapPair.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch trades: ${response.statusText}`);
        }
        const data = await response.json();
        setSwaps(data.data); // Assuming the API returns an array of swaps in `data.data`
        // setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        // setLoading(false);
      }
    };

    fetchSwaps();
  }, [swapPair]);

  useEffect(() => {
    Chart.register(CandlestickController, OhlcController, CandlestickElement, OhlcElement);
  
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (!ctx) return;
  
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
  
      const newChart = new Chart(ctx, {
        type: "candlestick",
        data: {
          datasets: [
            {
              label: "CHRT - Chart.js Corporation",
              data: barData,
            },
            {
              label: "Close Price",
              type: "line",
              data: transformedLineData, // ✅ Use the transformed data
              hidden: true,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: "time", // Ensures Chart.js treats x-axis as a time scale
              time: {
                unit: "day",
              },
            },
          },
        },
      });
  
      setChartInstance(newChart);
    }
  }, []);


  useEffect(() => {

    updateChart(); // Only update the chart after the lineState state has changed
    
  }, [barType, lineState, scaleType]);
  
  

  // Update Chart Configurations
  const updateChart = () => {
    if (!chartInstance) return;
  
    // Update barType border color
    if (barType) {
      (chartInstance.data.datasets[0] as any).borderColors = "rgba(0, 0, 0, 0)";
    } else {
      delete (chartInstance.data.datasets[0] as any).borderColors;
    }
  
    // Toggle lineState visibility (whether line dataset is visible)
    chartInstance.data.datasets[1].hidden = lineState;
    chartInstance.options.scales!.y!.type = scaleType as "linear" | "logarithmic";
    // Update chart
    chartInstance.update();
  };


  return (
    <div>
      <h1>Chart.js - Financial Chart</h1>
      <div style={{ width: "1000px" }}>
        <canvas ref={chartRef}></canvas>
      </div>
      <div className="text-white">
      Bar Type:
      <button onClick={() => {
        setBarType(prevBarType => {
          const newBarType = !prevBarType;
          return newBarType;
        });
      }}>
        { barType ? (
          <LuChartCandlestick />
        ) : (
          <LuChartColumnBig />
        )}
      </button>


        Scale Type:
        <button onClick={() => {
          setScaleType(prevScaleType => {
            const newScaleType = prevScaleType === "linear" ? "logarithmic" : "linear";
            return newScaleType;
          });
        }}>
          { scaleType ? (
            <FaChartLine />
          ) : (
            <FaChartColumn />
          )}
        </button>

        Line:
        <button onClick={() => {
          setLine(prevLineState => {
            const newLineState = !prevLineState;
            return newLineState;
          });
        }}>
          { lineState ? (
            <FaChartLine />
          ) : (
            <FaChartColumn />
          )}
        </button>
      </div>
    </div>
  );
};

export default PairChart2;
function setError(arg0: string) {
  throw new Error("Function not implemented.");
}

