import React, { useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { BotConfig } from "../models/Bot";
import { CoinMarketCap, Subgraph } from "../models/Token";

import User from "../models/User";
import { generateLogoHash } from "../hooks/Robohash";
import PairChart from "../components/buildBot/PairChart";
import TokenInfo from "../components/buildBot/TokenInfo"; // Import the updated TokenInfo component

import LoadingScreenDots from "@/components/LoadingScreenDots";

const BuildBot: React.FC = () => {
  const [formData, setFormData] = useState<BotConfig>({
    status: "Stopped",
    creatorName: "",
    creatorWalletId: "",
    botName: "",
    network: "Ethereum",
    tradingPool: "",
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
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tradingPool, setTradingPool] = useState<Subgraph.PoolData | undefined>(undefined);
  const [profitBase, setProfitBase] = useState<"token0" | "token1" | null>(null);
  const [availablePools, setAvailablePools] = useState<Subgraph.PoolData[] | null>(null);

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
  }, [botConfig]);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await fetch("/api/chain/uni/pools");
        if (!response.ok) throw new Error("Failed to fetch pools");

        const data = await response.json();
        setAvailablePools(data.pools);
      } catch (error) {
        console.error("Error fetching pools:", error);
      }
    };

    fetchPools();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let updatedValue: string | number | boolean = value;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      updatedValue = checked;
    } else if (type === "number") {
      updatedValue = Number(value);
    }

    setFormData({
      ...formData,
      [name]: updatedValue,
    });

    if (name === "botName") {
      checkBotNameAvailability(value.trim());
    }
  };

  const checkBotNameAvailability = async (botName: string) => {
    if (botName.length > 0) {
      try {
        const response = await fetch(`/api/bot?botName=${botName}`);
        if (response.status !== 404) {
          setBotNameError("Bot name taken. Please try again.");
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
      if (!formData[key as keyof BotConfig] && key !== "notifications") {
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

  const handleProfitBaseToggle = (selectedToken: "token0" | "token1") => {
    setProfitBase(selectedToken);
  };

  return (
    <div className="items-center z-1">
      <div className="z-3 gap-4 m-10 mt-0">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-center space-y-4">
            <label className="block text-white pr-2 flex">
              {botNameError && <p className="text-red-500 text-xs ml-1 my-auto">{botNameError}</p>}
            </label>
            <input
              type="text"
              name="botName"
              value={formData.botName}
              onChange={handleInputChange}
              className="p-2 bg-gray-500 text-white rounded w-72 h-fit"
              placeholder="Enter a unique name"
            />
            <div className="flex justify-center">
              {formData.botName.length > 0 ? (
                <img src={generateLogoHash(formData.botName)} alt="profile pic" className="h-[150px]" />
              ) : (
                <img src={"logos/dexter.png"} alt="profile pic" className="h-[150px]" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <div className="w-72">
              <label className="block text-white">Network:</label>
              <select
                name="network"
                value={formData.network}
                onChange={handleInputChange}
                className="h-10 w-full bg-gray-500 text-white rounded"
              >
                <option value="Ethereum">Ethereum</option>
                <option value="Solana">Solana</option>
              </select>

              <label className="block text-white mt-4">Trading Pair:</label>
              <div
                className="h-64 overflow-y-auto bg-gray-700 rounded p-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "gray darkgray",
                }}
              >
                {availablePools ? (
                  availablePools.map((pool) => (
                    <div
                      key={pool.address}
                      className={`flex items-center p-2 cursor-pointer rounded ${
                        formData.tradingPool === pool.name.split(":")[1]
                          ? "bg-purple-800"
                          : "hover:bg-gray-600"
                      }`}
                      onClick={() => {
                        setTradingPool(pool);
                        setFormData({
                          ...formData,
                          tradingPool: pool.name.split(":")[1],
                        });
                      }}
                    >
                      <img
                        src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${pool.token0.imgId || "default"}.png`}
                        alt={`${pool.token0.symbol} icon`}
                        className="w-6 h-6 mr-2"
                      />
                      <span className="text-white">{pool.token0.symbol}</span>
                      <span className="text-white mx-2">↔️</span>
                      <img
                        src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${pool.token1.imgId || "default"}.png`}
                        alt={`${pool.token1.symbol} icon`}
                        className="w-6 h-6 mx-2"
                      />
                      <span className="text-white">{pool.token1.symbol}</span>
                    </div>
                  ))
                ) : (
                  <LoadingScreenDots />
                )}
              </div>
            </div>
            <div className="m-4">
              <h2 className="text-white text-lg font-bold mb-4">Selected Token Information</h2>
              <TokenInfo tokenAddress={tradingPool?.token0.address || ""} /> {/* Use TokenInfo with token0.address */}
            </div>
          </div>
          <div className="mt-4 h-[650px] w-[800px] mx-auto">
            <PairChart botForm={formData} pool={tradingPool} className="h-[475px]" />
          </div>
          {tradingPool && (
            <>
              <label className="block text-white">Profit Currency:</label>
              <div className="flex justify-center gap-4 mb-4">
                {tradingPool?.token0.imgId && (
                  <div
                    className={`cursor-pointer p-1 w-full flex rounded-lg items-center ${
                      profitBase === "token0" ? "bg-purple-800" : "bg-gray-500"
                    }`}
                    onClick={() => handleProfitBaseToggle("token0")}
                  >
                    <img
                      src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${tradingPool?.token0.imgId}.png`}
                      alt="Token 0"
                      className="w-8 h-8 rounded-full"
                    />
                    <p className="text-white text-sm text-center w-full">{tradingPool?.token0.symbol}</p>
                  </div>
                )}
                {tradingPool?.token1.imgId && (
                  <div
                    className={`cursor-pointer p-1 w-full flex rounded-lg items-center ${
                      profitBase === "token1" ? "bg-purple-800" : "bg-gray-500"
                    }`}
                    onClick={() => handleProfitBaseToggle("token1")}
                  >
                    <img
                      src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${tradingPool?.token1.imgId}.png`}
                      alt="Token 1"
                      className="w-8 h-8 rounded-full"
                    />
                    <p className="text-white text-sm text-center w-full">{tradingPool?.token1.symbol}</p>
                  </div>
                )}
              </div>

            </>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-white">Take Profit</label>
              <input
                type="number"
                name="trailingTakeProfit"
                value={formData.trailingTakeProfit}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-500 text-white rounded pr-10"
                step="0.01"
              />
              <span className="absolute right-3 bottom-[8px] text-teal-100">%</span>
            </div>

            <div className="relative">
              <label className="block text-white">Price Deviation</label>
              <input
                type="number"
                name="priceDeviation"
                value={formData.priceDeviation}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-500 text-white rounded pr-10"
                step="0.01"
              />
              <span className="absolute right-3 bottom-[8px] text-teal-100">%</span>
            </div>

            <div className="relative">
              <label className="block text-white">Cooldown Period</label>
              <input
                type="number"
                name="cooldownPeriod"
                value={formData.cooldownPeriod}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-500 text-white rounded pr-10"
              />
              <span className="absolute right-3 bottom-[8px] text-teal-100">s</span>
            </div>

            <div>
              <label className="block text-white">Safety Orders:</label>
              <input
                type="number"
                name="safetyOrders"
                value={formData.safetyOrders}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-500 text-white rounded"
              />
            </div>

            <div className="relative">
              <label className="block text-white">Safety Order Gap Multiplier</label>
              <input
                type="number"
                name="safetyOrderGapMultiplier"
                value={formData.safetyOrderGapMultiplier}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-500 text-white rounded pr-10"
                step="0.01"
              />
              <span className="absolute right-3 bottom-[8px] text-teal-100">x</span>
            </div>
            <div className="relative">
              <label className="block text-white">Safety Order Size Multiplier</label>
              <input
                type="number"
                name="safetyOrderSizeMultiplier"
                value={formData.safetyOrderSizeMultiplier}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-500 text-white rounded pr-10"
                step="0.01"
              />
              <span className="absolute right-3 bottom-[8px] text-teal-100">x</span>
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuildBot;
