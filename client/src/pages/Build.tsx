import React, { useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { BotConfig } from "../models/Bot";
import { CoinMarketCap, Subgraph } from "../models/Token";


// import { usePairDetails } from "../contexts/PairDetails";
import User from "../models/User";
import { generateLogoHash } from "../services/Robohash";
import PairChart2 from "../components/PairChart2";

import { DropdownWithImagesV2, DropdownWithImagesV3 } from "../components/DropdownImages";

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

  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { botConfig } = state || {};

  // Access pair details and available pairs from context
  // const { pairDetails: availablePairs } = usePairDetails();

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

  // useEffect(() => {
  //   if (formData.tradingPool) {
  //     const pair = availablePairs[formData.tradingPool];
  //     setTradingPool(pair);
  //   }
  // }, [availablePairs, formData.tradingPool]);

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
    <div className="h-[700px] mt-6 items-center bg-gray-800 z-1">
      <div className="flex z-3 h-full gap-4 mx-10">

      <form onSubmit={handleSubmit}>

        <h1 className="text-2xl  text-center text-white rounded">Create a DCA Bot</h1>
        {/* General Configuration */}

        <div className="flex justify-center">
          { formData.botName.length > 0 ? (
            <img src={generateLogoHash(formData.botName)} alt="profile pic" className="h-[200px]"></img>
          ) : (
            <img src={"dexter.png"} alt="profile pic" className="h-[200px]"></img>
          ) }
        </div>

        <div className="flex">
            <div className="relative w-[66%]">
              <label className="block text-white pr-2 flex">Bot Name: {botNameError && <p className="text-red-500 text-xs ml-1 my-auto">{botNameError}</p>}</label> 
                  <input
                    type="text"
                    name="botName"
                    value={formData.botName}
                    onChange={handleInputChange}
                    className="p-2 bg-gray-500 text-white rounded w-full"
                    placeholder="Enter a unique name"
                  />
            </div>
            <div className="ml-4 w-[33%]">
              <label className="block text-white">Network:</label>
              <select
                name="network"
                value={formData.network}
                onChange={handleInputChange}
                className="h-10 pl-1 w-full bg-gray-500 text-white rounded"
              >
                <option value="Ethereum">Ethereum</option>
                <option value="Solana">Solana</option>
              </select>
            </div>
              
          </div>
        <div>
          <label className="block text-white">Trading Pair:</label>

          {/* Dropdown */}
          <DropdownWithImagesV3
            formData={formData}
            onChange={(pool: Subgraph.PoolData) => {
              setTradingPool(pool);
              setFormData({
                ...formData,
                tradingPool: pool.name.split(':')[1],
              });
            }}                  />

        {tradingPool ? (
          <>
            {/* Profit Base Toggle */}
            <label className="block text-white">Profit Base:</label>
            <div className="flex justify-center gap-4">
              {tradingPool?.token0.imgId && (
                <div
                  className={`cursor-pointer p-1 w-full flex rounded-lg items-center ${profitBase === "token0" ? "bg-purple-800" : "bg-gray-500"}`}
                  onClick={() => handleProfitBaseToggle("token0")}
                >
                  <img
                    src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${tradingPool?.token0.imgId}.png`}
                    alt="Token 0"
                    className="w-8 h-8 rounded-full"
                  />
                  <p className="text-white text-sm text-center w-full">{tradingPool?.name.split(':')[1]}</p>
                </div>
              )}
              {tradingPool?.token1.imgId && (
                <div
                  className={`cursor-pointer p-1 w-full flex rounded-lg items-center ${profitBase === "token1" ? "bg-purple-800" : "bg-gray-500"}`}
                  onClick={() => handleProfitBaseToggle("token1")}
                >
                  <img
                    src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${tradingPool?.token1.imgId}.png`}
                    alt="Token 1"
                    className="w-8 h-8 rounded-full"
                  />
                  <p className="text-white text-sm text-center w-full">{tradingPool?.name.split(':')[2]}</p>
                </div>
              )}
            </div>
          </>

        ) : (<></>)
        }
        </div>
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
        {/* Live price display */}
        <div className="w-3/4 mt-4">
          {/* <PairChart 
            swapPair={tradingPair}
            safetyOrdersCount={formData.safetyOrders}
            priceDeviation={formData.priceDeviation}
            gapMultiplier={formData.safetyOrderGapMultiplier}
          /> */}
          <PairChart2 botForm={formData} pool={tradingPool}/>
          {/* <RandomChart /> */}
        </div>

    </div>
</div>
);
};

export default BuildBot;
