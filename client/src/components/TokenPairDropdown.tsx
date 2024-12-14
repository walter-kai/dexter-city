import React, { useState, useEffect } from "react";
import LoadingScreenDots from "./LoadingScreenDots";

const TokenPairDropdown: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const [exchangeInfo, setExchangeInfo] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPairInfo, setSelectedPairInfo] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const exchangeResponse = await fetch("/api/binance/exchangeInfo");
        if (!exchangeResponse.ok) throw new Error("Failed to fetch exchange info");
        const exchangeData = await exchangeResponse.json();


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
              <div className="px-4 py-1 text-center">

                {/* Search Bar for Exchange Information */}
                <div className="bg-white p-4 rounded shadow-md mb-4">
                  <h2 className="text-xl">Search Exchange Information</h2>
                  <input
                    type="text"
                    placeholder="Search for..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full input-standard"
                    required
                  />
                  

                  {/* Display filtered pairs */}
                  {filteredPairs.length > 0 ? (
                    <ul className="max-h-60 overflow-y-auto">
                      {filteredPairs.map((pair, index) => (
                        <li
                          key={index}
                          className="cursor-pointer border-b py-2"
                          onClick={() => handlePairSelect(pair)}
                        >
                          {pair.symbol}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No matching symbols found.</p>
                  )}
                </div>

                {/* Display Selected Pair Info */}
                {selectedPairInfo && (
                  <div className="bg-white p-4 rounded shadow-md">
                    <h2 className="text-xl">Selected Pair Details</h2>
                    <p><strong>Symbol:</strong> {selectedPairInfo.symbol}</p>
                    <p><strong>Status:</strong> {selectedPairInfo.status}</p>
                    <p><strong>Base Asset:</strong> {selectedPairInfo.baseAsset}</p>
                    <p><strong>Quote Asset:</strong> {selectedPairInfo.quoteAsset}</p>
                    <p><strong>Is Spot Trading Allowed:</strong> {selectedPairInfo.isSpotTradingAllowed ? 'Yes' : 'No'}</p>
                    <p><strong>Is Margin Trading Allowed:</strong> {selectedPairInfo.isMarginTradingAllowed ? 'Yes' : 'No'}</p>
                    <p><strong>Iceberg Allowed:</strong> {selectedPairInfo.icebergAllowed ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TokenPairDropdown;
