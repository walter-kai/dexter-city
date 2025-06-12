import React, { useState, useEffect, useRef } from 'react';
import { gettingStartedSteps } from './Features';

const GetStarted: React.FC = () => {
  const [strategyLevel, setStrategyLevel] = useState(50);
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Generate strategy description based on level
  const getStrategyDescription = (level: number) => {
    if (level < 25) return "Conservative: Lower risk, fewer trades, larger safety gaps";
    if (level < 50) return "Balanced Conservative: Moderate risk with safety-first approach";
    if (level < 75) return "Balanced Aggressive: Higher frequency trades with controlled risk";
    return "Aggressive: Maximum frequency, tighter gaps, higher potential returns";
  };

  // Generate robohash seed based on strategy level
  const getStrategyRobohash = (level: number) => {
    const seeds = ["conservative-bot", "balanced-safe", "balanced-aggro", "aggressive-trader", "extreme-dca"];
    const index = Math.floor(level / 20);
    return `https://robohash.org/${seeds[index] || seeds[0]}?set=set1&size=200x200`;
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = stepRefs.current.findIndex(ref => ref === entry.target);
          if (index !== -1 && entry.isIntersecting) {
            setVisibleSteps(prev => {
              const newVisible = [...prev];
              newVisible[index] = true;
              return newVisible;
            });
          }
        });
      },
      { threshold: 0.2, rootMargin: '100px 0px' } // Added rootMargin for earlier trigger
    );

    stepRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={sectionRef}
      id="getting-started" 
      className="bg-[#23263a]/70 border border-[#00ffe7]/30 rounded-xl shadow-lg p-8 mb-12 hover:shadow-[0_0_32px_rgba(0,255,231,0.2)] transition-all duration-300"
    >
      <h2 className="text-3xl font-bold text-[#00ffe7] mb-8 text-center drop-shadow-[0_0_8px_#00ffe7] opacity-0 animate-fade-in-up">
        🚀 Getting Started with DexterCity
      </h2>
      
      <div className="space-y-8">
        {gettingStartedSteps.map((step, index) => (
          <div 
            key={step.step}
            ref={el => stepRefs.current[index] = el}
            className={`flex items-start gap-6 p-6 bg-[#181a23]/50 rounded-lg border border-[#00ffe7]/20 hover:border-[#00ffe7]/40 transition-all duration-700 ${
              visibleSteps[index] 
                ? index % 2 === 0 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-100 translate-x-0'
                : index % 2 === 0 
                  ? 'opacity-0 -translate-x-16' 
                  : 'opacity-0 translate-x-16'
            }`}
            style={{
              transitionDelay: `${index * 200}ms`
            }}
          >
            <div className={`flex-shrink-0 transition-all duration-500 ${
              visibleSteps[index] ? 'scale-100 rotate-0' : 'scale-75 rotate-45'
            }`}>
              <div className="w-16 h-16 bg-[#00ffe7] text-[#181a23] rounded-full flex items-center justify-center text-2xl font-bold shadow-[0_0_16px_#00ffe7]">
                {step.step}
              </div>
            </div>
            <div className="flex-1">
              <div className={`flex items-center gap-3 mb-3 transition-all duration-500 ${
                visibleSteps[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <div className="text-2xl text-[#00ffe7]">{step.icon}</div>
                <h3 className="text-xl font-bold text-[#00ffe7]">{step.title}</h3>
              </div>
              <p className={`text-[#faafe8] mb-4 text-lg transition-all duration-500 ${
                visibleSteps[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} style={{ transitionDelay: `${100}ms` }}>
                {step.description}
              </p>
              <div className={`transition-all duration-500 ${
                visibleSteps[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`} style={{ transitionDelay: `${200}ms` }}>
                {step.detail}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Slider */}
      <div className="bg-[#181a23]/70 p-6 rounded-lg border border-[#00ffe7]/30 mt-8 opacity-0 animate-fade-in-scale" style={{ animationDelay: '0.3s' }}>
        <h3 className="text-xl font-bold text-[#00ffe7] mb-4 text-center">DCA Strategy Selector</h3>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span>Conservative</span>
              <span>Aggressive</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={strategyLevel}
              onChange={(e) => setStrategyLevel(Number(e.target.value))}
              className="w-full h-2 bg-neon-dark rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #00ffe7 0%, #00ffe7 ${strategyLevel}%, #374151 ${strategyLevel}%, #374151 100%)`
              }}
            />
            <div className="text-center mt-2 text-[#00ffe7] font-semibold">
              {getStrategyDescription(strategyLevel)}
            </div>
          </div>
          <div className="flex-shrink-0">
            <img
              src={getStrategyRobohash(strategyLevel)}
              alt="Strategy Bot"
              className="w-24 h-24 rounded-lg border-2 border-[#00ffe7] shadow-md bg-neon-darker transition-all duration-300"
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-neon-light">
          <p><strong>Commission System:</strong> DexterCity operates on a performance-based commission structure. We only earn when your bots are profitable, aligning our success with yours.</p>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
