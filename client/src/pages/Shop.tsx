import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BotForSale } from '../models/Bot';
import ShopDetail from './ShopDetail';
import { FaEye, FaTimes, FaShoppingCart, FaCheckCircle, FaSearch, FaFilter } from 'react-icons/fa';

// Helper to generate random bots
const categoriesList = [
	['Crypto', 'Arbitrage', 'AI'],
	['Stocks', 'Swing', 'ML'],
	['Fantasy', 'Sports', 'Automation'],
	['NFT', 'Sniper', 'DeFi'],
	['Options', 'Momentum', 'Quant'],
	['Forex', 'Scalping', 'Trend'],
];
const botNames = [
	'Crypto Bot', 'Stock Bot', 'Fantasy Football Bot', 'NFT Sniper', 'Options Wizard', 'Forex Falcon',
	'Momentum Master', 'Trend Tracker', 'DeFi Defender', 'Arbiter', 'Swing King', 'AI Alpha',
	'Sports Guru', 'SniperX', 'Quantum', 'ScalpPro', 'Yield Farmer', 'Pump Hunter', 'BearBot',
	'BullBot', 'Grid Genius', 'Hedge Hog', 'Flash Trader', 'AutoPilot', 'SmartBot', 'Risk Ranger',
	'Profit Pilot', 'Trade Titan', 'Alpha Wolf', 'Beta Bot', 'Gamma Guru', 'Delta Dealer',
	'Omega Operator', 'Sigma Sniper', 'Theta Thinker', 'Lambda Logic'
];
function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
const defaultBots: (BotForSale & {
	stats: { trades: number; winRate: number; uptime: number };
	categories: string[];
	risk: number;
})[] = Array.from({ length: 36 }).map((_, i) => {
	const name = botNames[i % botNames.length];
	const categories = categoriesList[i % categoriesList.length];
	return {
		id: (i + 1).toString(),
		name,
		description: `This is ${name}, your automated trading assistant for ${categories.join(', ')}.`,
		price: getRandomInt(99, 499),
		image: `https://robohash.org/${encodeURIComponent(name)}?size=120x120`,
		stats: {
			trades: getRandomInt(100, 5000),
			winRate: getRandomInt(60, 99),
			uptime: parseFloat((Math.random() * 5 + 95).toFixed(1)),
		},
		categories,
		risk: getRandomInt(1, 5),
	};
});
const currency = 'DCX';
const allCategories = Array.from(new Set(categoriesList.flat()));
function clamp(val: number, min: number, max: number) {
	return Math.max(min, Math.min(max, val));
}

const MIN = 99;
const MAX = 499;

const Shop = () => {
	const { botId } = useParams<{ botId?: string }>();
	const navigate = useNavigate();
	const [bots] = useState(defaultBots);
	const [cart, setCart] = useState<typeof defaultBots>([]);
	const [showCart, setShowCart] = useState(false);
	const [showCheckout, setShowCheckout] = useState(false);
	const [riskFilter, setRiskFilter] = useState<number | null>(null);
	const [search, setSearch] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
	const [priceRange, setPriceRange] = useState<[number, number]>([MIN, MAX]);
	const sliderTrack = useRef<HTMLDivElement>(null);

	const selectedBot = bots.find((bot) => bot.id === botId);

	const handleCloseModal = () => navigate('/shop');
	const handleOpenModal = (botId: string) => navigate(`/shop/${botId}`);
	const handleAddToCart = (bot: typeof defaultBots[0]) => {
		if (!cart.find((b) => b.id === bot.id)) setCart([...cart, bot]);
		setShowCart(true);
	};
	const handleRemoveFromCart = (botId: string) => setCart(cart.filter((b) => b.id !== botId));
	const handleCheckout = () => { setShowCart(false); setShowCheckout(true); };
	const handleCloseCheckout = () => { setShowCheckout(false); setCart([]); };

	const renderRiskMeter = (risk: number) => (
		<div className="flex items-center gap-0.5">
			{[1, 2, 3, 4, 5].map((lvl) => (
				<div
					key={lvl}
					className={`w-2 h-2 rounded-full border ${
						lvl <= risk
							? lvl >= 4
								? 'bg-red-500 border-red-400'
								: lvl === 3
								? 'bg-yellow-400 border-yellow-300'
								: 'bg-green-400 border-green-300'
							: 'bg-gray-700 border-gray-500'
					}`}
				/>
			))}
			<span className="ml-1 text-[10px] text-[#e0e7ef]">Risk: {risk}/5</span>
		</div>
	);

	// Filtering logic
	const filteredBots = bots.filter(bot =>
		(!riskFilter || bot.risk === riskFilter) &&
		bot.price >= priceRange[0] &&
		bot.price <= priceRange[1] &&
		(search === '' || bot.name.toLowerCase().includes(search.toLowerCase())) &&
		(categoryFilter.length === 0 || categoryFilter.every(cat => bot.categories.includes(cat)))
	);
	const filteredBotsWithRemoved = filteredBots.filter((_, idx) => idx !== 0 && idx !== 6);

	// --- Custom Double Knob Slider Logic ---
	const [dragging, setDragging] = useState<null | 'min' | 'max'>(null);

	const getPercent = (val: number) => ((val - MIN) / (MAX - MIN)) * 100;

	const handleSliderMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
		e.preventDefault();
		setDragging(type);
	};

	const handleSliderMouseMove = (e: MouseEvent) => {
		if (!sliderTrack.current || !dragging) return;
		const rect = sliderTrack.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percent = clamp(x / rect.width, 0, 1);
		const value = Math.round(percent * (MAX - MIN) + MIN);

		if (dragging === 'min') {
			const newMin = clamp(value, MIN, priceRange[1] - 1);
			setPriceRange([newMin, priceRange[1]]);
		} else if (dragging === 'max') {
			const newMax = clamp(value, priceRange[0] + 1, MAX);
			setPriceRange([priceRange[0], newMax]);
		}
	};

	const handleSliderMouseUp = () => setDragging(null);

	React.useEffect(() => {
		if (dragging) {
			window.addEventListener('mousemove', handleSliderMouseMove);
			window.addEventListener('mouseup', handleSliderMouseUp);
			return () => {
				window.removeEventListener('mousemove', handleSliderMouseMove);
				window.removeEventListener('mouseup', handleSliderMouseUp);
			};
		}
	}, [dragging, priceRange]);

	return (
		<div className="min-h-screen bg-transparent flex flex-col items-center pt-20 pb-8 font-lato">
			<div className="w-full max-w-[1600px] mx-auto px-2">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-3xl font-extrabold text-[#00ffe7] drop-shadow-[0_0_8px_#00ffe7] tracking-widest hud-title">
						BOT MARKETPLACE
					</h1>
					<button
						className="relative hud-bar bg-[#00ffe7]/30 border border-[#00ffe7] rounded px-3 py-1 shadow-[0_0_12px_#00ffe7] text-[#181a23] font-bold text-base uppercase tracking-wider flex items-center gap-1"
						onClick={() => setShowCart(true)}
					>
						<FaShoppingCart className="text-[#00ffe7]" />
						<span className="text-[#00ffe7]">CART</span>
						<span className="text-green-400">{cart.length}</span>
					</button>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
					{/* Filter panel replaces the first card (top-left) */}
					<div className="col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-1 row-span-2 flex flex-col justify-center items-center">
						<div className="w-full h-full flex flex-col justify-center items-center">
							<div className="p-3 h-full w-full bg-[#23263a]/80 border border-[#00ffe7]/20 rounded-xl shadow-[0_0_8px_#00ffe7] flex flex-col gap-3 items-center">
								<div className="flex items-center gap-2 w-full">
									<FaSearch className="text-[#00ffe7]" />
									<input
										type="text"
										placeholder="Search name..."
										value={search}
										onChange={e => setSearch(e.target.value)}
										className="bg-[#181a23] border border-[#00ffe7]/20 rounded px-2 py-1 text-[#e0e7ef] focus:outline-none w-full"
									/>
								</div>
								<div className="flex items-center gap-2 w-full">
									<FaFilter className="text-[#00ffe7]" />
									<span className="text-[#e0e7ef] text-xs">Risk:</span>
									<select
										value={riskFilter ?? ''}
										onChange={e => setRiskFilter(e.target.value ? Number(e.target.value) : null)}
										className="bg-[#181a23] border border-[#00ffe7]/20 rounded px-2 py-1 text-[#e0e7ef] w-full"
									>
										<option value="">All</option>
										{[1, 2, 3, 4, 5].map(risk => (
											<option key={risk} value={risk}>{risk}</option>
										))}
									</select>
								</div>
								{/* True double-knob price range slider */}
								<div className="flex flex-col gap-1 w-full">
									<span className="text-[#e0e7ef] text-xs mb-1">Price Range:</span>
									<div className="relative w-full h-12 flex flex-col justify-center select-none">
										<div
											ref={sliderTrack}
											className="relative w-full h-2 mt-5 bg-[#181a23] rounded"
											style={{ cursor: 'pointer' }}
											onMouseDown={e => {
												// Allow clicking on the track to move the closest knob
												const rect = sliderTrack.current!.getBoundingClientRect();
												const x = e.clientX - rect.left;
												const percent = clamp(x / rect.width, 0, 1);
												const value = Math.round(percent * (MAX - MIN) + MIN);
												const distToMin = Math.abs(value - priceRange[0]);
												const distToMax = Math.abs(value - priceRange[1]);
												if (distToMin < distToMax) {
													setPriceRange([clamp(value, MIN, priceRange[1] - 1), priceRange[1]]);
													setDragging('min');
												} else {
													setPriceRange([priceRange[0], clamp(value, priceRange[0] + 1, MAX)]);
													setDragging('max');
												}
											}}
										>
											<div
												className="absolute h-2 bg-[#00ffe7] rounded"
												style={{
													left: `${getPercent(priceRange[0])}%`,
													width: `${getPercent(priceRange[1]) - getPercent(priceRange[0])}%`,
												}}
											/>
											{/* Min handle */}
											<div
												className="absolute w-4 h-4 bg-[#00ffe7] border-2 border-[#fff] rounded-full shadow -top-1 cursor-pointer"
												style={{
													left: `calc(${getPercent(priceRange[0])}% - 8px)`,
													zIndex: dragging === 'min' ? 50 : 40,
												}}
												onMouseDown={handleSliderMouseDown('min')}
											/>
											{/* Max handle */}
											<div
												className="absolute w-4 h-4 bg-[#ff005c] border-2 border-[#fff] rounded-full shadow -top-1 cursor-pointer"
												style={{
													left: `calc(${getPercent(priceRange[1])}% - 8px)`,
													zIndex: dragging === 'max' ? 50 : 40,
												}}
												onMouseDown={handleSliderMouseDown('max')}
											/>
										</div>
										<div className="absolute w-full flex justify-between top-9 text-xs text-[#00ffe7] pointer-events-none z-0">
											<span>{priceRange[0]}</span>
											<span>{priceRange[1]}</span>
										</div>
									</div>
								</div>
								<div className="flex flex-wrap gap-1 w-full">
									<span className="text-[#e0e7ef] text-xs">Categories:</span>
									{allCategories.map(cat => (
										<button
											key={cat}
											onClick={() =>
												setCategoryFilter(categoryFilter.includes(cat)
													? categoryFilter.filter(c => c !== cat)
													: [...categoryFilter, cat])
											}
											className={`px-2 py-1 rounded text-xs font-bold border ${
												categoryFilter.includes(cat)
													? 'bg-[#00ffe7] text-[#181a23] border-[#00ffe7]'
													: 'bg-[#181a23] text-[#00ffe7] border-[#00ffe7]/30'
											} transition`}
										>
											{cat}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>
					{/* Cards, skipping the first (idx 0) and seventh (idx 6) */}
					{filteredBotsWithRemoved.map((bot, idx) => (
						<div
							key={bot.id}
							className="relative group bg-[#181a23]/80 border-2 border-[#00ffe7]/30 rounded-xl shadow-[0_0_12px_#00ffe7] hover:shadow-[0_0_24px_#ff005c] transition-shadow overflow-hidden hud-panel p-2 flex flex-col items-center"
							style={{ minHeight: 260 }}
						>
							<img
								src={bot.image}
								alt={bot.name}
								className="w-16 h-16 object-cover rounded-full border-2 border-[#00ffe7]/30 shadow-[0_0_8px_#00ffe7] mb-1"
							/>
							<h2 className="text-base font-bold text-[#00ffe7] tracking-wide mb-0.5 text-center">
								{bot.name}
							</h2>
							<div className="flex flex-wrap gap-1 mb-1 justify-center">
								{bot.categories.map((cat) => (
									<span
										key={cat}
										className="bg-[#00ffe7]/10 text-[#00ffe7] px-1 py-0.5 rounded text-[10px] font-bold border border-[#00ffe7]/20"
									>
										{cat}
									</span>
								))}
							</div>
							{renderRiskMeter(bot.risk)}
							<p className="text-[#e0e7ef] text-xs my-1 text-center line-clamp-2">
								{bot.description}
							</p>
							<div className="flex flex-col gap-0.5 w-full mt-auto">
								<div className="flex justify-between text-[10px] text-[#e0e7ef]">
									<span>Trades</span>
									<span className="font-bold">{bot.stats.trades}</span>
								</div>
								<div className="flex justify-between text-[10px] text-[#e0e7ef]">
									<span>Win</span>
									<span className="font-bold">{bot.stats.winRate}%</span>
								</div>
								<div className="flex justify-between text-[10px] text-[#e0e7ef]">
									<span>Uptime</span>
									<span className="font-bold">{bot.stats.uptime}%</span>
								</div>
							</div>
							<div className="flex items-center justify-between mt-1 w-full">
								<span className="text-base font-extrabold text-green-400 drop-shadow-[0_0_4px_#00ffe7]">
									{bot.price}{' '}
									<span className="text-[#00ffe7]">{currency}</span>
								</span>
								<div className="flex gap-1">
									<button
										onClick={() => handleOpenModal(bot.id)}
										className="hud-btn flex items-center gap-1 bg-[#00ffe7] text-[#181a23] px-2 py-1 rounded font-bold uppercase shadow-[0_0_4px_#00ffe7] hover:bg-[#ff005c] hover:text-white hover:shadow-[0_0_8px_#ff005c] transition-all border border-[#00ffe7] text-xs"
									>
										<FaEye />
									</button>
									<button
										onClick={() => handleAddToCart(bot)}
										className="hud-btn flex items-center gap-1 bg-green-400 text-[#181a23] px-2 py-1 rounded font-bold uppercase shadow-[0_0_4px_#00ffe7] hover:bg-green-600 hover:text-white hover:shadow-[0_0_8px_#00ffe7] transition-all border border-green-400 text-xs"
									>
										<FaShoppingCart />
									</button>
								</div>
							</div>
							<div className="absolute inset-0 pointer-events-none border border-[#00ffe7]/20 rounded-xl hud-glow"></div>
						</div>
					))}
				</div>
			</div>
			{/* Modal */}
			{selectedBot && (
				<div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
					<div className="bg-[#23263a] w-full max-w-3xl rounded-2xl p-10 relative border-4 border-[#00ffe7]/40 shadow-[0_0_48px_#00ffe7] hud-panel">
						<button
							onClick={handleCloseModal}
							className="absolute top-6 right-6 bg-[#181a23] p-3 rounded-full hover:bg-[#00ffe7] hover:text-[#181a23] text-[#00ffe7] shadow-[0_0_8px_#00ffe7] border-2 border-[#00ffe7] transition-all text-2xl"
							aria-label="Close"
						>
							<FaTimes />
						</button>
						<ShopDetail bot={selectedBot} />
					</div>
				</div>
			)}
			{/* Shopping Cart Modal */}
			{showCart && (
				<div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
					<div className="bg-[#23263a] w-full max-w-md rounded-2xl p-8 relative border-4 border-[#00ffe7]/40 shadow-[0_0_48px_#00ffe7] hud-panel">
						<button
							onClick={() => setShowCart(false)}
							className="absolute top-4 right-4 bg-[#181a23] p-2 rounded-full hover:bg-[#00ffe7] hover:text-[#181a23] text-[#00ffe7] border-2 border-[#00ffe7] transition-all text-xl"
							aria-label="Close"
						>
							<FaTimes />
						</button>
						<h2 className="text-2xl font-bold text-[#00ffe7] mb-4 flex items-center gap-2">
							<FaShoppingCart /> Shopping Cart
						</h2>
						{cart.length === 0 ? (
							<div className="text-[#e0e7ef] text-center py-8">
								Your cart is empty.
							</div>
						) : (
							<>
								<ul className="divide-y divide-[#00ffe7]/20 mb-4">
									{cart.map((bot) => (
										<li
											key={bot.id}
											className="flex items-center justify-between py-2"
										>
											<div className="flex items-center gap-2">
												<img
													src={bot.image}
													alt={bot.name}
													className="w-10 h-10 rounded-full border-2 border-[#00ffe7]/40"
												/>
												<span className="text-[#00ffe7] font-bold">
													{bot.name}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-green-400 font-bold">
													{bot.price} {currency}
												</span>
												<button
													onClick={() => handleRemoveFromCart(bot.id)}
													className="text-[#ff005c] hover:text-red-600 text-lg"
													aria-label="Remove"
												>
													<FaTimes />
												</button>
											</div>
										</li>
									))}
								</ul>
								<div className="flex justify-between items-center mb-4">
									<span className="text-[#e0e7ef] font-bold">Total:</span>
									<span className="text-green-400 font-bold text-lg">
										{cart.reduce((sum, b) => sum + b.price, 0)} {currency}
									</span>
								</div>
								<button
									onClick={handleCheckout}
									className="w-full hud-btn flex items-center justify-center gap-2 bg-[#00ffe7] text-[#181a23] px-4 py-3 rounded-lg font-bold uppercase shadow-[0_0_8px_#00ffe7] hover:bg-[#ff005c] hover:text-white hover:shadow-[0_0_16px_#ff005c] transition-all border-2 border-[#00ffe7] text-lg"
								>
									<FaCheckCircle />
									Checkout
								</button>
							</>
						)}
					</div>
				</div>
			)}
			{/* Checkout Modal */}
			{showCheckout && (
				<div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
					<div className="bg-[#23263a] w-full max-w-md rounded-2xl p-10 relative border-4 border-[#00ffe7]/40 shadow-[0_0_48px_#00ffe7] hud-panel flex flex-col items-center">
						<button
							onClick={handleCloseCheckout}
							className="absolute top-4 right-4 bg-[#181a23] p-2 rounded-full hover:bg-[#00ffe7] hover:text-[#181a23] text-[#00ffe7] border-2 border-[#00ffe7] transition-all text-xl"
							aria-label="Close"
						>
							<FaTimes />
						</button>
						<FaCheckCircle className="text-green-400 text-5xl mb-4" />
						<h2 className="text-2xl font-bold text-[#00ffe7] mb-2">
							Checkout Complete!
						</h2>
						<div className="text-[#e0e7ef] text-center mb-4">
							Thank you for your purchase.
							<br />
							Your bots will be available in your{' '}
							<span className="text-[#00ffe7] font-bold">Garage</span>.
						</div>
						<button
							onClick={handleCloseCheckout}
							className="hud-btn bg-[#00ffe7] text-[#181a23] px-6 py-2 rounded-lg font-bold uppercase shadow-[0_0_8px_#00ffe7] hover:bg-[#ff005c] hover:text-white hover:shadow-[0_0_16px_#ff005c] transition-all border-2 border-[#00ffe7] text-lg"
						>
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default Shop;
