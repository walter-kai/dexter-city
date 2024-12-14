import React, { useState, useEffect } from "react";
import LoadingScreenDots from "../components/LoadingScreenDots"; // Assuming this component exists

const AccountTradeList: React.FC = () => {
  const [accountTrades, setAccountTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Track loading state

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tradesResponse = await fetch("/api/binance/trades?symbol=BTCUSDT");
        if (!tradesResponse.ok) throw new Error("Failed to fetch trades");
        const trades = await tradesResponse.json();

        setAccountTrades(trades.data);
      } catch (error) {
        console.error("Error fetching Binance data:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="h-[270px] flex justify-center items-center">
        <LoadingScreenDots /> {/* Display the loading dots */}
    </div>
  )

  return (
    <div className="bg-white p-4 rounded shadow-md mb-4">
      <h2 className="text-xl mb-2">Account Trade List</h2>

      { accountTrades.length > 0 ? (
        <ul className="space-y-2">
          {accountTrades.map((trade, index) => (
            <li
              key={index}
              className="flex justify-between items-center border-b py-2 text-sm"
            >
              <span className="font-medium">{formatDate(trade.time)}</span>
              <span className="font-semibold text-blue-500">
                {trade.symbol}
              </span>
              <span>
                Amount: <span className="font-semibold">{trade.quoteQty}</span>
              </span>
              <span>
                Price: <span className="font-semibold">{trade.price}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No trades found.</p>
      )}
    </div>
  );
};

export default AccountTradeList;
