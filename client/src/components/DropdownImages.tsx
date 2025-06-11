import { useEffect, useState } from "react";
import Select from "react-select";
import { BotConfig } from "../models/Bot";
import { Subgraph } from "../models/Token";
import LoadingScreenDots from "./common/LoadingScreenDots";

interface DropdownWithImagesProps {
  formData: BotConfig;
  onChange: (pairData: Subgraph.PoolData) => void; // Passes the full pair object
}

const customStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: "#6B7280",
    color: "#ffffff",
    borderColor: "#4b5563",
    borderRadius: "0.375rem",
    padding: "0.25rem",
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: "#1f2937",
    color: "#ffffff",
    zIndex: 10,
  }),
  menuList: (base: any) => ({
    ...base,
    padding: 0,
    maxHeight: "200px",
    overflowY: "auto",
    scrollbarWidth: "thin",
    scrollbarColor: "#374151 #1f2937",
    "&::-webkit-scrollbar": { width: "8px" },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#374151",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-track": { backgroundColor: "#1f2937" },
  }),
  option: (base: any, { isFocused, isSelected }: any) => ({
    ...base,
    backgroundColor: isFocused
      ? "#374151"
      : isSelected
      ? "#111827"
      : "#1f2937",
    color: "#ffffff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#ffffff",
  }),
};

export const DropdownWithImagesV2: React.FC<DropdownWithImagesProps> = ({
  formData,
  onChange,
}) => {
  const [availablePairs, setAvailablePairs] = useState<Record<
    string,
    Subgraph.PairData
  > | null>(null);

  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const response = await fetch("/api/chain/uni/pairs");
        const data = await response.json();
        console.log("Fetched pairs:", data); // Debugging: Log the API response
        setAvailablePairs(data);
      } catch (error) {
        console.error("Error fetching pairs:", error);
      }
    };
  
    fetchPairs();
  }, []);
  
  if (!availablePairs) return <p>Loading pairs...</p>;
  
  // Debugging: Check if availablePairs is structured correctly
  console.log("Available Pairs:", availablePairs);
  
  const options = Object.values(availablePairs)
  .filter((pair) => pair?.name?.includes(";")) // Ensure valid pair names
  .map((pair) => {
    const [token0Symbol, token1Symbol] = pair.name.split(";"); // Extract symbols

    return {
      value: pair.name,
      label: (
        <div className="flex">
          <div className="flex items-center">
            <img
              src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${pair.token0.imgId || "default"}.png`}
              alt={`${token0Symbol} icon`}
              className="w-5 h-5 mr-2"
            />
            <span className="mr-2">{token0Symbol}</span>
          </div>{" "}
          ↔️
          <div className="flex items-center">
            <img
              src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${pair.token1.imgId || "default"}.png`}
              alt={`${token1Symbol} icon`}
              className="w-5 h-5 mx-2"
            />
            <span>{token1Symbol}</span>
          </div>
        </div>
      ),
      pairData: pair, // Store the full pairData object
    };
  });

console.log("Options:", options); // Debugging: Ensure this is populated

  return (
    <Select
      options={options}
      onChange={(selectedOption: any) => {
        if (selectedOption) {
          console.log("Selected pair data:", selectedOption.pairData); // Debugging
          onChange(selectedOption.pairData); // Pass full pairData object
        }
      }}
      value={options.find((option) => option.value === formData.tradingPool)}
      isSearchable
      styles={customStyles}
    />
  );
};


export const DropdownWithImagesV3: React.FC<DropdownWithImagesProps> = ({
  formData,
  onChange,
}) => {
  const [availablePools, setAvailablePools] = useState<Subgraph.PoolData[] | null>(null);

  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const response = await fetch("/api/chain/uni/pools");
        if (!response.ok) throw new Error("Failed to fetch pools");
        
        const data = await response.json();
        console.log("Fetched pools:", data); // Debug: Log the API response
        
        setAvailablePools(data.pools);
      } catch (error) {
        console.error("Error fetching pools:", error);
      }
    };

    fetchPairs();
  }, []);

  if (!availablePools) return <LoadingScreenDots />;

  const options = availablePools
    .map((pool) => {

      return {
        value: pool.name,
        label: (
          <div className="flex">
            <div className="flex items-center">
              <img
                src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${pool.token0.imgId || "default"}.png`}
                alt={`${pool.token0.symbol} icon`}
                className="w-5 h-5 mr-2"
              />
              <span className="mr-2">{pool.token0.symbol}</span>
            </div>
            <div className="flex items-center">
              <img
                src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${pool.token1.imgId || "default"}.png`}
                alt={`${pool.token1.symbol} icon`}
                className="w-5 h-5 mx-2"
              />
              <span>{pool.token1.symbol}</span>
            </div>
          </div>
        ),
        poolData: pool, // Store the full pairData object
      };
    });

  console.log("Dropdown Options:", options); // Debug: Check dropdown options

  return (
    <Select
      options={options}
      onChange={(selectedOption: any) => {
        if (selectedOption) {
          onChange(selectedOption.poolData); // Pass full pairData object
        }
      }}
      value={options.find((option) => option.value === formData.tradingPool)}
      isSearchable
      styles={customStyles}
    />
  );
};
