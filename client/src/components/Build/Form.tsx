import React, { useState, useEffect } from "react";
import { BotConfig } from "../../models/Bot";
import User from "../../models/User";
import { useNavigate } from "react-router-dom";
import { Subgraph } from "../../models/Token";
import { generateLogoHash } from "../../services/Robohash";
import DropdownWithImages from "./Dropdown";
// import { usePairDetails } from "../contexts/PairDetails";

interface BotFormProps {
  setSelectedPair: (pair: string) => void;
}

const BotForm: React.FC<BotFormProps> = ({ setSelectedPair }) => {
  const [formData, setFormData] = useState<BotConfig>({
    status: "Stopped",
    creatorName: "",
    creatorWalletId: "",
    botName: "",
    network: "ETH",
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
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Record<string, Subgraph.TokenData>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchTokenDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chain/tokens`);
      if (!response.ok) {
        throw new Error('Failed to fetch token details');
      }
      const data = await response.json();
  
      // Assuming `data` is an array of objects with `token` and `poolId` properties
      const tokenRecord: Record<string, Subgraph.TokenData> = {};
  
      data.forEach(({ token }: { token: Subgraph.TokenData }) => {
        tokenRecord[token.id] = token; // Assuming 'id' is a unique field for tokens
      });
  
      setTokens(tokenRecord); // Update the state with the new token record
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenDetails();
  }, []);

  useEffect(() => {
    checkBotNameAvailability(formData.botName);
  }, [formData.botName]);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let updatedValue: string | number | boolean = value;
    setSelectedPair(e.target.value);

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
      if (!formData[key as keyof BotConfig] && key !== "notifications") {
        setFormError("Please fill in all fields.");
        return;
      }
    }
    const storedUser = sessionStorage.getItem('currentUser');
    if (!storedUser || storedUser === 'undefined') {
        alert("User undefined.");
    } else {
        setUser(JSON.parse(storedUser))

        if(!JSON.parse(storedUser).walletId){
            alert("User wallet ID is missing. Please log in to create a bot.");
        }
    }

    if (botNameError) {
      setFormError("Please choose a unique bot name.");
      return;
    }

    const payload = {
      ...formData,
      creatorName: user?.firstName,
      creatorWalletId: user?.walletId,
      createdAt: new Date(),
    };

    try {
      const response = await fetch("/api/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to create bot: ${errorData.message || "Unknown error"}`);
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
              <label className="block text-white pr-2">Bot Name:</label>
                  <input
                    type="text"
                    name="botName"
                    value={formData.botName}
                    onChange={handleInputChange}
                    className="p-2 bg-gray-900 text-white rounded w-full"
                    placeholder="Enter a unique name"
                  />
                  {botNameError && <p className="text-red-500">{botNameError}</p>}
            </div>
            <div className="ml-4 w-[33%]">
              <label className="block text-white">Network:</label>
              <select
                name="network"
                value={formData.network}
                onChange={handleInputChange}
                className="h-10 pl-1 w-full bg-gray-900 text-white rounded"
              >
                <option value="Ethereum">Ethereum</option>
                <option value="Solana">Solana</option>
              </select>
            </div>
              
          </div>
        <div>
          <label className="block text-white">Trading Pair:</label>
          <DropdownWithImages
            availableTokens={tokens}
            formData={formData}
            onChange={(pair: string) => {
              setFormData({
                ...formData,
                tradingPair: pair,
              });
            }}                  />

          {/* <div className="flex h-12 m-2">
            <img src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${tradingPair?.token0ImgId}.png`} alt="token icon"></img>
            <img src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${tradingPair?.token1ImgId}.png`} alt="token icon"></img>
          </div> */}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-white">Trailing Take Profit</label>
            <input
              type="number"
              name="trailingTakeProfit"
              value={formData.trailingTakeProfit}
              onChange={handleInputChange}
              className="w-full p-2 bg-gray-900 text-white rounded pr-10"
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
              className="w-full p-2 bg-gray-900 text-white rounded pr-10"
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
              className="w-full p-2 bg-gray-900 text-white rounded pr-10"
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
              className="w-full p-2 bg-gray-900 text-white rounded"
            />
          </div>

          <div className="relative">
            <label className="block text-white">Safety Order Gap Multiplier</label>
            <input
              type="number"
              name="safetyOrderGapMultiplier"
              value={formData.safetyOrderGapMultiplier}
              onChange={handleInputChange}
              className="w-full p-2 bg-gray-900 text-white rounded pr-10"
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
              className="w-full p-2 bg-gray-900 text-white rounded pr-10"
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
  );
};

export default BotForm;
