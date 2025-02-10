import { BotConfig } from "../models/Bot";
import { Subgraph } from "../models/Token";
import Select from "react-select";

interface DropdownWithImagesProps {
    availablePairs: Record<string, Subgraph.PairData>;
    formData: BotConfig;
    onChange: (pair: string) => void;
  }

  const customStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: "#6B7280", // Tailwind's bg-gray-800
      color: "#ffffff",
      borderColor: "#4b5563", // Tailwind's gray-600
      borderRadius: "0.375rem", // Tailwind's rounded-md
      padding: "0.25rem", // Tailwind's p-2
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "#1f2937", // Tailwind's bg-gray-800
      color: "#ffffff",
      // marginLeft: "-25%", // Shift dropdown 50% to the left
      // width: "125%", // Extend width by 50%
      zIndex: 10,
    }),
    menuList: (base: any) => ({
      ...base,
      padding: 0,
      maxHeight: "200px", // Set a max height for scrollable behavior
      overflowY: "auto", // Enable vertical scrolling
      scrollbarWidth: "thin", // Firefox scrollbar
      scrollbarColor: "#374151 #1f2937", // Scrollbar track and thumb colors (Firefox)
      "&::-webkit-scrollbar": {
        width: "8px", // Scrollbar width
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#374151", // Tailwind's gray-700
        borderRadius: "4px", // Rounded scrollbar thumb
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: "#1f2937", // Tailwind's bg-gray-800
      },
    }),
    option: (base: any, { isFocused, isSelected }: any) => ({
      ...base,
      backgroundColor: isFocused
        ? "#374151" // Tailwind's bg-gray-700
        : isSelected
        ? "#111827" // Tailwind's bg-gray-900
        : "#1f2937", // Tailwind's bg-gray-800
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
  
  export const DropdownWithImages: React.FC<DropdownWithImagesProps> = ({
    availablePairs,
    formData,
    onChange,
  }) => {
    // Generate options by filtering and mapping over the `availablePairs`
    const options = Object.values(availablePairs)
      .filter((pair) => pair.network === formData.network) // Filter pairs based on the selected network
      .map((pair) => ({
        value: pair.name, // Use pair name as the value
        label: (
          <div className="flex">
            <div className="flex items-center">
              <img
                src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${pair.token0ImgId || "default"}.png`}
                alt={`${pair.name} token0 icon`}
                className="w-5 h-5 mr-2"
              />
              <span className="mr-2">{pair.name.split(":")[1] /* Extract token0 symbol */}</span>
            </div> ↔️
            <div className="flex items-center">
              <img
                src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${pair.token1ImgId || "default"}.png`}
                alt={`${pair.name} token1 icon`}
                className="w-5 h-5 mx-2"
              />
              <span>{pair.name.split(":")[2] /* Extract token1 symbol */}</span>
            </div>
          </div>
        ),
      }));
  
    return (
      <Select
        options={options}
        onChange={(selectedOption) => {
          if (selectedOption) {
            onChange(selectedOption.value); // Pass the selected pair value to the parent component
          }
        }}
        value={options.find((option) => option.value === formData.tradingPair)} // Set the current value
        // placeholder="Select a pair"
        isSearchable
        styles={customStyles} // Apply custom styles
      />
    );
  };
