import React from 'react';

interface GuideSectionProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  summary: string;
  detail: React.ReactNode;
}

const GuideSection: React.FC<GuideSectionProps> = ({ id, icon, title, summary, detail }) => {
  return (
    <section
      id={id}
      className="py-4 mb-16 scroll-mt-24 bg-black/80 border border-neon-cyan/30 rounded-xl shadow-lg"
    >
      <div className="flex items-center gap-3 mb-2 border-b border-neon-cyan/30 p-6">
        <span className="text-3xl text-neon-cyan">{icon}</span>
        <h2 className="text-2xl font-bold text-neon-cyan">
          {title}
        </h2>
      </div>
      <p className="text-neon-accent font-semibold mb-2 px-6">{summary}</p>
      <div className="text-neon-light px-6">{detail}</div>
    </section>
  );
};

export default GuideSection;
