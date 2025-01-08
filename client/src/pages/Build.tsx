import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BotConfig } from "../models/Bot";
import websocketService from "../services/WebSocket";
import { CoinMarketCap } from "@/models/Token";

import PairDetails from "../components/PairDetails";

const BuildBot: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<BotConfig>({
    status: "Stopped",
    creatorName: "",
    creatorWalletId: "",
    botName: "",
    network: "Ethereum",
    tradingPair: "",
    triggerType: "RSA",
    orderType: "Market",
    takeProfit: 1,
    trailingTakeProfit: 0,
    cooldownPeriod: 60,
    initialOrderSize: 50,
    priceDeviation: 0.5,
    safetyOrders: 8,
    safetyOrderGapMultiplier: 1.0,
    safetyOrderSizeMultiplier: 1.0,
    notifications: true,
    createdAt: new Date(),
  });

  const [botNameError, setBotNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [availablePairs, setAvailablePairs] = useState<CoinMarketCap.TradingPair[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tradingPair, setTradingPair] = useState<CoinMarketCap.TradingPair | undefined>(undefined);

  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { botConfig } = state || {};

  useEffect(() => {
    if (botConfig) {
      setFormData(botConfig);
    }
  
    const storedUser = sessionStorage.getItem("currentUser");
    if (storedUser && storedUser !== "undefined") {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  
    checkBotNameAvailability(formData.botName);
  
    // Load available pairs
    const pairs = websocketService.getAll();
  
    if (pairs) {
      const pairsArray = Object.entries(pairs).map(([key, value]) => (value));
      setAvailablePairs(pairsArray);
    }
  }, [botConfig]);

  useEffect(() => {
    setTradingPair(availablePairs.find((pair) => pair.name === formData.tradingPair));

  }, [availablePairs, formData.tradingPair]);
  
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let updatedValue: string | boolean = value;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      updatedValue = checked.toString();
    } else if (type === "number") {
      updatedValue = value || "";
    }

    setFormData({
      ...formData,
      [name]: updatedValue,
    });

    if (name === "botName") {
      const sanitizedValue = value.trim();
      checkBotNameAvailability(sanitizedValue);
    }
  };

  const checkBotNameAvailability = async (botName: string) => {
    if (botName.length > 0) {
      try {
        const response = await fetch(`/api/bot?botName=${botName}`);
        if (response.status !== 404) {
          setBotNameError("Bot name is already taken.");
        } else {
          setBotNameError(null);
        }
      } catch (error) {
        console.error("Error checking bot name availability:", error);
        setBotNameError("Unable to verify bot name.");
      }
    } else {
      setBotNameError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const key in formData) {
      if (
        formData[key as keyof BotConfig] === "" ||
        formData[key as keyof BotConfig] === undefined
      ) {
        setFormError("Please fill in all the fields.");
        return;
      }
    }

    if (!user || !user.walletId) {
      alert("User wallet ID is missing. Please log in to create a bot.");
      return;
    }

    if (botNameError) {
      setFormError("Please choose a unique bot name.");
      return;
    }

    const payload = {
      ...formData,
      creatorName: user.firstName,
      creatorWalletId: user.walletId,
      createdAt: new Date(),
    };

    try {
      const response = await fetch("/api/bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          alert(`Bot already exists: ${errorData.botName}`);
        } else {
          alert(`Failed to create bot: ${errorData.message || "Unknown error"}`);
        }
        return;
      }

      alert("DCA Bot created successfully!");
      navigate("/dash");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while creating the bot.");
    }
  };


  return (


<div className="flex flex-col items-center bg-gradient-to-bl from-[#343949] to-[#7c8aaf] p-6">
<div className="w-full max-w-xl bg-black/50 p-6 rounded shadow-md">
  <h1 className="text-2xl text-center text-white mb-4">Create a DCA Bot</h1>
  <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
    {/* General Configuration */}
    <div className="col-span-2">
      <label className="block text-white">Bot Name:</label>
        <input
          type="text"
          name="botName"
          value={formData.botName}
          onChange={handleInputChange}
          className="w-full p-2 bg-gray-800 text-white rounded"
          placeholder="Enter a unique name"
        />
        {botNameError && <p className="text-red-500">{botNameError}</p>}
    </div>

    <div>
            <label className="block text-white">Network:</label>
            <select
              name="network"
              value={formData.network}
              onChange={handleInputChange}
              className="w-full p-2 bg-gray-800 text-white rounded"
            >
              <option value="Ethereum">Ethereum</option>
              <option value="Solana">Solana</option>
            </select>
          </div>

          <div>
  <label className="block text-white">Trading Pair:</label>
  <select
    name="tradingPair"
    value={formData.tradingPair}
    onChange={handleInputChange}
    className="w-full p-2 bg-gray-800 text-white rounded"
  >
    {availablePairs
      .filter((pair) => pair.network_slug === formData.network)
      .map((pair) => (
        <option key={pair.name} value={pair.name}>
          {pair.name}
        </option>
      ))}
  </select>
</div>


    {/* Live price display */}
    <div className="col-span-2 bg-gray-800 p-4 mt-4 rounded">
      <PairDetails tradingPair={tradingPair} />
    </div>

    {/* DCA Configuration */}
    {/* <div>
      <label className="block text-white">Take Profit (%):</label>
      <input
        type="number"
        name="takeProfit"
        value={formData.takeProfit}
        onChange={handleInputChange}
        className="w-full p-2 bg-gray-800 text-white rounded"
        step="0.1"
      />
    </div> */}

    <div>
      <label className="block text-white">Trailing Take Profit (%):</label>
      <input
        type="number"
        name="trailingTakeProfit"
        value={formData.trailingTakeProfit}
        onChange={handleInputChange}
        className="w-full p-2 bg-gray-800 text-white rounded"
        step="0.1"
      />
    </div>

    <div>
      <label className="block text-white">Price Deviation (%):</label>
      <input
        type="number"
        name="priceDeviation"
        value={formData.priceDeviation}
        onChange={handleInputChange}
        className="w-full p-2 bg-gray-800 text-white rounded"
        step="0.1"
      />
    </div>

    <div>
      <label className="block text-white">Cooldown Period (seconds):</label>
      <input
        type="number"
        name="cooldownPeriod"
        value={formData.cooldownPeriod}
        onChange={handleInputChange}
        className="w-full p-2 bg-gray-800 text-white rounded"
      />
    </div>

    <div>
      <label className="block text-white">Safety Orders:</label>
      <input
        type="number"
        name="safetyOrders"
        value={formData.safetyOrders}
        onChange={handleInputChange}
        className="w-full p-2 bg-gray-800 text-white rounded"
      />
    </div>

    <div>
      <label className="block text-white">Safety Order Gap Multiplier:</label>
      <input
        type="number"
        name="safetyOrderGapMultiplier"
        value={formData.safetyOrderGapMultiplier}
        onChange={handleInputChange}
        className="w-full p-2 bg-gray-800 text-white rounded"
        step="0.1"
      />
    </div>

    <div>
      <label className="block text-white">Safety Order Size Multiplier:</label>
      <input
        type="number"
        name="safetyOrderSizeMultiplier"
        value={formData.safetyOrderSizeMultiplier}
        onChange={handleInputChange}
        className="w-full p-2 bg-gray-800 text-white rounded"
        step="0.1"
      />
    </div>

    <div className="col-span-2 text-center mt-4">
      <button
        type="submit"
        className="bg-blue-600 text-white p-2 w-full rounded"
      >
        Create Bot
      </button>
      {formError && <p className="text-red-500 mt-2">{formError}</p>}
    </div>
  </form>
</div>
</div>
  );
};

export default BuildBot;
