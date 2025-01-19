import React, { useEffect, useState } from "react";
import { Chart } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { OhlcElement, OhlcController, CandlestickElement, CandlestickController } from 'chartjs-chart-financial'
import LoadingScreenDots from "./LoadingScreenDots";
import { Subgraph } from "../models/Token";
import zoomPlugin from "chartjs-plugin-zoom"; // Import the zoom plugin
import 'chartjs-adapter-date-fns';  // Ensure that date-fns adapter is imported

interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  scales: {
    x: {
      title: {
        display: boolean;
        text: string;
        color: string;
      };
      ticks: {
        color: string;
      };
    };
    y: {
      title: {
        display: boolean;
        text: string;
        color: string;
      };
      ticks: {
        color: string;
      };
    };
  };
  plugins: {
    zoom: {
      pan: {
        enabled: boolean;
        mode: 'xy';
        speed: number;
        threshold: number;
      };
      zoom: {
        mode: 'x';
        wheel: {
          enabled: boolean;
        };
        pinch: {
          enabled: boolean;
        };
        limits: {
          y: {
            min: number;
            max: number;
          };
          y2: {
            min: number;
            max: number;
          };
        };
      };
    };
  };
}


// Register necessary chart components
ChartJS.register(...registerables, zoomPlugin, OhlcElement, OhlcController, CandlestickElement, CandlestickController);

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
  const [timeInterval, setTimeInterval] = useState<'1m' | '15m' | '1h' | '1d'>('1m'); // Type the interval explicitly

  useEffect(() => {
    if (!swapPair) return;

    const fetchSwaps = async () => {
      try {
        const response = await fetch(`/api/chain/swaps/${swapPair.id}`);
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
  }, [swapPair]);

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

  // Function to aggregate swaps based on selected time interval
  const aggregateSwapsByInterval = (swaps: Subgraph.SwapData[], interval: '1m' | '15m' | '1h' | '1d') => {
    const intervalInMinutes: { [key in '1m' | '15m' | '1h' | '1d']: number } = {
      '1m': 1,
      '15m': 15,
      '1h': 60,
      '1d': 1440,
    };

    const intervalMinutes = intervalInMinutes[interval];

    const aggregatedSwaps: { time: number; open: number; high: number; low: number; close: number }[] = [];
    let bucketStartTime: number = Math.floor(swaps[0].timestamp / (intervalMinutes * 60)) * (intervalMinutes * 60);

    let priceSum = 0;
    let count = 0;
    let low = Number.MAX_VALUE;
    let high = -Number.MAX_VALUE;

    swaps.forEach((swap) => {
      const timestampInInterval = Math.floor(swap.timestamp / (intervalMinutes * 60)) * (intervalMinutes * 60);

      if (timestampInInterval !== bucketStartTime) {
        if (count > 0) {
          aggregatedSwaps.push({
            time: bucketStartTime * 1000,  // Save timestamp in milliseconds
            open: priceSum / count,
            high,
            low,
            close: priceSum / count,
          });
        }
        bucketStartTime = timestampInInterval;
        priceSum = 0;
        count = 0;
        low = Number.MAX_VALUE;
        high = -Number.MAX_VALUE;
      }

      const { amount0In, amount1In, amount0Out, amount1Out } = swap;
      let price = 0;

      if (amount0In !== 0 && amount1Out !== 0) {
        price = amount1Out / amount0In;
      } else if (amount1In !== 0 && amount0Out !== 0) {
        price = amount1In / amount0Out;
      }

      low = Math.min(low, price);
      high = Math.max(high, price);
      priceSum += price;
      count++;
    });

    // Push the last bucket if it exists
    if (count > 0) {
      aggregatedSwaps.push({
        time: bucketStartTime * 1000,  // Save timestamp in milliseconds
        open: priceSum / count,
        high,
        low,
        close: priceSum / count,
      });
    }

    return aggregatedSwaps;
  };

  const chartOptions: ChartOptions = {
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
  

  const chartData = swaps.length > 0
    ? {
        labels: aggregateSwapsByInterval(swaps, timeInterval).map((swap) => swap.time),
        datasets: [
          {
            label: `${swapPair?.name.split(":")[1]} Price (USD)`,
            data: aggregateSwapsByInterval(swaps, timeInterval).map((swap) => ({
              x: swap.time,
              o: swap.open,
              h: swap.high,
              l: swap.low,
              c: swap.close,
            })),
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.2)",
            pointRadius: 0,
            borderWidth: 1,
            fill: false,
          },
        ],
      }
    : null;

  const handleIntervalChange = (interval: '1m' | '15m' | '1h' | '1d') => {
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
          <div className="time-interval-buttons">
            <button onClick={() => handleIntervalChange('1m')}>1m</button>
            <button onClick={() => handleIntervalChange('15m')}>15m</button>
            <button onClick={() => handleIntervalChange('1h')}>1h</button>
            <button onClick={() => handleIntervalChange('1d')}>1d</button>
          </div>

          {/* Loading or Chart */}
          {chartData ? (
            <div style={{ height: "500px" }}>
              <Chart type="candlestick" data={chartData} options={chartOptions} />
            </div>
          ) : (
            <LoadingScreenDots />
          )}
        </>
      ) : (
        <p>No pair selected</p>
      )}
    </div>
  );
};

export default PairChart;
