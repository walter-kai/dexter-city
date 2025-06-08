import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="mb-4 relative">
      <div className="bg-[#181a23]/50 border border-[#00ffe7]/20 rounded-lg overflow-hidden hover:border-[#00ffe7]/40 transition-all duration-300">
        <button
          onClick={onToggle}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-[#00ffe7]/10 transition-all duration-200"
        >
          <h4 className="font-semibold text-[#00ffe7] text-lg pr-4">{question}</h4>
          <div className="flex-shrink-0 text-[#00ffe7]">
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        </button>
      </div>
      
      <div 
        className={`absolute top-full left-0 right-0 z-10 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
        }}
      >
        <div className="bg-[#181a23] border border-[#00ffe7]/20 rounded-lg mt-1 shadow-lg">
          <div className="p-4">
            <p className="text-[#e0e7ef] leading-relaxed">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const faqs = [
  {
    question: "Which blockchain are you on?",
    answer: "We are proudly built on the Uniswap v4 architecture. We have partnered with them to deliver a trading bot platform that is intuitive, easy to use, has the lowest gas fees possible, and is 100% decentralized. As opposed to CEX like Coinbase and Binance, there might be plans for the Raydium/Solana network in the future.",
  },
  {
    question: "What are your fees?",
    answer: "Dexter City issues an income tax on all Dexterian Bots. The City will take a 15% commission. Unless they are leased by the shop, then the city only takes 5% with the creator taking 10%. We don't make money on losses, but the bots only sell on a profit anyway.",
  },
  {
    question: "How to choose the trading pair?",
    answer: "Follow us on Twitter and Telegram where we will post updates on hot pairs of the week/month. Our community actively shares insights on the most profitable trading opportunities.",
  },
  {
    question: "Can I modify my bot's strategy after deployment?",
    answer: "Yes! You can inject new strategies, adjust parameters, or deploy reinforcement bots during active trading sessions through our dynamic strategy management system. Users may strike, reinforce, liquidate, or close positions as needed.",
  },
  {
    question: "How secure are my funds?",
    answer: "Your funds are carried directly through to the Uniswap v4 smart contract. Direct access to the blockchain makes it a true DEX, free from any manipulation. The smart contract for Dexter City is here (placeholder) and should be clear on its process.",
  },
];

interface FAQSectionProps {
  faqs?: Array<{ question: string; answer: string }>;
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs: propFaqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqsToRender = propFaqs || faqs;

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq" className="bg-[#23263a]/90 border border-[#00ffe7]/30 rounded-xl shadow-lg p-8 mb-12 hover:shadow-[0_0_32px_rgba(0,255,231,0.2)] transition-all duration-300">
      <h2 className="text-3xl font-bold text-[#00ffe7] mb-8 text-center drop-shadow-[0_0_8px_#00ffe7]">
        ❓ Frequently Asked Questions
      </h2>
      {faqsToRender.map((faq, idx) => (
        <FAQItem 
          key={idx} 
          question={faq.question}
          answer={faq.answer}
          isOpen={openIndex === idx}
          onToggle={() => handleToggle(idx)}
        />
      ))}
    </div>
  );
};

export default FAQSection;
