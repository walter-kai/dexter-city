import React, { useEffect, useState } from "react";
// import { useSpotPairs } from "../services/CoinMarketCap";

interface PairDetailsProps {
  tradingPair: string; // Example: "ETH/USDT"
}

const PairDetails: React.FC<PairDetailsProps> = ({ tradingPair }) => {
  const [livePrice, setLivePrice] = useState<number | null>(null);

  const [token0Symbol, token1Symbol] = tradingPair.split("/");

  // Fetch spot pairs using the custom hook
  // const { data: spotPairsData, error: spotPairsError, loading: spotPairsLoading } = useSpotPairs();

  // // Effect to find the live price based on the trading pair
  // useEffect(() => {
  //   if (spotPairsData && spotPairsData.length > 0) {
  //     const matchingPair = spotPairsData.find(
  //       (pair) =>
  //         pair.base_currency_symbol === token0Symbol && pair.quote_currency_symbol === token1Symbol
  //     );

  //     if (matchingPair) {
  //       setLivePrice(parseFloat(matchingPair.price));
  //     } else {
  //       setLivePrice(null); // No matching pair found
  //     }
  //   }
  // }, [spotPairsData, token0Symbol, token1Symbol]);

  return (
    <div className="text-white">
      {/* <h3>Live Price for {tradingPair}</h3>
      {spotPairsLoading ? (
        <p>Loading...</p>
      ) : spotPairsError ? (
        <p>Error: {spotPairsError}</p>
      ) : livePrice !== null ? (
        <p>Current Price: {livePrice} {token0Symbol}</p>
      ) : (
        <p>No data available for the trading pair.</p>
      )} */}
    </div>
  );
};

export default PairDetails;
