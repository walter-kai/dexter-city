import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { CandlestickController, OhlcController, CandlestickElement, OhlcElement } from "chartjs-chart-financial";
import "chartjs-chart-financial";
import "chartjs-adapter-date-fns"; // Ensure the date adapter is imported
import { FaChartBar, FaBorderAll, FaBorderNone } from "react-icons/fa";
import { FaChartLine, FaChartColumn } from "react-icons/fa6";
import { LuChartColumnBig, LuChartCandlestick } from "react-icons/lu";



const RandomChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const [lineState, setLine] = useState<boolean>(false);
  const [barType, setBarType] = useState<boolean>(false);
  const [scaleType, setScaleType] = useState<"linear" | "logarithmic">("linear");

  const barCount = 60;
  const initialDate = new Date();

  // Generate random OHLC data using native Date methods
  function generateRandomData() {
    const barData = [];
    const lineData = [];
    let date = new Date(initialDate);
    let lastClose = 30; // Initial close price

    for (let i = 0; i < barCount; ) {
      date.setDate(date.getDate() + 1);

      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const open = +(lastClose * (0.95 + Math.random() * 0.1)).toFixed(2);
        const close = +(open * (0.95 + Math.random() * 0.1)).toFixed(2);
        const high = +(Math.max(open, close) * (1 + Math.random() * 0.1)).toFixed(2);
        const low = +(Math.min(open, close) * (1 - Math.random() * 0.1)).toFixed(2);

        barData.push({ x: date.getTime(), o: open, h: high, l: low, c: close });
        lineData.push({ x: date.getTime(), y: close });

        lastClose = close;
        i++;
      }
    }

    return { barData, lineData };
  }

  useEffect(() => {
    Chart.register(CandlestickController, OhlcController, CandlestickElement, OhlcElement);
  
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (!ctx) return;
  
      const { barData, lineData } = generateRandomData();
  
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
  

  // Randomize Data
  const randomizeData = () => {
    if (!chartInstance) return;

    const { barData, lineData } = generateRandomData();
    chartInstance.data.datasets[0].data = barData;
    chartInstance.data.datasets[1].data = lineData;
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


        <button onClick={randomizeData}>Randomize Data</button>
      </div>
    </div>
  );
};

export default RandomChart;
