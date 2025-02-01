import { useEffect, useState } from "react";
import { LivePriceFetcher } from "../services/EthereumRPC";

interface LivePriceProps {
  selectedPair: string; // The pair contract address
}

const LivePrice: React.FC<LivePriceProps> = ({ selectedPair }) => {
  const [price, setPrice] = useState<number | null>(null);
  const [observations, setObservations] = useState<{ tick: string; price: number }[]>([]);
  const [poolAddress, setPoolAddress] = useState<string | null>(null);
  const [timeAgo, setTimeAgo] = useState<Date>(new Date()); // Store as Date object
  const [tickInterval, setTickInterval] = useState<number>(10);

  // Fetch pool data when selectedPair changes
  useEffect(() => {
    if (!selectedPair) return;

    const fetchPoolData = async () => {
      try {
        const response = await fetch(`/api/chain/pools/${selectedPair}`);
        const data = await response.json();
        const poolId = data?.pools?.[0]?.id;

        if (poolId) {
          setPoolAddress(poolId);
        } else {
          console.error("Pool ID not found");
        }
      } catch (error) {
        console.error("Error fetching pool data:", error);
      }
    };

    fetchPoolData();
  }, [selectedPair]);

  // Start listening for price updates when poolAddress is available
  useEffect(() => {
    if (!poolAddress) return;

    const fetcher = new LivePriceFetcher(
      { poolAddress, timeAgo, tickInterval },
      (newPrice, newObservations) => {
        setPrice(newPrice);
        setObservations(newObservations);
      }
    );

    fetcher.startListening();

    return () => {
      fetcher.stopListening();
    };
  }, [poolAddress, timeAgo, tickInterval]);

  return (
    <div>
      <h2>Live Price</h2>
      <p>Current Price: {price !== null ? price.toFixed(6) : "Loading..."}</p>

      <div>
        <label>Time Ago:</label>
        <input
          type="datetime-local"
          value={timeAgo.toISOString().slice(0, 16)} // Format for input
          onChange={(e) => setTimeAgo(new Date(e.target.value))}
          className="border p-1 mx-2"
        />
      </div>

      <div>
        <label>Tick Interval (seconds):</label>
        <input
          type="number"
          value={tickInterval}
          onChange={(e) => setTickInterval(Number(e.target.value))}
          className="border p-1 mx-2"
        />
      </div>

      <h3>Observations</h3>
      <ul>
        {observations.map((obs, index) => (
          <li key={index}>
            Tick: {obs.tick}, Price: {obs.price.toFixed(6)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LivePrice;
