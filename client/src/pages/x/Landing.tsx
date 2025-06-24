import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthContext';
import { useSDK } from "@metamask/sdk-react";
import LoadingScreenDots from '../../components/common/LoadingScreenDots';
import { Player } from '@lottiefiles/react-lottie-player';
import RandomRobohashCard from '../../components/common/RandomRobohashCard';
import { FaBars, FaChevronCircleDown, FaChevronCircleRight, FaChevronCircleUp } from 'react-icons/fa';
import TickerBar from '../../components/common/TickerBar';

const landingFeatures = [
    {
        icon: "/icons/landing/decentralized.svg",
        title: "Automated and decentralized trading, directly on the Ethereum blockchain",
        color: "text-[#00ffe7]"
    },
    {
        icon: "/icons/landing/lock.svg",
        title: "Direct and secure transactions through Uniswap's trading pools",
        color: "text-[#faafe8]"
    },
    {
        icon: "/icons/landing/buySell.svg",
        title: "Sell your strategies and get commissions off each trade",
        color: "text-[#ffb347]"
    }
];

const LandingPage: React.FC = () => {
    const [showFooterMenu, setShowFooterMenu] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const toggleButtonRef = React.useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();
    const { connecting, connected } = useSDK();
    const { user, triggerLoginModal } = useAuth();

    const handleEnterClick = () => {
        if (user && connected) {
            navigate('/i/dashboard');
        } else {
            triggerLoginModal();
        }
    };

    // Close on outside click or after 10 seconds
    useEffect(() => {
        if (!showFooterMenu) return;
        const handleClick = (e: MouseEvent) => {
            if (
                (menuRef.current && menuRef.current.contains(e.target as Node)) ||
                (toggleButtonRef.current && toggleButtonRef.current.contains(e.target as Node))
            ) {
                return;
            }
            setShowFooterMenu(false);
        };
        document.addEventListener('mousedown', handleClick);
        const timeout = setTimeout(() => setShowFooterMenu(false), 20000);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            clearTimeout(timeout);
        };
    }, [showFooterMenu]);

    return (
        <>
            {/* HUD Foreground Content */}
            {/* <TickerBar /> */}
            <div className="relative z-10 flex flex-col flex-1 min-h-screen px-4 py-16 ">
                <div className="z-20 backdrop-blur-lg mx-auto flex flex-col items-center justify-center w-full h-full min-h-[80vh]">
                    {/* HUD Video Game Background */}
                    <div className="relative z-20 backdrop-blur-lg mx-auto px-8 flex flex-col items-center justify-center w-full h-full">
                        {/* Lottie Background Docked Right */}
                        <div className="absolute inset-y-0 right-0 sm:right-[2%] md:right-[4%] lg:right-[8%] flex items-center justify-end pointer-events-none select-none -z-10">
                            <Player
                                src="/lottie/blackBlocks.json"
                                className="w-full h-full object-cover drop-shadow-[0_0_24px] opacity-40"
                                loop
                                autoplay
                                speed={1}
                            />
                        </div>
                        <div className="flex gap-8 w-full items-center justify-center">
                            {/* Features grid docked right, vertically aligned */}
                            <div className="flex flex-col w-3/5 bg-black rounded-xl p-8 shadow-[0_0_10px_#faafe8] justify-center">
                                <div className="gap-8 w-full flex flex-col justify-center">
                                    {landingFeatures.map((feature, index) => (
                                        <div
                                            key={index}
                                            className="bg-[#23263a] p-4 rounded-xl border border-[#00ffe7]/30 z-10 hover:shadow-[0_0_32px_rgba(0,255,231,0.25)] transition-all duration-300 flex items-center text-left"
                                        >
                                            <div className="flex items-center justify-center gap-2 w-1/3 min-w-[100px]">
                                                <div className='flex items-center justify-center bg-[#2e3147] rounded-full p-3 px-5 shadow-lg'>
                                                    <img src={feature.icon} alt={`${feature.title} icon`} className="h-16 w-16" />
                                                </div>
                                            </div>
                                            {/* Divider */}
                                            <div className="h-16 border-l border-[#00ffe7]/30 mx-6" />
                                            {/* Title with color and fading transition */}
                                            <h3
                                                className={`text-2xl font-bold ${feature.color} text-center flex-grow fadein-slidein`}
                                                style={{ animationDelay: `${index * 0.3 + 0.2}s` }}
                                            >
                                                {feature.title}
                                            </h3>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Dexter Cityheader vertically centered, docked right */}
                            <div className='flex flex-col items-center justify-center w-2/5 p-10 space-y-6 bg-black/75 rounded-xl shadow-[0_0_10px_#faafe8]'>
                                {/* Group Welcome and Logo together */}
                                <div className="relative flex flex-col items-center justify-center w-full">
                                    <p
                                        className="font-dafoe absolute z-10 left-3 top-0 text-[#faafe8] text-5xl max-w-2xl mx-auto text-center -rotate-12"
                                        style={{ textShadow: "0 0 12px #faafe8" }}
                                    >
                                        Welcome to
                                    </p>
                                    <img src="/logos/dexter3d.svg" className="h-28 mx-auto drop-shadow-[0_0_16px_#00ffe7]" alt="DexterCity" />
                                </div>
                                <span
                                    className="neon-text text-7xl tracking-widest font-savate mb-2 text-center"
                                >
                                    D<span className='text-5xl'>EXTER</span>C<span className='text-5xl'>ITY</span>
                                </span>
                                <p className="text-[#faafe8] text-2xl max-w-2xl mx-auto mb-8 text-center" style={{ textShadow: "0 0 12px #faafe8" }}>
                                    Trading bots on the Ethereum Blockchain
                                </p>
                                <button
                                    onClick={handleEnterClick}
                                    disabled={connecting}
                                    className="btn-special px-10 py-4"
                                >
                                    {connecting ? <LoadingScreenDots size={5} /> : 'Enter the city'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Bottom HUD Navigation Bar removed, now handled in App.tsx */}

        </>
    );
};

export default LandingPage;
