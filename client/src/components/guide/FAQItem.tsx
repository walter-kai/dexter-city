import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 relative">
      <div className="bg-[#181a23]/50 border border-[#00ffe7]/20 rounded-lg overflow-hidden hover:border-[#00ffe7]/40 transition-all duration-300">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-[#00ffe7]/10 transition-all duration-200"
        >
          <h4 className="font-semibold text-[#00ffe7] text-lg pr-4">{question}</h4>
          <div className="flex-shrink-0 text-[#00ffe7]">
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        </button>
      </div>
      
      {/* Absolute positioned dropdown */}
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

export default FAQItem;
