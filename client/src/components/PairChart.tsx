import React, { useEffect, useState } from "react";
import { Chart } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { OhlcElement, OhlcController, CandlestickElement, CandlestickController } from 'chartjs-chart-financial';
import LoadingScreenDots from "./LoadingScreenDots";
import { Pool, TickMath, nearestUsableTick } from "@uniswap/v3-sdk";
import { Token, CurrencyAmount } from "@uniswap/sdk-core";
import zoomPlugin from "chartjs-plugin-zoom"; // Import the zoom plugin
import 'chartjs-adapter-date-fns';

// Register necessary chart components
ChartJS.register(...registerables, zoomPlugin, OhlcElement, OhlcController, CandlestickElement, CandlestickController);

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
        };
      };
    };
  };
}

interface PairDetailsProps {
  tokenA: Token;
  tokenB: Token;
  fee: number; // Fee tier (500, 3000, 10000 for Uniswap)
  safetyOrdersCount: number;
  priceDeviation: number; // as a fraction (e.g., 0.04 for 4%)
  gapMultiplier: number;
}

const PairChart: React.FC<PairDetailsProps> = ({
  tokenA,
  tokenB,
  fee,
  safetyOrdersCount,
  priceDeviation,
  gapMultiplier,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [calculatedValues, setCalculatedValues] = useState<{
    currentPrice: number;
    safetyOrderPrices: number[];
  } | null>(null);
  const [timeInterval, setTimeInterval] = useState<'1m' | '15m' | '1h' | '1d'>('1m');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Example data to create a pool; you would fetch this dynamically in a real-world case
        const pool = new Pool(
          tokenA,
          tokenB,
          fee,
          "789345679854345678", // sqrtPriceX96 (example value)
          1000000, // liquidity (example value)
          200000 // tickCurrent (example value)
        );

        const currentPrice = parseFloat(pool.token0Price.toSignificant(6));
        const safetyOrderPrices: number[] = [];

        for (let i = 0; i < safetyOrdersCount; i++) {
          const deviationMultiplier = priceDeviation * Math.pow(gapMultiplier, i);
          const safetyOrderPrice =
            (safetyOrderPrices.length > 0 ? safetyOrderPrices[i - 1] : currentPrice) -
            currentPrice * deviationMultiplier;
          safetyOrderPrices.push(safetyOrderPrice);
        }

        setCalculatedValues({ currentPrice, safetyOrderPrices });
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        setLoading(false);
      }
    };

    fetchData();
  }, [tokenA, tokenB, fee, safetyOrdersCount, priceDeviation, gapMultiplier]);

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
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
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
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
        },
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: "xy",
          speed: 10,
          threshold: 10,
        },
        zoom: {
          mode: "x",
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          limits: {
            y: { min: 0, max: 100 },
          },
        },
      },
    },
  } as ChartOptions;

  return (
    <div className="text-white">
      {error ? (
        <p>Error: {error}</p>
      ) : loading ? (
        <LoadingScreenDots />
      ) : calculatedValues ? (
        <div style={{ height: "500px" }}>
          <Chart
            type="candlestick"
            data={{
              labels: Array(safetyOrdersCount).fill(""),
              datasets: [
                {
                  label: `Price for ${tokenA.symbol}/${tokenB.symbol}`,
                  data: calculatedValues.safetyOrderPrices.map((price, index) => ({
                    x: index,
                    o: price,
                    h: price * 1.02, // Example high price
                    l: price * 0.98, // Example low price
                    c: price, // Close price
                  })),
                  borderColor: "rgb(75, 192, 192)",
                  backgroundColor: "rgba(75,192,192,0.2)",
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default PairChart;
