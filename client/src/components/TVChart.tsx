import React, { useEffect } from "react";
import { UniswapTradingview, Dex } from "uniswap-tradingview";

const UniswapChart: React.FC = () => {
  useEffect(() => {
    const initializeChart = async () => {
      try {
        const chart = new UniswapTradingview({ dex: Dex.UNISWAP });
        const pairAddress = "0xc8e78ad2573f5e16a286443aea2a6f1ba0c06b96";

        await chart.createChart(
          "uniswap_tradingview_chart",
          { width: 400, height: 300 },
          pairAddress,
          "1m", // Interval: 1-minute candles
          "LINE" // Chart type: LINE
        );
      } catch (error) {
        console.error("Error initializing the Uniswap TradingView chart:", error);
      }
    };

    initializeChart();
  }, []);

  return (
    <div>
      <div id="uniswap_tradingview_chart" style={{ width: "400px", height: "300px" }}></div>
    </div>
  );
};

export default UniswapChart;
