import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BotForSale } from '../models/Bot';
import { BotConfig } from '../models/Bot';
import ShopDetail from '../components/shop/BuyBotModal';
import SellBotModal from '../components/shop/SellBotModal';
import BuyingTab from '../components/shop/BuyingTab';
import SellingTab from '../components/shop/SellingTab';
import ShoppingCartModal from '../components/shop/ShoppingCartModal';
import CheckoutModal from '../components/shop/CheckoutModal';
import { FaTimes, FaShoppingCart, FaTag } from 'react-icons/fa';

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
	const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');
	const [bots] = useState(defaultBots);
	const [myBots, setMyBots] = useState<BotConfig[]>([]);
	const [myListings, setMyListings] = useState<any[]>([]);
	const [user, setUser] = useState<{ walletId: string } | null>(null);
	const [showSellModal, setShowSellModal] = useState(false);
	const [selectedBotToSell, setSelectedBotToSell] = useState<BotConfig | null>(null);
	const [cart, setCart] = useState<typeof defaultBots>([]);
	const [showCart, setShowCart] = useState(false);
	const [showCheckout, setShowCheckout] = useState(false);
	const [riskFilter, setRiskFilter] = useState<number | null>(null);
	const [search, setSearch] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
	const [priceRange, setPriceRange] = useState<[number, number]>([MIN, MAX]);
	const [dragging, setDragging] = useState<null | 'min' | 'max'>(null);

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

	useEffect(() => {
		const storedUser = sessionStorage.getItem('currentUser');
		if (storedUser && storedUser !== 'undefined') {
			const parsedUser = JSON.parse(storedUser);
			setUser(parsedUser);
		}
	}, []);

	useEffect(() => {
		const fetchMyBots = async () => {
			if (!user?.walletId) return;

			try {
				const response = await fetch(`/api/bot/mine?walletId=${user.walletId}`);
				if (response.ok) {
					const data = await response.json();
					setMyBots(data);
				}
			} catch (error) {
				console.error('Error fetching my bots:', error);
			}
		};

		fetchMyBots();
	}, [user]);

	const handleSellBot = (bot: BotConfig) => {
		setSelectedBotToSell(bot);
		setShowSellModal(true);
	};

	const handleSellSubmit = (listingData: any) => {
		const newListing = {
			id: Date.now().toString(),
			bot: selectedBotToSell,
			...listingData,
			listedDate: new Date().toISOString()
		};
		setMyListings([...myListings, newListing]);
		setShowSellModal(false);
		setSelectedBotToSell(null);
		alert('Bot listed for sale successfully!');
	};

	const handleRemoveListing = (listingId: string) => {
		setMyListings(myListings.filter(listing => listing.id !== listingId));
	};

	return (
		<div className="min-h-screen bg-transparent flex flex-col items-center pt-20 pb-8 font-lato">
			<div className="w-full max-w-[1600px] mx-auto px-2">
				<div className="flex items-center justify-between mb-6">
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

				{/* Tab Navigation */}
				<div className="flex justify-center gap-2 mb-6">
					<button
						onClick={() => setActiveTab('buying')}
						className={`px-6 py-3 rounded-lg font-bold border-2 transition-all duration-200 ${
							activeTab === 'buying'
								? 'bg-[#00ffe7] text-[#181a23] border-[#00ffe7] shadow-[0_0_8px_#00ffe7]'
								: 'bg-[#23263a] text-[#e0e7ef] border-[#00ffe7]/40 hover:bg-[#00ffe7]/20'
						}`}
					>
						<FaShoppingCart className="inline mr-2" />
						BUYING
					</button>
					<button
						onClick={() => setActiveTab('selling')}
						className={`px-6 py-3 rounded-lg font-bold border-2 transition-all duration-200 ${
							activeTab === 'selling'
								? 'bg-[#00ffe7] text-[#181a23] border-[#00ffe7] shadow-[0_0_8px_#00ffe7]'
								: 'bg-[#23263a] text-[#e0e7ef] border-[#00ffe7]/40 hover:bg-[#00ffe7]/20'
						}`}
					>
						<FaTag className="inline mr-2" />
						SELLING
					</button>
				</div>

				{/* Tab Content */}
				{activeTab === 'buying' ? (
					<BuyingTab
						filteredBotsWithRemoved={filteredBotsWithRemoved}
						currency={currency}
						onOpenModal={handleOpenModal}
						onAddToCart={handleAddToCart}
						search={search}
						setSearch={setSearch}
						riskFilter={riskFilter}
						setRiskFilter={setRiskFilter}
						priceRange={priceRange}
						setPriceRange={setPriceRange}
						categoryFilter={categoryFilter}
						setCategoryFilter={setCategoryFilter}
						allCategories={allCategories}
						dragging={dragging}
						setDragging={setDragging}
						MIN={MIN}
						MAX={MAX}
					/>
				) : (
					<SellingTab
						myBots={myBots}
						myListings={myListings}
						onSellBot={handleSellBot}
						onRemoveListing={handleRemoveListing}
					/>
				)}
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

			<ShoppingCartModal
				isOpen={showCart}
				onClose={() => setShowCart(false)}
				cart={cart}
				currency={currency}
				onRemoveFromCart={handleRemoveFromCart}
				onCheckout={handleCheckout}
			/>

			<CheckoutModal
				isOpen={showCheckout}
				onClose={handleCloseCheckout}
			/>

			{/* Sell Bot Modal */}
			{showSellModal && selectedBotToSell && (
				<SellBotModal
					bot={selectedBotToSell}
					onClose={() => {
						setShowSellModal(false);
						setSelectedBotToSell(null);
					}}
					onSubmit={handleSellSubmit}
				/>
			)}
		</div>
	);
};

export default Shop;
