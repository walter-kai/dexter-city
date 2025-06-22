import React, { useContext, useEffect, useState } from "react";
import RandomRobohashCard from "../../components/common/RandomRobohashCard";
import { TrendingCoinsContext } from "../../contexts/TrendingCoinsContext";

interface StepCardProps {
  icon: React.ReactNode;
  step: string;
  title: string;
  titleColor: string;
  borderColor: string;
  description: React.ReactNode;
  buttonText: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonHref: string;
  buttonTarget?: string;
}

const StepCard: React.FC<StepCardProps> = ({
  icon,
  step,
  title,
  titleColor,
  borderColor,
  description,
  buttonText,
  buttonColor,
  buttonTextColor,
  buttonHref,
  buttonTarget
}) => (
  <div className={`flex-1 flex flex-col items-center bg-[#181c23] border-2 ${borderColor} rounded-2xl shadow-[0_0_24px_#00ffe7]/20 p-8 hover:scale-[1.02] transition-transform min-w-[220px]`}>
    <div className="flex flex-col items-center mb-2">
      <div className="h-20 my-auto">{icon}</div>
      <span className={`${titleColor} font-bold text-lg mt-2`}>{step}</span>
    </div>
    <div className="flex-1 flex flex-col w-full">
      <h2 className={`text-2xl font-bold ${titleColor} mb-2`}>{title}</h2>
      <div className="text-[#e0e7ef] mb-2">{description}</div>
      <div className="mt-auto w-full">
        <a
          href={buttonHref}
          target={buttonTarget}
          rel={buttonTarget === '_blank' ? 'noopener noreferrer' : undefined}
          className={`inline-block w-full px-5 py-2 ${buttonColor} ${buttonTextColor} font-bold rounded-lg shadow hover:bg-[#faafe8] hover:text-[#181a23] transition text-center`}
        >
          {buttonText}
        </a>
      </div>
    </div>
  </div>
);

const HowItWorks: React.FC = () => {
  const { trendingCoins } = useContext(TrendingCoinsContext);
  const [rotatingIndex, setRotatingIndex] = useState(0);

  useEffect(() => {
    if (!trendingCoins || trendingCoins.length === 0) return;
    const interval = setInterval(() => {
      setRotatingIndex((prev) => (prev + 1) % trendingCoins.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [trendingCoins]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 bg-black/50">
      <h1 className="text-5xl font-bold text-[#00ffe7] mb-8 text-center drop-shadow-[0_0_16px_#00ffe7]">
        How does it work?
      </h1>
      <p className="text-xl text-[#faafe8] mb-12 text-center max-w-2xl">
        Your guide to getting started with trading bots in Dexter City. Follow these steps to level up your trading game!
      </p>
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-10">
        <StepCard
          icon={<img src="/logos/metamask-logo.png" alt="Metamask" className="h-20 w-20 mb-2" />}
          step="Step 1"
          title="Install Metamask"
          titleColor="text-[#faafe8]"
          borderColor="border-[#00ffe7]/30"
          description={<span>Use the browser extension or mobile app to connect your wallet to Dexter City.</span>}
          buttonText="Download Metamask"
          buttonColor="bg-[#00ffe7] hover:bg-[#faafe8]"
          buttonTextColor="text-[#181c23]"
          buttonHref="https://metamask.io/download/"
          buttonTarget="_blank"
        />
        <StepCard
          icon={<RandomRobohashCard />}
          step="Step 2"
          title="Buy or Sell Bots"
          titleColor="text-[#00ffe7]"
          borderColor="border-[#faafe8]/30"
          description={<span>Get started with a premade bot or build your own. Fees are in USDT. See our <a href="/x/commissions" className="text-[#00ffe7] underline hover:text-[#faafe8]">commissions</a> for details.</span>}
          buttonText="View Pricing"
          buttonColor="bg-[#faafe8] hover:bg-[#00ffe7]"
          buttonTextColor="text-[#181c23]"
          buttonHref="/x/pricing"
        />
        <StepCard
          icon={trendingCoins && trendingCoins.length > 0 ? (
            <img
              src={trendingCoins[rotatingIndex].item.thumb}
              alt={trendingCoins[rotatingIndex].item.name}
              className="h-16 w-16 mb-2 rounded-full border-2 border-[#00ffe7] bg-black"
            />
          ) : (
            <div className="h-16 w-16 mb-2 rounded-full border-2 border-[#00ffe7] bg-black flex items-center justify-center text-[#00ffe7]">?</div>
          )}
          step="Step 3"
          title="Trending Tokens"
          titleColor="text-[#faafe8]"
          borderColor="border-[#00ffe7]/30"
          description={<span>See what's hot! We highlight trending tokens from CoinGecko. <a href="/x/pools" className="text-[#00ffe7] underline hover:text-[#faafe8]">See all pools</a>.</span>}
          buttonText="View Pools"
          buttonColor="bg-[#00ffe7] hover:bg-[#faafe8]"
          buttonTextColor="text-[#181c23]"
          buttonHref="/x/pools"
        />
        <StepCard
          icon={<img src="/logos/dexter3d.svg" alt="DexterLogo" className="h-20 w-20 mb-2 rounded-lg" />}
          step="Step 4"
          title="Deploy & Monitor"
          titleColor="text-[#00ffe7]"
          borderColor="border-[#faafe8]/30"
          description={<span>The best bots are the ones that are monitored! Use <a href="/x/telegram" className="text-[#00ffe7] underline hover:text-[#faafe8]">Telegram notifications</a> to stay on top of things.</span>}
          buttonText="Get Telegram Alerts"
          buttonColor="bg-[#faafe8] hover:bg-[#00ffe7]"
          buttonTextColor="text-[#181a23]"
          buttonHref="/x/telegram"
        />
      </div>
    </div>
  );
};

export default HowItWorks;
