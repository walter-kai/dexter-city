import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BotForSale } from '../models/Bot';
import ShopDetail from './ShopDetail';

const defaultBots: BotForSale[] = [
	{
		id: '1',
		name: 'Crypto Bot',
		description: 'Automates cryptocurrency trades with advanced strategies.',
		price: 299,
		image: `https://robohash.org/crypto-bot`,
	},
	{
		id: '2',
		name: 'Stock Bot',
		description: 'Optimizes stock trades for maximum gains.',
		price: 399,
		image: `https://robohash.org/stock-bot`,
	},
	{
		id: '3',
		name: 'Fantasy Football Bot',
		description: 'Manage your fantasy football league like a pro.',
		price: 199,
		image: `https://robohash.org/fantasy-football-bot`,
	},
];

// interface ShopProps {
//   initialBots?: BotForSale[]; // Optionally provide a custom set of bots
// }

const Shop = () => {
	const { botId } = useParams<{ botId?: string }>(); // Get the botId from the URL
	const navigate = useNavigate();

	// Use initialBots if provided; otherwise, fall back to defaultBots
	const [bots, setBots] = useState<BotForSale[]>(defaultBots);

	const selectedBot = bots.find((bot) => bot.id === botId);

	const handleCloseModal = () => {
		navigate('/shop'); // Navigate back to /shop to close the modal
	};

	const handleOpenModal = (botId: string) => {
		navigate(`/shop/${botId}`); // Navigate to /shop/:botId to open the modal
	};

	return (
		<div className="p-8 bg-[#181a23] min-h-screen">
			<h1 className="text-4xl font-bold text-center mb-8 text-[#00ffe7] drop-shadow-[0_0_8px_#00ffe7]">
				Bot Marketplace
			</h1>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{bots.map((bot) => (
					<div
						key={bot.id}
						className="border border-[#00ffe7]/30 rounded-lg shadow hover:shadow-[0_0_24px_#00ffe7] transition-shadow bg-[#23263a]"
					>
						<img
							src={bot.image}
							alt={bot.name}
							className="w-full rounded-t-lg"
						/>
						<div className="p-4">
							<h2 className="text-xl font-semibold mb-2 text-[#00ffe7]">
								{bot.name}
							</h2>
							<p className="text-[#e0e7ef] mb-4">{bot.description}</p>
							<div className="flex items-center justify-between">
								<span className="text-lg font-bold text-green-400">
									${bot.price}
								</span>
								<button
									onClick={() => handleOpenModal(bot.id)}
									className="bg-[#00ffe7] text-[#181a23] px-4 py-2 rounded hover:bg-[#ff005c] hover:text-white shadow-[0_0_8px_#00ffe7] hover:shadow-[0_0_16px_#ff005c] transition"
								>
									View
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Modal */}
			{selectedBot && (
				<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
					<div className="bg-[#23263a] w-full max-w-3xl rounded-lg p-8 relative border border-[#00ffe7]/30 shadow-[0_0_24px_#00ffe7]">
						{/* Close Button */}
						<button
							onClick={handleCloseModal}
							className="absolute top-4 right-4 bg-[#181a23] p-2 rounded-full hover:bg-[#00ffe7] hover:text-[#181a23] text-[#00ffe7] shadow-[0_0_8px_#00ffe7] transition"
						>
							✕
						</button>
						{/* ShopDetail Component */}
						<ShopDetail bot={selectedBot} />
					</div>
				</div>
			)}
		</div>
	);
};

export default Shop;
