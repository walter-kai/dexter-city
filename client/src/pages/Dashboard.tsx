import React, { useEffect, useState } from "react";
import LoadingScreenDots from "../components/LoadingScreenDots";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [accountTrades, setAccountTrades] = useState<any[]>([]); // Adjust type based on actual response
  const [exchangeInfo, setExchangeInfo] = useState<any>(null); // Adjust type based on actual response

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch account trades
        const tradesResponse = await fetch("/api/binance/trades?symbol=BTCUSDT"); // Example symbol, adjust as needed
        if (!tradesResponse.ok) throw new Error("Failed to fetch trades");
        const trades = await tradesResponse.json();

        // Fetch exchange info
        const exchangeResponse = await fetch("/api/binance/exchangeInfo");
        if (!exchangeResponse.ok) throw new Error("Failed to fetch exchange info");
        const exchangeData = await exchangeResponse.json();

        // Set state with fetched data
        setAccountTrades(trades);
        setExchangeInfo(exchangeData);
      } catch (error) {
        console.error("Error fetching Binance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {loading ? (
        <div className="h-[270px]">
          <LoadingScreenDots />
        </div>
      ) : (
        <div className="flex flex-col items-center animate-fadeIn">
          <div className="relative w-full">
            <div className="p-1 font-bold w-full">
              <div className="absolute h-[265px] w-full bg-gradient-to-r from-white/10 via-black/20 to-white/10 blur-sm"></div>
              <div className="px-4 py-1 text-center">
                <h1 className="text-2xl font-bold mb-4">Binance Dashboard</h1>

                {/* Account Trade List */}
                <div className="bg-white p-4 rounded shadow-md mb-4">
                  <h2 className="text-xl">Account Trade List</h2>
                  {accountTrades.length > 0 ? (
                    <ul>
                      {accountTrades.map((trade, index) => (
                        <li key={index} className="border-b py-2">
                          <p><strong>Symbol:</strong> {trade.symbol}</p>
                          <p><strong>Price:</strong> {trade.price}</p>
                          <p><strong>Quantity:</strong> {trade.qty}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No trades found.</p>
                  )}
                </div>

                {/* Exchange Info */}
                <div className="bg-white p-4 rounded shadow-md">
                  <h2 className="text-xl">Exchange Information</h2>
                  {exchangeInfo ? (
                    <div>
                      <p><strong>Timezone:</strong> {exchangeInfo.timezone}</p>
                      <p><strong>Server Time:</strong> {new Date(exchangeInfo.serverTime).toLocaleString()}</p>
                      <p><strong>Symbols:</strong> {exchangeInfo.symbols.length} available trading pairs</p>
                    </div>
                  ) : (
                    <p>No exchange info available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
