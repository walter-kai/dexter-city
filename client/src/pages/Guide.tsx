import React, { useEffect, useState } from "react";
import { FaShopify, FaTools, FaChartLine, FaTrophy, FaReact, FaEthereum } from "react-icons/fa";
import { Player } from "@lottiefiles/react-lottie-player";
import RandomRobohashCard from "../components/RandomRobohashCard";

// Section data for each feature
const sections = [
	{
		id: "how-it-works",
		icon: <FaReact />,
		title: "How This Works",
		summary: "Get started with Dexter City in minutes.",
		detail: (
      <>
        <span className="flex items-center gap-2">
          Welcome to Dexter City - where Dexterian Trading Bots are workin hard on the Ethereum blockchain!
          <span className="inline-flex ">
            <FaEthereum className="text-[#627eea] text-xl ml-1 mr-1" />
          </span>
          Build a bot in the Bot Garage or get one from the Bot Shop, where you can lease and buy bots.
        </span>
        <ul className="ml-6 mt-2 text-[#b8eaff] list-none">
          <div className="flex items-center">
            <img
              src="logos/metamask-logo.png"
              alt="MetaMask"
              className="w-5 h-5 inline-block align-middle"
              style={{ display: "inline-block", verticalAlign: "middle" }}
            />
            <li className="ml-4">Securely connect your Metamask Wallet in seconds</li>
          </div>
          <div className="flex items-center">
            <span role="img" aria-label="robot">🤖</span>
            <li className="ml-4">Buy or lease a bot or build one from scratch</li>
          </div>
          <div className="flex items-center">
            <span role="img" aria-label="chart">📈</span>
            <li className="ml-4">Track performance and tweak strategies on the fly</li>
          </div>
        </ul>

      </>

		),
	},
	{
		id: "shop",
		icon: <FaShopify />,
		title: "Bot Shop",
		summary: "Explore, buy, and sell trading bots.",
		detail: (
			<>
				<p>
					The Bot Shop is a marketplace where you can browse, purchase, or sell
					trading bots. Each bot comes with a detailed description, performance
					stats, and user reviews. Whether you're a beginner or an expert, you'll
					find bots tailored to your needs.
				</p>
				<ul className="ml-6 mt-2 text-[#b8eaff] list-none">
					<div className="flex items-center">
						<span role="img" aria-label="discover">🔍</span>
						<li className="ml-4">Discover bots built by top developers</li>
					</div>
					<div className="flex items-center">
						<span role="img" aria-label="sell">💰</span>
						<li className="ml-4">Sell your own bots and earn rewards</li>
					</div>
					<div className="flex items-center">
						<span role="img" aria-label="deploy">⚡</span>
						<li className="ml-4">Instantly deploy purchased bots to your account</li>
					</div>
				</ul>
			</>
		),
	},
	{
		id: "garage",
		icon: <FaTools />,
		title: "Bot Garage",
		summary: "Build, manage, and customize your bots.",
		detail: (
			<>
				<p>
					The Bot Garage is your personal workshop for creating and managing bots.
					Use our visual builder to design strategies, set triggers, and fine-tune
					every parameter. Edit, clone, or delete bots as your needs evolve.
				</p>
				<ul className="ml-6 mt-2 text-[#b8eaff] list-none">
					<div className="flex items-center">
						<span role="img" aria-label="builder">🔧</span>
						<li className="ml-4">Visual bot builder with advanced options</li>
					</div>
					<div className="flex items-center">
						<span role="img" aria-label="manage">📋</span>
						<li className="ml-4">Manage all your bots in one place</li>
					</div>
					<div className="flex items-center">
						<span role="img" aria-label="edit">✏️</span>
						<li className="ml-4">Clone, edit, or remove bots anytime</li>
					</div>
				</ul>
			</>
		),
	},
	{
		id: "stats",
		icon: <FaChartLine />,
		title: "Stats & Analytics",
		summary: "Track your bots' performance in real time.",
		detail: (
			<>
				<p>
					The Stats section provides comprehensive analytics for all your bots.
					Monitor profit, loss, trade frequency, and more with interactive charts
					and detailed reports. Make data-driven decisions to optimize your
					trading strategies.
				</p>
				<ul className="ml-6 mt-2 text-[#b8eaff] list-none">
					<div className="flex items-center">
						<span role="img" aria-label="dashboard">📊</span>
						<li className="ml-4">Real-time performance dashboards</li>
					</div>
					<div className="flex items-center">
						<span role="img" aria-label="history">📈</span>
						<li className="ml-4">Historical trade analysis</li>
					</div>
					<div className="flex items-center">
						<span role="img" aria-label="reports">📄</span>
						<li className="ml-4">Exportable reports for deeper insights</li>
					</div>
				</ul>
			</>
		),
	},
	{
		id: "leaderboard",
		icon: <FaTrophy />,
		title: "Leaderboard",
		summary: "See how you stack up against the best.",
		detail: (
			<>
				<p>
					Compete with other users and see where you rank on the Dexter City
					Leaderboard. Track top-performing bots, compare strategies, and get
					inspired by the community's best performers.
				</p>
				<ul className="ml-6 mt-2 text-[#b8eaff] list-none">
					<div className="flex items-center">
						<span role="img" aria-label="ranking">🏆</span>
						<li className="ml-4">Global and friends-only rankings</li>
					</div>
					<div className="flex items-center">
						<span role="img" aria-label="view">👀</span>
						<li className="ml-4">View top bots and their stats</li>
					</div>
					<div className="flex items-center">
						<span role="img" aria-label="badges">🎖️</span>
						<li className="ml-4">Earn badges and recognition for your achievements</li>
					</div>
				</ul>
			</>
		),
	},
];

// FAQ and other cards remain unchanged
const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
	<div className="mb-4">
		<h4 className="font-semibold text-[#00ffe7]">{question}</h4>
		<p className="text-[#e0e7ef]">{answer}</p>
	</div>
);

const PricingCard = () => (
	<div className="bg-gradient-to-br from-[#23263a] to-[#181a23] border border-[#00ffe7]/30 rounded-xl shadow-lg p-6 w-96 mx-auto my-8">
		<h3 className="text-xl font-bold mb-4 text-[#00ffe7] text-center">📦 Per-Round Profit Commission</h3>
		<p className="text-[#e0e7ef] mb-4 text-center text-sm">
			Pay only when your bot makes profit. No monthly fees, no upfront costs.
		</p>
		
		<div className="space-y-3 mb-6">
			<div className="flex justify-between items-center p-3 bg-[#181a23] rounded-lg">
				<span className="text-[#b8eaff]">$0 – $5</span>
				<span className="text-[#00ffe7] font-bold">2%</span>
			</div>
			<div className="flex justify-between items-center p-3 bg-[#181a23] rounded-lg">
				<span className="text-[#b8eaff]">$5 – $50</span>
				<span className="text-[#00ffe7] font-bold">5%</span>
			</div>
			<div className="flex justify-between items-center p-3 bg-[#181a23] rounded-lg">
				<span className="text-[#b8eaff]">$50 – $250</span>
				<span className="text-[#00ffe7] font-bold">10%</span>
			</div>
			<div className="flex justify-between items-center p-3 bg-[#181a23] rounded-lg">
				<span className="text-[#b8eaff]">$250+</span>
				<span className="text-[#00ffe7] font-bold">15%</span>
			</div>
		</div>

		<div className="border-t border-[#00ffe7]/30 pt-4 mb-4">
			<h4 className="text-lg font-semibold text-[#00ffe7] mb-3">📌 Additional Features</h4>
			<ul className="ml-6 mt-2 text-[#b8eaff] list-none space-y-2 text-sm">
				<div className="flex items-center">
					<span role="img" aria-label="fee">💰</span>
					<li className="ml-4">Minimum $0.01 fee per successful round</li>
				</div>
				<div className="flex items-center">
					<span role="img" aria-label="split">🤝</span>
					<li className="ml-4">Bot creator revenue sharing (70/30 split)</li>
				</div>
				<div className="flex items-center">
					<span role="img" aria-label="cap">📊</span>
					<li className="ml-4">Monthly commission cap: max 1.5% of total profit</li>
				</div>
			</ul>
		</div>

		<button className="bg-[#00ffe7] text-[#181a23] w-full px-4 py-3 rounded hover:bg-[#ff005c] hover:text-white transition shadow-[0_0_8px_#00ffe7] hover:shadow-[0_0_16px_#ff005c] font-bold">
			Start Trading - No Upfront Cost
		</button>
	</div>
);

const TestimonialCard = () => (
	<div className="bg-[#23263a] rounded-xl shadow-md p-6 max-w-xl mx-auto my-8 flex flex-col items-center border border-[#00ffe7]/30">
		<img
			src="https://randomuser.me/api/portraits/men/32.jpg"
			alt="User"
			className="w-16 h-16 rounded-full mb-3 border-2 border-[#00ffe7]"
		/>
		<p className="italic text-[#e0e7ef] mb-2">
			"Dexter City made it so easy to launch my first trading bot. The dashboard
			is intuitive and the community is super helpful!"
		</p>
		<div className="font-semibold text-[#00ffe7]">Alex T., Early Adopter</div>
	</div>
);

const faqs = [
	{
		question: "How do I get started?",
		answer: "Connect your wallet, then visit the Bot Shop or Bot Garage to start building or selecting a bot.",
	},
	{
		question: "Is there a fee to use Dexter City?",
		answer: "Core features are free. Premium features will be available soon.",
	},
	{
		question: "Can I sell my own bots?",
		answer: "Yes! Use the Bot Garage to create and list your bots in the Bot Shop.",
	},
	{
		question: "How do I track my bot's performance?",
		answer: "Visit the Stats page for analytics and the Leaderboard to compare with others.",
	},
];

const heroLines = [
	<>
		<p className="text-white">
			Welcome to the <span className="font-semibold text-[#b8eaff]">Ethereum</span> trading bot mecca on<span className="font-semibold text-[#b8eaff]"> Uniswap</span>
      <img
        src="logos/uniswap-logo.png"
        alt="MetaMask"
        className="w-7 h-7 mb-1 inline-block align-middle"
        style={{ display: "inline-block", verticalAlign: "middle" }}
      />
    </p>
	</>,
  <div className="flex items-center">
	<div className="w-40">Buy/sell/rent/lease bots in our</div><div className="w-36 ml-2 btn-standard text-center"> Bot Shop</div>
  </div>,
  <div className="flex items-center">
	<div className="w-40">Build bots in our</div><div className="w-36 ml-2 btn-standard text-center"> Bot Garage</div>
  </div>,
];

const Guide: React.FC = () => {
	const [visibleLines, setVisibleLines] = useState(0);

	useEffect(() => {
		// Animate lines in one by one
		if (visibleLines < heroLines.length) {
			const timer = setTimeout(() => setVisibleLines(visibleLines + 1), 700);
			return () => clearTimeout(timer);
		}
	}, [visibleLines]);

	return (
		<div className="min-h-screen tracking-wide py-10 bg-gradient-to-br from-neon-cyan via-neon-darker to-neon-purple text-neon-light">
			<div className="max-w-5xl mx-auto px-4">
				{/* Hero Section with Lottie and overlayed animated description */}
				<div className="relative flex flex-col items-center mb-12">
          <div className="w-full flex justify-center">
            {/* Overlayed description */}
            <div className="flex flex-col justify-center pointer-events-none -mr-32 z-10">
              <div className="bg-black/80 rounded-xl px-6 py-6 max-w-[800px] mx-auto">
                <div className="text-3xl md:text-4xl font-bold text-neon-cyan drop-shadow-[0_0_8px_#00ffe7] mb-2">
                  Dear citizen,
                </div>
                <div className="space-y-2 mt-2">
                  {heroLines.map((line, idx) => {
                    // Custom staggered delays for each line
                    const delays = [700, 1200, 2000]; // ms for each line
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

				{/* Top Menu */}
				<nav className="flex flex-wrap justify-center gap-4 mb-12">
					{sections.map((section) => (
						<a
							key={section.id}
							href={`#${section.id}`}
							className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-darker border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan hover:text-neon-darker transition font-semibold shadow-[0_0_8px_#faafe8]"
						>
							<span className="text-xl">{section.icon}</span>
							<span>{section.title}</span>
						</a>
					))}
				</nav>

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

				{/* Sections */}
				{sections.map((section) => (
					<section
						key={section.id}
						id={section.id}
						className="py-4 mb-16 scroll-mt-24 bg-black/80 border border-neon-cyan/30 rounded-xl shadow-lg"
					>
						<div className="flex items-center gap-3 mb-2 border-b border-neon-cyan/30 p-6">
							<span className="text-3xl text-neon-cyan">{section.icon}</span>
							<h2 className="text-2xl font-bold text-neon-cyan">
								{section.title}
							</h2>
						</div>
						<p className="text-neon-accent font-semibold mb-2 px-6">{section.summary}</p>
						<div className="text-neon-light px-6">{section.detail}</div>
					</section>
				))}

				{/* FAQ Section */}
				<div className="bg-neon-darker border border-neon-cyan/30 rounded-xl shadow-lg p-8 mb-12">
					<h2 className="text-2xl font-bold text-neon-cyan mb-6 text-center drop-shadow-[0_0_2px_#faafe8]">
						Frequently Asked Questions
					</h2>
					{faqs.map((faq, idx) => (
						<FAQItem key={idx} {...faq} />
					))}
				</div>

				{/* Pricing Card */}
				<PricingCard />

				{/* Testimonial */}
				<TestimonialCard />
			</div>
		</div>
	);
};

export default Guide;
