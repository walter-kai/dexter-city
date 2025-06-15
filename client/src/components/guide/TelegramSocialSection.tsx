import React from "react";
import { FaUsers, FaComments, FaBullhorn, FaRobot, FaTelegramPlane } from "react-icons/fa";

const TelegramSocialSection: React.FC = () => (
  <section className="my-12 p-8 bg-[#23263a]/90 border border-[#00ffe7]/30 rounded-xl shadow-lg">
    <h2 className="text-2xl font-bold text-[#00ffe7] mb-4 flex items-center gap-2">
      <FaTelegramPlane className="text-[#0088cc]" />
      Dexter City on Telegram: Social & Community
    </h2>
    <p className="mb-4 text-neon-light">
      Telegram is the heart of Dexter City's community. Connect, share, and stay updated:
    </p>
    <ul className="mb-4 space-y-2">
      <li className="flex items-center gap-2">
        <FaBullhorn className="text-[#00ffe7]" />
        <span>
          <b>Bulletin Channel:</b> Official news, updates, and announcements.
        </span>
      </li>
      <li className="flex items-center gap-2">
        <FaComments className="text-[#00ffe7]" />
        <span>
          <b>Group Chat:</b> Meet other users, ask questions, and discuss strategies.
        </span>
      </li>
      <li className="flex items-center gap-2">
        <FaRobot className="text-[#00ffe7]" />
        <span>
          <b>@DexterCity_bot:</b> Personal alerts, stats, and settings directly in Telegram.
        </span>
      </li>
      <li className="flex items-center gap-2">
        <FaUsers className="text-[#00ffe7]" />
        <span>
          <b>Community:</b> Share your bot builds, get help, and participate in events.
        </span>
      </li>
    </ul>
    <div className="flex flex-wrap gap-3">
      <a
        href="https://t.me/+3kbxUgMdGkM2YTY9"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#00ffe7] text-[#181a23] font-bold py-2 px-6 rounded hover:bg-[#ff005c] hover:text-white transition"
      >
        <FaBullhorn />
        Bulletin Channel
      </a>
      <a
        href="https://t.me/+W1S8xA6ygboyN2Q9"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#00ffe7] text-[#181a23] font-bold py-2 px-6 rounded hover:bg-[#ff005c] hover:text-white transition"
      >
        <FaComments />
        Group Chat
      </a>
      <a
        href="https://t.me/DexterCity_bot"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#00ffe7] text-[#181a23] font-bold py-2 px-6 rounded hover:bg-[#ff005c] hover:text-white transition"
      >
        <FaRobot />
        @DexterCity_bot
      </a>
    </div>
  </section>
);

export default TelegramSocialSection;
