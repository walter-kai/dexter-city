import React from "react";

const team = [
    {
        name: "Tyrone",
        role: "Marketing Manager",
        image: "https://robohash.org/tyrone?set=set1&size=200x200",
        bio: "Fluent in Japanese and English, Tyrone is our marketing maestro. He crafts compelling narratives that resonate with our global community.",
    },
	{
		name: "Kai",
		role: "Founder & Lead Developer",
		image: "https://robohash.org/walt?set=set1&size=200x200",
		bio: "Visionary, builder, and dedicated. Kai is the architect behindDexter City, passionate about providing the best trading tools.",
	},
	{
		name: "Wasim",
		role: "Smart Contract Developer",
		image: "https://robohash.org/wasim?set=set1&size=200x200",
		bio: "Wasim is a wizard with Solidity. He never sleeps, ensuring the smart contracts are robust and secure.",
	},
];

const AboutUs: React.FC = () => {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-[#23263a]/70 py-16 px-4">
			<div className="max-w-5xl w-full flex flex-col items-center">
				<h1 className="text-4xl font-bold text-[#00ffe7] mb-12 drop-shadow-[0_0_8px_#00ffe7] tracking-widest text-center">
					About Us
				</h1>
				<div className="flex flex-col md:flex-row gap-10 w-full justify-center items-center">
					{team.map((member) => (
						<div
							key={member.name}
							className="relative flex flex-col items-center bg-[#181a23]/70 rounded-2xl shadow-[0_0_32px_#00ffe7aa] p-6 w-full max-w-xs border-2 border-[#00ffe7]/40 passport-card overflow-hidden"
						>
							{/* Passport Photo */}
							<div className="bg-[#23263a] rounded-full p-2 mt-6 mb-4 shadow-md border-4 border-[#00ffe7]/60">
								<img
									src={member.image}
									alt={member.name}
									className="w-28 h-28 rounded-full object-cover border-2 border-[#faafe8]/40"
								/>
							</div>
							{/* Passport Info */}
							<div className="w-full bg-gradient-to-br from-[#23263a]/80 to-[#181a23]/90 rounded-xl p-4 border border-[#00ffe7]/20 shadow-inner flex flex-col items-center relative">
								<h2 className="text-2xl font-bold text-[#00ffe7] mb-1 text-center drop-shadow-[0_0_6px_#00ffe7] tracking-wide">
									{member.name}
								</h2>
								<h3 className="text-lg text-[#faafe8] mb-2 text-center font-mono tracking-widest">
									{member.role}
								</h3>
								<div className="w-10 h-1 bg-[#00ffe7] rounded-full mb-2 opacity-60" />
								<p className="text-[#e0e7ef] text-center text-sm leading-relaxed font-mono">
									{member.bio}
								</p>
							</div>
							{/* Neon HUD corners */}
							<span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#00ffe7] rounded-tl-2xl opacity-60 animate-pulse" />
							<span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#00ffe7] rounded-tr-2xl opacity-60 animate-pulse" />
							<span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#00ffe7] rounded-bl-2xl opacity-60 animate-pulse" />
							<span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#00ffe7] rounded-br-2xl opacity-60 animate-pulse" />
						</div>
					))}
				</div>
			</div>
			{/* .passport-card::before moved to cards.css */}
		</div>
	);
};

export default AboutUs;
