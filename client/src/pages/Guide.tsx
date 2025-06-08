import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSDK } from "@metamask/sdk-react";
import { Player } from "@lottiefiles/react-lottie-player";
import { useAuth } from "../contexts/AuthContext";
import RandomRobohashCard from "../components/RandomRobohashCard";
import GuideSection from "../components/guide/GuideSection";
import FAQItem from "../components/guide/FAQItem";
import TestimonialCard from "../components/guide/TestimonialCard";
import { sections, faqs, heroLines } from "../components/guide/guideData";

const Guide: React.FC = () => {
	const [visibleLines, setVisibleLines] = useState(0);
	const [strategyLevel, setStrategyLevel] = useState(50); // 0-100 scale
	const { connected } = useSDK();
	const navigate = useNavigate();
		const { user } = useAuth();

	useEffect(() => {
		// Animate lines in one by one
		if (visibleLines < heroLines.length) {
			const timer = setTimeout(() => setVisibleLines(visibleLines + 1), 700);
			return () => clearTimeout(timer);
		}
	}, [visibleLines]);

	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element) {
			const offsetTop = element.offsetTop - 120; // Adjust for navbar height
			window.scrollTo({
				top: offsetTop,
				behavior: 'smooth'
			});
		}
	};

	// Generate strategy description based on level
	const getStrategyDescription = (level: number) => {
		if (level < 25) return "Conservative: Lower risk, fewer trades, larger safety gaps";
		if (level < 50) return "Balanced Conservative: Moderate risk with safety-first approach";
		if (level < 75) return "Balanced Aggressive: Higher frequency trades with controlled risk";
		return "Aggressive: Maximum frequency, tighter gaps, higher potential returns";
	};

	// Generate robohash seed based on strategy level
	const getStrategyRobohash = (level: number) => {
		const seeds = ["conservative-bot", "balanced-safe", "balanced-aggro", "aggressive-trader", "extreme-dca"];
		const index = Math.floor(level / 20);
		return `https://robohash.org/${seeds[index] || seeds[0]}?set=set1&size=200x200`;
	};

	// Show the full guide content
	return (
		<div className="min-h-screen tracking-wide py-10 text-neon-light">
			<div className="max-w-6xl mx-auto px-4 ">
				{/* Hero Section with Lottie and overlayed animated description */}
				<div id="getting-started" className="relative flex flex-col items-center mb-12  bg-gradient-to-r from-neon-darker/10 to-neon-cyan/10 rounded-xl shadow-lg pl-16">
					<div className="w-full flex justify-center -m-16">
						{/* Overlayed description */}
						<div className="flex flex-col justify-center pointer-events-none -mr-32 z-10">
							<div className="bg-black/80 rounded-xl px-6 py-6 max-w-[800px] mx-auto">
								<div className="text-3xl md:text-4xl font-bold text-neon-cyan drop-shadow-[0_0_8px_#00ffe7] mb-2">
									Dear citizen,
								</div>
								<div className="space-y-2 mt-2">
									{heroLines.map((line, idx) => {
										const delays = [700, 1200, 2000];
										const show = visibleLines > idx;
										return (
											<div
												key={idx}
												className={`
						  ${show ? "animate-fadein-ltr" : ""}
						  text-neon-accent text-lg 
						`}
												style={{
													opacity: show ? 1 : 0,
													transform: show ? "translateX(0)" : "translateX(-40px)",
													transition: `opacity 0.7s ${delays[idx] || 0}ms, transform 0.7s ${delays[idx] || 0}ms`,
												}}
											>
												{line}
											</div>
										);
									})}
								</div>
							</div>
						</div>
						<Player
							src="lottie/blackBlocks.json"
							className="w-full drop-shadow-[0_0_24px]"
							loop
							autoplay
							speed={1}
						/>
						<div className="absolute bottom-[180px] right-[100px]">
							<RandomRobohashCard />
						</div>
					</div>
				</div>


				{/* Getting Started Section */}
				<div className="bg-neon-darker border border-neon-cyan/30 rounded-xl shadow-lg p-8 mb-12">
					<h2 className="text-2xl font-bold text-neon-cyan mb-6 text-center drop-shadow-[0_0_2px_#faafe8]">
						🚀 Getting Started with DexterCity
					</h2>
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-neon-light mb-8">
						<div className="bg-neon-dark/50 p-4 rounded-lg">
							<h3 className="text-lg font-bold text-neon-cyan mb-2">1. Connect MetaMask Wallet</h3>
							<p>Start by connecting your MetaMask wallet to access all DexterCity features and begin your trading journey.</p>
						</div>
						<div className="bg-neon-dark/50 p-4 rounded-lg">
							<h3 className="text-lg font-bold text-neon-cyan mb-2">2. Get Your Bot</h3>
							<p>Create a custom bot or purchase a pre-built strategy from our Bot Shop. Each bot comes with proven DCA strategies.</p>
						</div>
						<div className="bg-neon-dark/50 p-4 rounded-lg">
							<h3 className="text-lg font-bold text-neon-cyan mb-2">3. Choose Trading Pair</h3>
							<p>Select from available Ethereum trading pairs. Popular choices include ETH/USDC, WBTC/ETH, and other high-volume pairs.</p>
						</div>
						<div className="bg-neon-dark/50 p-4 rounded-lg">
							<h3 className="text-lg font-bold text-neon-cyan mb-2">4. Deploy & Fine-tune</h3>
							<p>Launch your bot and adjust strategies based on market conditions. Switch between aggressive and conservative approaches.</p>
						</div>
					</div>

					{/* Strategy Slider */}
					<div className="bg-neon-dark/30 p-6 rounded-lg">
						<h3 className="text-xl font-bold text-neon-cyan mb-4 text-center">DCA Strategy Selector</h3>
						<div className="flex items-center gap-6">
							<div className="flex-1">
								<div className="flex justify-between text-sm mb-2">
									<span>Conservative</span>
									<span>Aggressive</span>
								</div>
								<input
									type="range"
									min="0"
									max="100"
									value={strategyLevel}
									onChange={(e) => setStrategyLevel(Number(e.target.value))}
									className="w-full h-2 bg-neon-dark rounded-lg appearance-none cursor-pointer slider"
									style={{
										background: `linear-gradient(to right, #00ffe7 0%, #00ffe7 ${strategyLevel}%, #374151 ${strategyLevel}%, #374151 100%)`
									}}
								/>
								<div className="text-center mt-2 text-neon-cyan font-semibold">
									{getStrategyDescription(strategyLevel)}
								</div>
							</div>
							<div className="flex-shrink-0">
								<img
									src={getStrategyRobohash(strategyLevel)}
									alt="Strategy Bot"
									className="w-24 h-24 rounded-lg border-2 border-neon-cyan shadow-md bg-neon-darker transition-all duration-300"
								/>
							</div>
						</div>
						<div className="mt-4 text-sm text-neon-light">
							<p><strong>Commission System:</strong> DexterCity operates on a performance-based commission structure. We only earn when your bots are profitable, aligning our success with yours.</p>
						</div>
					</div>
				</div>

				<div className="flex flex-col md:flex-row justify-center items-start gap-8 mb-16">
					<div className="ml-6 flex flex-col justify-center items-center pointer-events-none">
						<div className="bg-black/80 rounded-xl px-6 py-6 max-w-2xl mx-auto">
							<div className="text-lg font-bold text-neon-cyan drop-shadow-[0_0_8px_#00ffe7] mb-2 text-center">
								Bots with 💞 by Robohash.org
							</div>
							<div className="flex flex-wrap justify-center gap-4 mt-4">
								{[352, 2, 2321, 7, 33].map((num) => (
									<img
										key={num}
										src={`https://robohash.org/dextercity-${num}?set=set1&size=100x100`}
										alt={`Robohash bot ${num}`}
										className="w-24 h-24 rounded-lg border-2 border-neon-cyan shadow-md bg-neon-darker"
									/>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Features Section */}
				<div id="features">
					{sections.map((section) => (
						<GuideSection
							key={section.id}
							id={section.id}
							icon={section.icon}
							title={section.title}
							summary={section.summary}
							detail={section.detail}
						/>
					))}
				</div>

				{/* FAQ Section */}
				<div id="faq" className="bg-neon-darker border border-neon-cyan/30 rounded-xl shadow-lg p-8 mb-12">
					<h2 className="text-2xl font-bold text-neon-cyan mb-6 text-center drop-shadow-[0_0_2px_#faafe8]">
						Frequently Asked Questions
					</h2>
					{faqs.map((faq, idx) => (
						<FAQItem key={idx} {...faq} />
					))}
				</div>

				{/* Testimonial */}
				<TestimonialCard />
			</div>
		</div>
	);
};

export default Guide;
