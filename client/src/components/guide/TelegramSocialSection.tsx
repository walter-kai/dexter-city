import React from "react";
import { FaComments, FaBullhorn, FaRobot, FaTelegramPlane, FaExternalLinkAlt, FaUsers } from "react-icons/fa";

interface TelegramSocialSectionProps {
  asModal?: boolean;
}

const telegramCards = [
  {
    icon: <FaBullhorn className="text-2xl text-[#00ffe7]" />,
    title: "Bulletin Channel",
    description: "Official news, updates, and announcements.",
    href: "https://t.me/+3kbxUgMdGkM2YTY9",
    button: "Bulletin Channel",
  },
  {
    icon: <FaComments className="text-2xl text-[#00ffe7]" />,
    title: "Group Chat",
    description: "Meet other users, ask questions, and discuss strategies.",
    href: "https://t.me/+W1S8xA6ygboyN2Q9",
    button: "Group Chat",
  },
  {
    icon: <FaRobot className="text-2xl text-[#00ffe7]" />,
    title: "@DexterCity_bot",
    description: "Personal alerts, stats, and settings directly in Telegram.",
    href: "https://t.me/DexterCity_bot",
    button: "@DexterCity_bot",
  },
];

const TelegramSocialSection: React.FC<TelegramSocialSectionProps> = ({ asModal }) => (
  <section
    className={`${
      asModal
        ? "p-0 bg-transparent border-0 shadow-none rounded-none "
        : "my-12 p-8 bg-[#23263a]/90 border border-[#00ffe7]/30 rounded-xl shadow-lg"
    }`}
  >
    <h2 className={`text-2xl font-bold text-[#00ffe7] mb-8 flex items-center gap-2 justify-center text-3xl`}>
      <FaTelegramPlane className="text-[#0088cc]" />
      Dexter City on Telegram
    </h2>
    <div className="flex flex-col md:flex-row gap-6 justify-center">
      {telegramCards.map((card) => (
        <div
          key={card.title}
          className="flex flex-col justify-between border border-[#00ffe7]/30 rounded-xl bg-[#23263a]/90 shadow-lg p-6 w-full md:w-80 min-w-[240px] max-w-xs"
        >
          <div className="flex items-center gap-3 mb-2">
            {card.icon}
            <span className="text-lg font-bold text-[#00ffe7]">{card.title}</span>
          </div>
          <div className="mb-4 text-neon-light">{card.description}</div>
          <a
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#00ffe7] text-[#181a23] font-bold py-2 px-4 rounded-lg text-base shadow hover:bg-[#ff005c] hover:text-white transition-all duration-200 mt-auto"
          >
            {card.button}
            <FaExternalLinkAlt className="ml-1 text-xs" />
          </a>
        </div>
      ))}
    </div>
  </section>
);

export default TelegramSocialSection;
