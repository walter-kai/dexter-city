import React, { useState, useEffect } from "react";
import LoadingScreenDots from "../components/LoadingScreenDots";
import TokenPairDropdown from "../components/TokenPairDropdown";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [accountTrades, setAccountTrades] = useState<any[]>([]);
  const [exchangeInfo, setExchangeInfo] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPairInfo, setSelectedPairInfo] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tradesResponse = await fetch("/api/binance/trades?symbol=BTCUSDT");
        if (!tradesResponse.ok) throw new Error("Failed to fetch trades");
        const trades = await tradesResponse.json();

        const exchangeResponse = await fetch("/api/binance/exchangeInfo");
        if (!exchangeResponse.ok) throw new Error("Failed to fetch exchange info");
        const exchangeData = await exchangeResponse.json();

        setAccountTrades(trades);
        setExchangeInfo(exchangeData.data.symbols);
      } catch (error) {
        console.error("Error fetching Binance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter exchange info based on search query
  const filteredPairs = exchangeInfo.filter((pair) =>
    pair.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle selection of a trading pair
  const handlePairSelect = (pair: any) => {
    setSelectedPairInfo(pair);
    setSearchQuery(pair.symbol); // Set the search bar to the selected symbol
  };

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
                  <TokenPairDropdown />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
