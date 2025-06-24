import React from "react";
import { FaUsers, FaComments, FaBullhorn, FaRobot, FaTelegramPlane } from "react-icons/fa";

const telegramCards = [
  {
    icon: <FaBullhorn className="text-4xl text-[#00ffe7]" />,
    title: "Bulletin Channel",
    desc: "Official news, updates, and announcements.",
    buttonText: "Join Channel",
    href: "https://t.me/+3kbxUgMdGkM2YTY9",
    borderColor: "border-[#00ffe7]/30",
    titleColor: "text-[#00ffe7]",
    buttonColor: "bg-[#00ffe7] hover:bg-[#faafe8]",
    buttonTextColor: "text-[#181a23]",
  },
  {
    icon: <FaComments className="text-4xl text-[#faafe8]" />,
    title: "Group Chat",
    desc: "Meet other users, ask questions, and discuss strategies.",
    buttonText: "Join Group",
    href: "https://t.me/+W1S8xA6ygboyN2Q9",
    borderColor: "border-[#faafe8]/30",
    titleColor: "text-[#faafe8]",
    buttonColor: "bg-[#faafe8] hover:bg-[#00ffe7]",
    buttonTextColor: "text-[#181a23]",
  },
  {
    icon: <FaRobot className="text-4xl text-[#00ffe7]" />,
    title: "@DexterCity_bot",
    desc: "Personal alerts, stats, and settings directly in Telegram.",
    buttonText: "Open Bot",
    href: "https://t.me/DexterCity_bot",
    borderColor: "border-[#00ffe7]/30",
    titleColor: "text-[#00ffe7]",
    buttonColor: "bg-[#00ffe7] hover:bg-[#faafe8]",
    buttonTextColor: "text-[#181a23]",
  },
  {
    icon: <FaUsers className="text-4xl text-[#faafe8]" />,
    title: "Community",
    desc: "Share your bot builds, get help, and participate in events.",
    buttonText: "Get Involved",
    href: "https://t.me/+W1S8xA6ygboyN2Q9",
    borderColor: "border-[#faafe8]/30",
    titleColor: "text-[#faafe8]",
    buttonColor: "bg-[#faafe8] hover:bg-[#00ffe7]",
    buttonTextColor: "text-[#181a23]",
  },
];

const TelegramCard: React.FC = () => (
  <div className="w-full flex flex-col items-center">
    <h1 className="text-4xl font-bold text-[#00ffe7] mb-12 drop-shadow-[0_0_8px_#00ffe7] tracking-widest text-center flex items-center justify-center gap-3 animate-fade-in-up">
      <FaTelegramPlane className="text-[#0088cc] text-5xl" />
      Dexter City on Telegram
    </h1>
    <p className="text-xl text-[#faafe8] mb-12 text-center max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      Telegram is the heart of Dexter City's community. Connect, share, and stay updated with our channels, group, and bot!
    </p>
    <div className="flex flex-col md:flex-row gap-10 w-full justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      {telegramCards.map((card) => (
        <div
          key={card.title}
          className={`relative flex flex-col items-center bg-[#181c23] border-2 ${card.borderColor} rounded-2xl shadow-[0_0_32px_#00ffe7aa] p-6 w-full max-w-xs border-2 border-[#00ffe7]/40 passport-card overflow-hidden`}
        >
          <div className="flex flex-col items-center mb-2">
            <div className="h-20 flex items-center justify-center">
              {card.icon}
            </div>
          </div>
          <div className="flex-1 flex flex-col w-full">
            <h2 className={`text-2xl font-bold ${card.titleColor} mb-2 text-center`}>
              {card.title}
            </h2>
            <div className="text-[#e0e7ef] mb-4 text-center">
              {card.desc}
            </div>
            <div className="mt-auto w-full flex justify-center">
              <a
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-block w-full px-5 py-2 ${card.buttonColor} ${card.buttonTextColor} font-bold rounded-lg shadow hover:bg-[#faafe8] hover:text-[#181a23] transition text-center`}
              >
                {card.buttonText}
              </a>
            </div>
          </div>
          {/* Neon HUD corners */}
          <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#00ffe7] rounded-tl-2xl opacity-60 animate-pulse" />
          <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#00ffe7] rounded-tr-2xl opacity-60 animate-pulse" />
          <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#00ffe7] rounded-bl-2xl opacity-60 animate-pulse" />
          <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#00ffe7] rounded-br-2xl opacity-60 animate-pulse" />
        </div>
      ))}
    </div>
    <style>{`
      .animate-fade-in-up {
        opacity: 0;
        transform: translateY(24px);
        animation: fadeInUp 0.7s cubic-bezier(.4,0,.2,1) forwards;
      }
      @keyframes fadeInUp {
        to {
          opacity: 1;
          transform: none;
        }
      }
      .passport-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(135deg, #23263a 0 2px, #181a23 2px 8px);
        opacity: 0.12;
        z-index: 0;
      }
    `}</style>
  </div>
);

const Telegram: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#23263a]/70 py-16 px-4">
    <div className="max-w-5xl w-full flex flex-col items-center">
      <TelegramCard />
    </div>
  </div>
);

export default Telegram;
