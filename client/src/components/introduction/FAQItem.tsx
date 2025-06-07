import React from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => (
  <div className="mb-4">
    <h4 className="font-semibold text-[#00ffe7]">{question}</h4>
    <p className="text-[#e0e7ef]">{answer}</p>
  </div>
);

export default FAQItem;
