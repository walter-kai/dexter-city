import React from 'react';
import { FaShopify, FaTools, FaChartLine, FaTrophy, FaReact, FaEthereum } from "react-icons/fa";

export const sections = [
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

export const faqs = [
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

export const heroLines = [
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
  <div className="btn-standard text-center">Metamask Login</div>,
  <div className="btn-standard text-center">Dexterian Marketplace</div>,
  <div className="btn-standard text-center">Bot Garage</div>,
];
