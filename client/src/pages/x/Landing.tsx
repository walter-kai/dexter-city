import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSDK } from "@metamask/sdk-react";
import LoadingScreenDots from '../../components/common/LoadingScreenDots';
import { Player } from '@lottiefiles/react-lottie-player';
import RandomRobohashCard from '../../components/common/RandomRobohashCard';
import { FaBars } from 'react-icons/fa';
import LoginModal from '@/components/common/LoginModal';

// LandingNav component for the ticker
interface Coin {
    item: {
        id: string;
        name: string;
        symbol: string;
        thumb: string;
    };
}

const TickerBar: React.FC = () => {
    const [trendingCoins, setTrendingCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrendingCoins = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                setTrendingCoins(data.coins);
            } catch (error) {
                console.error("Failed to fetch trending coins:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrendingCoins();
    }, []);

    const marqueeStyle = `
        @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 60s linear infinite;
            will-change: transform;
        }
    `;

    return (
        <>
            <style>{marqueeStyle}</style>
            <div className="bg-black/50 backdrop-blur-sm h-12 w-full fixed top-0 z-50 overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap items-center h-full">
                    {loading ? (
                        <span className="text-white px-4">Loading trending tokens...</span>
                    ) : (
                        (trendingCoins.length > 0 ? [...trendingCoins, ...trendingCoins] : []).map((coin, index) => (
                            <div key={index} className="flex items-center mx-4">
                                <img src={coin.item.thumb} alt={coin.item.name} className="h-6 w-6 mr-2 rounded-full" />
                                <span className="text-white font-semibold">{coin.item.name} ({coin.item.symbol.toUpperCase()})</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};


const landingFeatures = [
    {
        icon: "/icons/landing/decentralized.svg",
        title: "Decentralized Bot Trading",
        description: (<span>Trade directly to and from <span className="text-[#00ffe7]">your</span> Metamask wallet, not from a centralized exchange.</span>)
    },
    {
        icon: "/icons/landing/lock.svg",
        title: "Secure Uniswap Integration",
        description: (<span>Native Uniswap integrations use token standard <span className="text-[#00ffe7]">ERC-6909</span> to secure your investment.</span>)
    },
    {
        icon: "/icons/landing/buySell.svg",
        title: "Buy and Sell Bot Strategies",
        description: (<span>Get started with existing strategies or <span className="text-[#00ffe7]">monetize</span> your expertise.</span>)
    }
];

const Landing: React.FC = () => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showFooterMenu, setShowFooterMenu] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { connecting, connected } = useSDK();
    const { user } = useAuth();

    const handleEnterClick = () => {
        if (user && connected) {
            navigate('/i/dashboard');
        } else {
            setShowLoginModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowLoginModal(false);
    };

    // Close on outside click or after 10 seconds
    useEffect(() => {
        if (!showFooterMenu) return;
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowFooterMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        const timeout = setTimeout(() => setShowFooterMenu(false), 10000);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            clearTimeout(timeout);
        };
    }, [showFooterMenu]);

    return (
        <>
            <TickerBar />

            {/* HUD Foreground Content */}
            <div className="relative z-10 flex flex-col items-center justify-center pt-24 pb-32">
                <div className="z-20 backdrop-blur-lg mx-auto flex flex-col items-center ">
                    {/* HUD Video Game Background */}
                    <div className="relative z-20 backdrop-blur-lg mx-auto px-8 flex flex-col items-center">
                        {/* Lottie Background Docked Right */}
                        <div className="absolute w-full inset-y-0 right-0 sm:right-[2%] md:right-[4%] lg:right-[8%] flex items-center justify-end pointer-events-none select-none -z-10">
                            <Player
                                src="/lottie/blackBlocks.json"
                                className="w-full h-full object-cover drop-shadow-[0_0_24px] opacity-40"
                                loop
                                autoplay
                                speed={1}
                            />
                        </div>
                        <div className="flex w-full gap-8">
                            {/* Features grid docked right, vertically aligned */}
                            <div className="flex flex-col w-3/5 bg-black rounded-xl p-8 shadow-[0_0_10px_#faafe8]">
                                <div className="gap-8 w-full flex flex-col">
                                    {landingFeatures.map((feature, index) => (
                                        <div
                                            key={index}
                                            className="bg-[#23263a] p-4 rounded-xl border border-[#00ffe7]/30 z-10 hover:shadow-[0_0_32px_rgba(0,255,231,0.25)] transition-all duration-300 flex items-center text-left"
                                        >
                                            <div className="flex items-center justify-center gap-2 w-1/3 min-w-[300px]">
                                                <div className='flex items-center justify-center bg-[#2e3147] rounded-full p-3 px-5 shadow-lg'>
                                                    <img src={feature.icon} alt={`${feature.title} icon`} className="h-16 w-16" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-[#00ffe7] text-center">{feature.title}</h3>
                                            </div>
                                            {/* Divider */}
                                            <div className="h-16 border-l border-[#00ffe7]/30 mx-6" />
                                            <p className="text-[#e0e7ef] text-lg flex-grow">{feature.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* DexterCity header vertically centered, docked right */}
                            <div className='flex flex-col items-center justify-center w-2/5 space-y-6 bg-black/75 rounded-xl shadow-[0_0_10px_#faafe8]'>
                                <p
                                    className="font-dafoe absolute top-16 right-[350px] text-[#faafe8] text-5xl max-w-2xl mx-auto text-center -rotate-12"
                                    style={{ textShadow: "0 0 12px #faafe8" }}
                                >
                                    Welcome to
                                </p>
                                <img src="/logos/dexter3d.svg" className="h-28 mx-auto mb-4 drop-shadow-[0_0_16px_#00ffe7]" alt="DexterCity" />
                                <span
                                    className="neon-text text-7xl tracking-widest font-savate mb-2 text-center"
                                >
                                    D<span className='text-5xl'>EXTER</span>C<span className='text-5xl'>ITY</span>
                                </span>
                                <p className="text-[#faafe8] text-2xl max-w-2xl mx-auto mb-8 text-center" style={{ textShadow: "0 0 12px #faafe8" }}>
                                    Trading bots on the Ethereum Blockchain
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Bottom HUD Navigation Bar */}
            <div className="fixed bottom-0 left-0 w-full z-30 flex justify-center items-center gap-6 py-4 bg-black/60 backdrop-blur-md border-t border-[#00ffe7]/20">
                <button
                    onClick={() => navigate('/x/blog')}
                    className="btn-green px-8 py-3 text-lg font-bold rounded-xl shadow-[0_0_12px_#00ffe7]"
                >
                    Blog
                </button>
                <button
                    onClick={() => navigate('/x/guide')}
                    className="btn-green px-8 py-3 text-lg font-bold rounded-xl shadow-[0_0_12px_#00ffe7]"
                >
                    Guide
                </button>
                <button
                    onClick={handleEnterClick}
                    disabled={connecting}
                    className="btn-special px-10 py-4"
                >
                    {connecting ? <LoadingScreenDots size={5} /> : 'Enter DexterCity'}
                </button>
                {/* Start Menu Button */}
                <button
                    className="fixed bottom-6 left-6 z-40 bg-[#23263a] border border-[#00ffe7]/40 rounded-full p-4 shadow-lg hover:bg-[#181a23] transition"
                    onClick={() => setShowFooterMenu(v => !v)}
                    aria-label="Open Start Menu"
                >
                    <FaBars className="text-[#00ffe7] text-2xl" />
                </button>
            </div>
            {/* Drop-up Start Menu Footer */}
            {showFooterMenu && (
                <div ref={menuRef} className="fixed left-6 bottom-24 z-50 w-80 bg-[#181a23]/95 border border-[#00ffe7]/30 rounded-2xl shadow-2xl p-6 animate-fadeInUp">
                    <img src="/logos/dexter3d.svg" className="h-10 mb-4" alt="DexterCity" />
                    <p className="text-[#e0e7ef] text-sm mb-4">Trading made easy in the city.</p>
                    <p className="text-[#e0e7ef] text-sm mb-4">© 2025 DexterCity. All rights reserved.</p>
                    <div className="mb-4">
                        <h3 className="text-[#00ffe7] font-bold mb-2">Quick Links</h3>
                        <div className="space-y-2">
                            <a href="https://docs.dextercity.com/whitepaper" target="_blank" rel="noopener noreferrer" className="flex items-center text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">
                                Whitepaper <span className="ml-1">↗</span>
                            </a>
                            <button onClick={() => {navigate('/x/guide'); setShowFooterMenu(false);}} className="block text-left w-full text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">Guide</button>
                            <button onClick={() => {navigate('/x/contact'); setShowFooterMenu(false);}} className="block text-left w-full text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">Contact us</button>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-[#00ffe7] font-bold mb-2">Legal</h3>
                        <div className="space-y-2">
                            <button onClick={() => {navigate('/legal/privacy-policy'); setShowFooterMenu(false);}} className="block text-left w-full text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">Privacy Policy</button>
                            <button onClick={() => {navigate('/legal/terms-of-service'); setShowFooterMenu(false);}} className="block text-left w-full text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">Terms of Service</button>
                            <button onClick={() => {navigate('/x/blog'); setShowFooterMenu(false);}} className="block text-left w-full text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">Blog</button>
                        </div>
                    </div>
                </div>
            )}
            <LoginModal 
                isOpen={showLoginModal} 
                onClose={handleCloseModal} 
            />
        </>
    );
};

export default Landing;
