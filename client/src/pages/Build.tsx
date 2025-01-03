import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BotConfig } from "../models/Bot";

const CreateDCABot: React.FC = () => {
  const [user, setUser] = useState<any>(null); // Adjust this based on your actual user type
  const [formData, setFormData] = useState<BotConfig>({
    creatorName: "Kaii",
    creatorWalletId: "Wallet",
    botName: "TestBot",
    tradingPair: "ETH/USDT",
    startingBalance: "1000",
    initialOrderSize: "50",
    priceDeviation: "0.5",
    safetyOrders: "8",
    safetyOrderMultiplier: "1.2",
    maxTradeSize: "500",
    stopLoss: "10",
    takeProfit: "5",
    trailingTakeProfit: "1",
    maxDrawdown: "20",
    orderType: "Market",
    cooldownPeriod: "60",
    minTradeSize: "10",
    notifications: true,
    status: "inactive",
    createdAt: new Date(),
  });

  const location = useLocation();
  const { state } = location; // This is where the state from navigate is passed
  const { botConfig } = state || {}; // Extract botConfig from state, if available

  useEffect(() => {
    if (botConfig) {
      setFormData(botConfig); // Prepopulate form with botConfig if available
    }
  }, [botConfig]);

  const [botNameError, setBotNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser && storedUser !== 'undefined') {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
    checkBotNameAvailability(formData.botName);

  }, []);

  const generateLogoHash = (name: string) => {
    return `https://www.robohash.org/dexter/${name}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      setFormData({
        ...formData,
        [name]: e.target.checked,
      });
    } else {
      let sanitizedValue = value;
      if (name === "botName") {
        sanitizedValue = value.replace(/ /g, "");
      }

      setFormData({
        ...formData,
        [name]: sanitizedValue,
      });

      if (name === "botName") {
        const botName = sanitizedValue.trim();
        checkBotNameAvailability(botName);
      }
    }
  };

  const checkBotNameAvailability = async (botName: string) => {
    if (botName.length > 0) {
      const response = await fetch(`/api/bot?botName=${botName}`);

      if (response.status !== 404) {
        console.error("Error checking bot name availability:", error);
        setBotNameError("Bot name is taken.");
      } else {
        setBotNameError(null);
      }
    } else {
      setBotNameError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const key in formData) {
      if (formData[key as keyof BotConfig] === "") {
        setFormError("Please fill in all the fields.");
        return;
      }
    }

    if (!user || !user.walletId) {
      alert("User wallet ID is missing. Please log in to create a bot.");
      return;
    }

    if (botNameError !== null) {
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
          alert(`Bot exists already: ${errorData.botName}`); 
        } else {
          console.error("Error:", errorData);
          alert(`Failed to create bot: ${errorData.botName || "Unknown error"}`);
        }
        return;
      }

      const data = await response.json();
      console.log("Success:", data);
      navigate("/dash");
      alert("DCA Bot created successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while creating the bot.");
    }
  };

  return (
    <div className="flex flex-col items-center animate-fadeIn bg-gradient-to-bl from-[#343949] to-[#7c8aaf]">
      <div className="relative w-full">
        <div className="p-4 font-bold w-full text-white">
          <h1 className="text-center text-2xl mb-4">Create a DCA Bot</h1>
          <form onSubmit={handleSubmit} className="space-y-6 bg-black/50 p-6 rounded shadow-md max-w-lg mx-auto">
            <section>
              <h2 className="text-xl text-white mb-2">General Configuration</h2>
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
                  className="h-16 w-16 mx-auto mt-4"
                />
              </div>
            </section>

            <section>
              <div className="space-y-2">
                <label className="block">
                  Trading Pair:
                  <input
                    type="text"
                    name="tradingPair"
                    value={formData.tradingPair}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                  />
                </label>
              </div>
            </section>

            <section>
              <div className="space-y-2">
                <label className="block">
                  Starting Balance:
                  <input
                    type="text"
                    name="startingBalance"
                    value={formData.startingBalance}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                  />
                </label>
              </div>
            </section>

            <section>

              <div className="space-y-2">
                <label className="block">
                  Initial Order Size:
                  <input
                    type="text"
                    name="initialOrderSize"
                    value={formData.initialOrderSize}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                  />
                </label>
              </div>
            </section>

            <section>
              <div className="space-y-2">
                <label className="block">
                  Price Deviation:
                  <input
                    type="text"
                    name="priceDeviation"
                    value={formData.priceDeviation}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                  />
                </label>
              </div>
            </section>

            <section className="text-center mt-4">
              {formError && <p className="text-red-500">{formError}</p>}
              <button
                type="submit"
                className="w-full p-2 rounded bg-blue-500 text-white hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Creating Bot..." : "Create Bot"}
              </button>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDCABot;
