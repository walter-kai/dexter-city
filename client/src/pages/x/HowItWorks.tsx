import React, { useContext, useEffect, useState } from "react";
import RandomRobohashCard from "../../components/common/RandomRobohashCard";
import { TrendingCoinsContext } from "../../providers/TrendingCoinsContext";

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
  <div className={`relative flex flex-col items-center bg-[#181c23] border-2 ${borderColor} rounded-2xl shadow-[0_0_24px_#00ffe7]/20 p-8 w-full max-w-xs passport-card overflow-hidden`}>
    <div className="flex flex-col items-center mb-2">
      <div className="h-20 my-auto">{icon}</div>
      <span className={`${titleColor} font-bold text-lg mt-2`}>{step}</span>
    </div>
    <div className="flex-1 flex flex-col w-full">
      <h2 className={`text-2xl font-bold ${titleColor} mb-2 text-center`}>{title}</h2>
      <div className="text-[#e0e7ef] mb-2 text-center">{description}</div>
      <div className="mt-auto w-full flex justify-center">
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
    {/* Neon HUD corners */}
    <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#00ffe7] rounded-tl-2xl opacity-60 animate-pulse" />
    <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#00ffe7] rounded-tr-2xl opacity-60 animate-pulse" />
    <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#00ffe7] rounded-bl-2xl opacity-60 animate-pulse" />
    <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#00ffe7] rounded-br-2xl opacity-60 animate-pulse" />
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#23263a]/70 py-16 px-4">
      <div className="max-w-5xl w-full flex flex-col items-center">
        <h1 className="text-4xl font-bold text-[#00ffe7] mb-12 drop-shadow-[0_0_8px_#00ffe7] tracking-widest text-center">
          How does it work?
        </h1>
        <p className="text-xl text-[#faafe8] mb-12 text-center max-w-2xl">
          Your guide to getting started with trading bots in Dexter City. Follow these steps to level up your trading game!
        </p>
        <div className="flex flex-col md:flex-row gap-10 w-full justify-center items-center">
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
    </div>
  );
};

export default HowItWorks;
