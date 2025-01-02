import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useSDK } from "@metamask/sdk-react";
import { BotConfig } from "../models/Bot";

const CreateDCABot: React.FC = () => {
  const [user, setUser] = useState<any>(null); // Adjust this based on your actual user type
  const [formData, setFormData] = useState<BotConfig>({
    creator: "", // Initialize as empty
    botName: "TestBot", // Default bot name for testing
    tradingPair: "ETH/USDT", // Default trading pair
    startingBalance: "1000", // Starting balance for testing
    initialOrderSize: "50", // Default order size for testing
    priceDeviation: "0.5", // Example deviation percentage
    safetyOrders: "8", // Example number of safety orders
    safetyOrderMultiplier: "1.2", // Example safety order multiplier
    maxTradeSize: "500", // Example max trade size
    stopLoss: "10", // Example stop loss percentage
    takeProfit: "5", // Example take profit percentage
    trailingTakeProfit: "1", // Example trailing take profit
    maxDrawdown: "20", // Example max drawdown percentage
    orderType: "Market", // Default order type
    cooldownPeriod: "60", // Example cooldown period in seconds
    minTradeSize: "10", // Example minimum trade size
    notifications: true, // Default notifications enabled
  });

  const [botNameError, setBotNameError] = useState<string | null>(null); // To store bot name availability error message
  const [formError, setFormError] = useState<string | null>(null); // To store general form error messages

  const generateLogoHash = (name: string) => {
    return `https://www.robohash.org/dexter/${btoa(name).substring(0, 8)}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle checkbox inputs specifically
    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      setFormData({
        ...formData,
        [name]: e.target.checked,
      });
    } else {
      // Handle all other input types
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure all required fields are filled
    for (const key in formData) {
      if (formData[key as keyof BotConfig] === "") {
        setFormError("Please fill in all the fields.");
        return;
      }
    }

    // Ensure the user and walletId exist
    if (!user || !user.walletId) {
      alert("User wallet ID is missing. Please log in to create a bot.");
      return;
    }

    // Check if the bot name is unique before submitting
    if (botNameError !== null) {
      setFormError("Please choose a unique bot name.");
      return;
    }

    // Add walletId to the formData
    const payload = { ...formData, creator: user.walletId };

    try {
      const response = await fetch("/api/bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error:", error);
        alert(`Failed to create bot: ${error.message || "Unknown error"}`);
        return;
      }

      const data = await response.json();
      console.log("Success:", data);
      alert("DCA Bot created successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while creating the bot.");
    }
  };

  // Check bot name availability whenever it changes
  useEffect(() => {
    const checkBotNameAvailability = async () => {
      if (formData.botName.length > 0) {
        try {
          const response = await fetch(`/api/bot?botName=${formData.botName}`);
          if (response.ok) {
            throw new Error("Bot name exists");
          }
          const data = await response.json();
          if (data.exists) {
            setBotNameError("This bot name is already in use.");
          } else {
            setBotNameError(null); // Bot name is available
          }
        } catch (error) {
          console.error(error);
          setBotNameError("Bot name is taken.");
        }
      } else {
        setBotNameError(null); // No bot name provided
      }
    };

    checkBotNameAvailability();
  }, [formData.botName]);

  useEffect(() => {
    // Check if the user is in sessionStorage
    const storedUser = sessionStorage.getItem("currentUser");
    if (storedUser && storedUser !== 'undefined') {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // Parse and set user from sessionStorage

      // Set the creator to the user's first name once the user is loaded
      setFormData((prevData) => ({
        ...prevData,
        creator: parsedUser.firstName, // Set creator to user's firstName
      }));
    }
  }, []);

  return (
    <div className="flex flex-col items-center animate-fadeIn bg-gradient-to-bl from-[#343949] to-[#7c8aaf]">
      <div className="relative w-full">
        <div className="p-4 font-bold w-full text-white">
          <h1 className="text-center text-2xl mb-4">Create a DCA Bot</h1>
          <form onSubmit={handleSubmit} className="space-y-6 bg-black/50 p-6 rounded shadow-md max-w-lg mx-auto">
            {/* General Configuration */}
            <section>
              <h2 className="text-xl mb-2">General Configuration</h2>
              <div className="space-y-2">
                <label className="block">
                  Bot Name:
                  <input
                    type="text"
                    name="botName"
                    value={formData.botName}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="Enter a unique name"
                  />
                </label>
                {botNameError && (
                  <p className="text-red-500 text-sm">{botNameError}</p>
                )}
                <img
                  src={generateLogoHash(formData.botName)}
                  alt="Generated Logo"
                  className="h-16 w-16 rounded-full mt-2"
                />
                <label className="block">
                  Exchange:
                  <input
                    type="text"
                    value="Uniswap"
                    disabled
                    className="w-full p-2 rounded bg-gray-600 text-gray-400"
                  />
                </label>
                <label className="block">
                  Trading Pair:
                  <select
                    name="tradingPair"
                    value={formData.tradingPair}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                  >
                    <option value="ETH/USDT">ETH/USDT</option>
                    <option value="BTC/USDT">BTC/USDT</option>
                    <option value="MATIC/USDT">MATIC/USDT</option>
                  </select>
                </label>
              </div>
            </section>

            {/* Initial Investment Settings */}
            <section>
              <h2 className="text-xl mb-2">Initial Investment Settings</h2>
              <div className="space-y-2">
                <label className="block">
                  Starting Balance (USDT):
                  <input
                    type="number"
                    name="startingBalance"
                    value={formData.startingBalance}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="e.g., 1000"
                  />
                </label>
                <label className="block">
                  Initial Order Size:
                  <input
                    type="number"
                    name="initialOrderSize"
                    value={formData.initialOrderSize}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="e.g., 50"
                  />
                </label>
              </div>
            </section>

            {/* Trade Parameters */}
            <section>
              <h2 className="text-xl mb-2">Trade Parameters</h2>
              <div className="space-y-2">
                <label className="block">
                  Price Deviation (%):
                  <input
                    type="number"
                    name="priceDeviation"
                    value={formData.priceDeviation}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="e.g., 0.5"
                  />
                </label>
                <label className="block">
                  Safety Orders:
                  <input
                    type="number"
                    name="safetyOrders"
                    value={formData.safetyOrders}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="e.g., 8"
                  />
                </label>
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-blue-600 text-white p-3 rounded w-full hover:bg-blue-700"
              >
                Create Bot
              </button>
            </div>

            {formError && (
              <p className="text-red-500 text-sm text-center mt-2">{formError}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDCABot;
