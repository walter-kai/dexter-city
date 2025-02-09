import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { CandlestickController, OhlcController, CandlestickElement, OhlcElement } from "chartjs-chart-financial";
import "chartjs-chart-financial";
import "chartjs-adapter-date-fns"; // Ensure the date adapter is imported



const RandomChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

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
  
  

  // Update Chart Configurations
  const updateChart = () => {
    if (!chartInstance) return;

    // const type = (document.getElementById("type") as HTMLSelectElement).value;
    const scaleType = (document.getElementById("scale-type") as HTMLSelectElement).value;
    // const colorScheme = (document.getElementById("color-scheme") as HTMLSelectElement).value;
    const border = (document.getElementById("border") as HTMLSelectElement).value;
    const mixed = (document.getElementById("mixed") as HTMLSelectElement).value;

    // chartInstance.config.type = type;
    chartInstance.options.scales!.y!.type = scaleType as "linear" | "logarithmic";

    // Apply color scheme
    // if (colorScheme === "neon") {
    //   (chartInstance.data.datasets[0] as any).backgroundColors = {
    //     up: "#01ff01",
    //     down: "#fe0000",
    //     unchanged: "#999",
    //   };
    // } else {
    //   delete (chartInstance.data.datasets[0] as any).backgroundColors;
    // }

    // Toggle border
    if (border === "false") {
      (chartInstance.data.datasets[0] as any).borderColors = "rgba(0, 0, 0, 0)";
    } else {
      delete (chartInstance.data.datasets[0] as any).borderColors;
    }

    // Toggle mixed charts
    chartInstance.data.datasets[1].hidden = mixed !== "true";

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
      <p>
        See the{" "}
        <a href="https://github.com/chartjs/chartjs-chart-financial/tree/master/docs">
          source for this example
        </a>
        ,{" "}
        <a href="https://github.com/chartjs/chartjs-chart-financial">README</a>, and{" "}
        <a href="https://www.chartjs.org/docs/">Chart.js docs</a> for more details.
      </p>
      <h2>Sample Chart</h2>
      <div style={{ width: "1000px" }}>
        <canvas ref={chartRef}></canvas>
      </div>
      <div className="text-white">
        Bar Type:
        <select id="border" onChange={updateChart}>
          <option value="true" selected>
            Candlestick
          </option>
          <option value="false">Bars</option>
        </select>
        Scale Type:
        <select id="scale-type" onChange={updateChart}>
          <option value="linear" selected>
            Linear
          </option>
          <option value="logarithmic">Logarithmic</option>
        </select>

        Mixed:
        <select id="mixed" onChange={updateChart}>
          <option value="true">Yes</option>
          <option value="false" selected>
            No
          </option>
        </select>
        <button onClick={updateChart}>Update</button>
        <button onClick={randomizeData}>Randomize Data</button>
      </div>
    </div>
  );
};

export default RandomChart;
