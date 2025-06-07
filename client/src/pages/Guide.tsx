import React, { useEffect, useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import RandomRobohashCard from "../components/RandomRobohashCard";
import GuideSection from "../components/introduction/GuideSection";
import FAQItem from "../components/introduction/FAQItem";
import PricingCard from "../components/introduction/PricingCard";
import TestimonialCard from "../components/introduction/TestimonialCard";
import { sections, faqs, heroLines } from "../components/introduction/guideData";
import NewsUpdates from "@/components/introduction/NewsUpdates";

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

				<NewsUpdates />

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
					<GuideSection
						key={section.id}
						id={section.id}
						icon={section.icon}
						title={section.title}
						summary={section.summary}
						detail={section.detail}
					/>
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
