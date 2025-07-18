import React from "react";
import { FaTwitter, FaLinkedin, FaExternalLinkAlt } from "react-icons/fa";

const experienceTiles = [
	{
		category: "Entertainment & Celebrities",
		companies: ["Lady Gaga", "P!nk", "Jerry Bruckheimer", "Kim Kardashian"],
		icon: "🎭",
		color: "#ff6b9d"
	},
	{
		category: "Tech Giants",
		companies: ["Microsoft", "Hootsuite"],
		icon: "🏢",
		color: "#4fc3f7"
	},
	{
		category: "Blockchain & Gaming",
		companies: ["TRON", "DLive.tv", "Evolution Gaming"],
		icon: "⛓️",
		color: "#9c27b0"
	},
	{
		category: "Healthcare & Engineering",
		companies: ["Eli Lilly", "Arup"],
		icon: "🏥",
		color: "#66bb6a"
	},
	{
		category: "Education",
		companies: ["MBA - NFT Industry Thesis"],
		icon: "🎓",
		color: "#ffa726"
	}
];

const AboutUs: React.FC = () => {
	return (
		<div className="fixed inset-0 bg-[#23263a]/70 overflow-hidden animate-fade-in-up">
			<div className="relative w-full h-full flex justify-center items-start">
				<div className="w-full h-screen flex justify-center custom-scrollbar" style={{ overflowY: 'auto' }}>
					<div className="h-fit">
						<div className="max-w-4xl w-full px-4 py-[200px] mx-auto">
							<div className="bg-[#181a23]/90 rounded-3xl border-2 border-[#00ffe7]/30 shadow-[0_0_32px_#00ffe7]/20 backdrop-blur-md overflow-hidden relative">
				{/* Neon border corners */}
				<span className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#00ffe7] rounded-tl-3xl opacity-70 animate-pulse" />
				<span className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#00ffe7] rounded-tr-3xl opacity-70 animate-pulse" />
				<span className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#00ffe7] rounded-bl-3xl opacity-70 animate-pulse" />
				<span className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#00ffe7] rounded-br-3xl opacity-70 animate-pulse" />
				{/* Header Profile Section */}
				<div className="px-6 pt-8 pb-4">
					{/* Profile Picture */}
					<div className="flex justify-center mb-4">
						<div className="relative">
							<img
								src="https://robohash.org/walt?set=set1&size=200x200"
								alt="Walt"
								className="w-24 h-24 rounded-full border-4 border-[#00ffe7]/60 shadow-[0_0_16px_#00ffe7aa]"
							/>
							<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#00ffe7] rounded-full border-2 border-[#181a23]"></div>
						</div>
					</div>

					{/* Profile Info */}
					<div className="text-center mb-4">
						<h1 className="text-2xl font-bold text-[#00ffe7] mb-1">Walt</h1>
						<p className="text-[#faafe8] text-sm mb-2">Tech Visionary & DexterCity Founder</p>
						<p className="text-[#e0e7ef] text-sm leading-relaxed">
							Almost 20 years in the tech industry. Building the future of automated trading.
						</p>
					</div>

					{/* Link in Bio */}
					<div className="mb-4">
						<a 
							href="https://dexter.city" 
							className="flex items-center justify-center gap-2 bg-[#00ffe7]/10 border border-[#00ffe7]/30 rounded-xl py-2 px-4 text-[#00ffe7] text-sm hover:bg-[#00ffe7]/20 transition-colors"
						>
							<FaExternalLinkAlt className="w-3 h-3" />
							dexter.city
						</a>
					</div>

					{/* Social Media Icons */}
					<div className="flex justify-center gap-4 mb-6">
						<a 
							href="#" 
							className="w-10 h-10 bg-[#1da1f2]/20 border border-[#1da1f2]/40 rounded-xl flex items-center justify-center hover:bg-[#1da1f2]/30 transition-colors"
						>
							<FaTwitter className="w-5 h-5 text-[#1da1f2]" />
						</a>
						<a 
							href="#" 
							className="w-10 h-10 bg-[#0077b5]/20 border border-[#0077b5]/40 rounded-xl flex items-center justify-center hover:bg-[#0077b5]/30 transition-colors"
						>
							<FaLinkedin className="w-5 h-5 text-[#0077b5]" />
						</a>
					</div>
				</div>

				{/* Experience Grid */}
				<div className="px-6 pb-8">
					<h2 className="text-lg font-semibold text-[#00ffe7] mb-4 text-center">Experience Highlights</h2>
					<div className="grid grid-cols-3 gap-3">
						{experienceTiles.map((tile, index) => (
							<div
								key={index}
								className="bg-[#23263a]/80 rounded-2xl p-4 border border-[#00ffe7]/20 hover:border-[#00ffe7]/40 transition-colors group"
							>
								<div className="text-center mb-3">
									<span className="text-2xl mb-2 block">{tile.icon}</span>
									<h3 className="text-xs font-semibold text-[#00ffe7] mb-2 leading-tight">
										{tile.category}
									</h3>
								</div>
								<div className="space-y-1">
									{tile.companies.map((company, companyIndex) => (
										<div
											key={companyIndex}
											className="text-xs text-[#e0e7ef] bg-[#181a23]/60 rounded-lg px-2 py-1 text-center"
										>
											{company}
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AboutUs;
