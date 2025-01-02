import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useSDK } from "@metamask/sdk-react";

const CreateDCABot: React.FC = () => {
  const [formData, setFormData] = useState({
    botName: "",
    tradingPair: "ETH/USDT",
    startingBalance: "",
    initialOrderSize: "",
    priceDeviation: "",
    safetyOrders: "",
    safetyOrderMultiplier: "",
    maxTradeSize: "",
    stopLoss: "",
    takeProfit: "",
    trailingTakeProfit: "",
    maxDrawdown: "",
    orderType: "Market",
    cooldownPeriod: "",
    minTradeSize: "",
    notifications: false,
  });

  const generateLogoHash = (name: string) => {
    return `https://www.gravatar.com/avatar/${btoa(name).substring(0, 8)}`;
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    // Handle form submission logic here
  };

  return (
    <div className="flex flex-col items-center animate-fadeIn bg-gradient-to-bl from-[#343949] to-[#7c8aaf]">
      {/* <NavBar telegramUser={null} /> */}
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
                  Number of Safety Orders:
                  <input
                    type="number"
                    name="safetyOrders"
                    value={formData.safetyOrders}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="e.g., 8"
                  />
                </label>
                <label className="block">
                  Safety Order Volume Multiplier:
                  <input
                    type="number"
                    name="safetyOrderMultiplier"
                    value={formData.safetyOrderMultiplier}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="e.g., 1.2"
                  />
                </label>
                <label className="block">
                  Max Trade Size:
                  <input
                    type="number"
                    name="maxTradeSize"
                    value={formData.maxTradeSize}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="e.g., 500"
                  />
                </label>
              </div>
            </section>

            {/* Risk Management */}
            <section>
              <h2 className="text-xl mb-2">Risk Management</h2>
              <div className="space-y-2">
                <label className="block">
                  Stop-Loss (%):
                  <input
                    type="number"
                    name="stopLoss"
                    value={formData.stopLoss}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="e.g., 10"
                  />
                </label>
                <label className="block">
                  Take-Profit (%):
                  <input
                    type="number"
                    name="takeProfit"
                    value={formData.takeProfit}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="e.g., 5"
                  />
                </label>
                <label className="block">
                  Trailing Take-Profit (%):
                  <input
                    type="number"
                    name="trailingTakeProfit"
                    value={formData.trailingTakeProfit}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="e.g., 1"
                  />
                </label>
                <label className="block">
                  Max Drawdown Limit:
                  <input
                    type="number"
                    name="maxDrawdown"
                    value={formData.maxDrawdown}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="e.g., 20"
                  />
                </label>
              </div>
            </section>

            {/* Order Settings */}
            <section>
              <h2 className="text-xl mb-2">Order Settings</h2>
              <div className="space-y-2">
                <label className="block">
                  Order Type:
                  <select
                    name="orderType"
                    value={formData.orderType}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                  >
                    <option value="Market">Market</option>
                    <option value="Limit">Limit</option>
                  </select>
                </label>
                <label className="block">
                  Cooldown Period (seconds):
                  <input
                    type="number"
                    name="cooldownPeriod"
                    value={formData.cooldownPeriod}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="e.g., 60"
                  />
                </label>
                <label className="block">
                  Minimum Trade Size:
                  <input
                    type="number"
                    name="minTradeSize"
                    value={formData.minTradeSize}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="e.g., 10"
                  />
                </label>
              </div>
            </section>

            {/* Monitoring and Alerts */}
            <section>
              <h2 className="text-xl mb-2">Monitoring and Alerts</h2>
              <div className="space-y-2">
                <label className="block flex items-center">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={formData.notifications}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Enable Notifications
                </label>
              </div>
            </section>

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
            >
              Create Bot
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDCABot;
