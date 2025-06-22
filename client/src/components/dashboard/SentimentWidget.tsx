import React, { useEffect, useState } from "react";
import axios from "axios";
import { SentimentTopic } from "../../../../models/Talkwalker";
import LoadingScreenDots from "../common/LoadingScreenDots";

const COLORS = {
  POSITIVE: "#00ffe7",
  NEUTRAL: "#e0e7ef",
  NEGATIVE: "#ff4d6d"
};

const GAUGE_BG = "#232834";
const GAUGE_RING = "#00ffe7";
const GAUGE_RING_BG = "#1a1e25";
const GAUGE_SHADOW = "0 0 16px #00ffe7, 0 0 32px #00ffe7";
const PANEL_SHADOW = "0 0 24px #00ffe755, 0 0 4px #00ffe7aa";

const EMOJIS = {
  POSITIVE: "🤖",
  NEUTRAL: "🛰️",
  NEGATIVE: "💀"
};

type TokenInfo = {
  name: string;
  symbol: string;
  id?: number;
  logo?: string;
  price?: number;
  circulating_supply?: number;
  quote?: { USD?: { price?: number } };
  [key: string]: any;
};

const getCmcLogo = (id?: number) =>
  id ? `https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png` : undefined;

const SentimentGauge: React.FC<{
  percent: number[];
  dominant: string;
}> = ({ percent, dominant }) => {
  // Gauge is a segmented ring with neon glow, robotic style
  const total = 100;
  const radius = 16;
  const stroke = 4;
  const c = 2 * Math.PI * radius;
  const segs = [
    { color: COLORS.POSITIVE, val: percent[0] },
    { color: COLORS.NEUTRAL, val: percent[1] },
    { color: COLORS.NEGATIVE, val: percent[2] }
  ];
  let offset = 0;
  return (
    <svg
      viewBox="0 0 44 44"
      width={88}
      height={88}
      style={{
        filter: "drop-shadow(0 0 8px rgba(255, 0, 0, 0.8))",
        background: GAUGE_BG,
        borderRadius: "50%",
        boxShadow: GAUGE_SHADOW
      }}
    >
      {/* Background ring */}
      <circle
        cx={22}
        cy={22}
        r={radius + stroke / 2}
        fill="none"
        stroke={GAUGE_RING_BG}
        strokeWidth={stroke + 2}
      />
      {/* Segments */}
      {segs.map((seg, i) => {
        const dash = (seg.val / total) * c;
        const segEl = (
          <circle
            key={i}
            cx={22}
            cy={22}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-offset}
            style={{
              filter: `drop-shadow(0 0 6px ${seg.color})`
            }}
            strokeLinecap="round"
          />
        );
        offset += dash;
        return segEl;
      })}
      {/* Futuristic ticks */}
      {[...Array(12)].map((_, i) => (
        <rect
          key={i}
          x={21}
          y={3}
          width={2}
          height={4}
          rx={1}
          fill="#000000"
          opacity={i % 3 === 0 ? 0.7 : 0.25}
          transform={`rotate(${i * 30} 22 22)`}
        />
      ))}
      {/* Center HUD */}
      <circle
        cx={22}
        cy={22}
        r={10}
        fill="#10131a"
        stroke={GAUGE_RING}
        strokeWidth={1.5}
        style={{ filter: "drop-shadow(0 0 4px #00ffe7)" }}
      />
      <text
        x="22"
        y="27"
        textAnchor="middle"
        fontSize="18"
        fontWeight="bold"
        fill="#00ffe7"
        style={{ textShadow: "0 0 8px #00ffe7" }}
      >
        {EMOJIS[dominant as keyof typeof EMOJIS]}
      </text>
    </svg>
  );
};

const SentimentWidget: React.FC = () => {
  const [topics, setTopics] = useState<SentimentTopic[]>([]);
  const [tokenInfo, setTokenInfo] = useState<Record<string, TokenInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get<{ success: boolean; data: SentimentTopic[] }>("/api/sentiment/all")
      .then(async res => {
        setTopics(res.data.data);
        const tokenResults: Record<string, TokenInfo> = {};
        await Promise.all(res.data.data.map(async (topic) => {
          try {
            const tokenRes = await axios.get(`/api/chain/cmc/tokens/${topic.id}`);
            const arr = Array.isArray(tokenRes.data?.id) ? tokenRes.data.id : [];
            let best = arr[0];
            for (const t of arr) {
              if (
                typeof t.circulating_supply === "number" &&
                (!best || t.circulating_supply > (best.circulating_supply || 0))
              ) {
                best = t;
              }
            }
            if (best && best.id) {
              best.logo = getCmcLogo(best.id);
              tokenResults[topic.id] = { ...best, logo: best.logo };
            } else {
              tokenResults[topic.id] = { name: topic.topic_name, symbol: topic.id };
            }
          } catch {
            tokenResults[topic.id] = { name: topic.topic_name, symbol: topic.id };
          }
        }));
        setTokenInfo(tokenResults);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        className="bg-[#181c23] rounded-xl p-6 flex flex-col items-center shadow-lg min-h-[300px]"
        style={{ boxShadow: PANEL_SHADOW }}
      >
        <div className="text-[#00ffe7] text-lg font-bold mb-2 tracking-widest">SENTIMENT HUD</div>
        <div className="flex-1 flex items-center justify-center">
          <LoadingScreenDots />
        </div>
      </div>
    );
  }

  const labels = ["POSITIVE", "NEUTRAL", "NEGATIVE"];

  return (
    <div
      className="bg-[#181c23] rounded-xl p-6 flex flex-col items-center shadow-lg min-h-[300px] w-full"
      style={{ boxShadow: PANEL_SHADOW }}
    >
      <div className="text-[#00ffe7] text-lg font-bold mb-4 tracking-widest text-center">
        MARKET SENTIMENT PANEL
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
        {topics.map((topic) => {
          const last = topic.histogram.data[topic.histogram.data.length - 1];
          const values = last?.v || [0, 0, 0];
          const total = values.reduce((a, b) => a + b, 0) || 1;
          const percent = values.map(v => Math.round((v / total) * 100));
          const dominantIdx = percent.indexOf(Math.max(...percent));
          const dominant = labels[dominantIdx];
          const token = tokenInfo[topic.id] || {};
          return (
            <div
              key={topic.id}
              className="flex flex-col items-center bg-[#10131a] rounded-lg p-4 border-2 border-[#00ffe7] shadow-md"
              style={{
                boxShadow: "0 0 16px #00ffe744, 0 0 2px #00ffe7aa",
                minHeight: 260
              }}
            >
              {/* Token info and topic */}
              <div className="flex flex-row items-center gap-3 mb-2">
                {token.logo ? (
                  <img
                    src={token.logo}
                    alt={token.name || topic.topic_name}
                    className="w-10 h-10 rounded-full border border-[#00ffe7] shadow"
                    style={{ boxShadow: "0 0 8px #00ffe7" }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#181c23] flex items-center justify-center text-2xl border border-[#00ffe7]">
                    {topic.topic_name[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-bold text-[#00ffe7] text-base drop-shadow-[0_0_6px_#00ffe7]">
                    {token.name || topic.topic_name}
                  </div>
                  <div className="text-xs text-[#e0e7ef] uppercase tracking-widest">
                    {token.symbol || topic.id}
                  </div>
                  {token.quote?.USD?.price !== undefined && (
                    <div className="text-xs text-[#6c7383]">
                      ${token.quote.USD.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </div>
                  )}
                  {token.circulating_supply !== undefined && (
                    <div className="text-xs text-[#6c7383]">
                      Supply: {token.circulating_supply.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              {/* Gauge */}
              <div className="flex flex-col items-center w-full">
                <SentimentGauge percent={percent} dominant={dominant} />
                <div className="flex flex-row gap-3 mt-2">
                  {labels.map((label, i) => (
                    <div key={label} className="flex flex-col items-center">
                      <span
                        className="text-lg"
                        style={{ color: COLORS[label as keyof typeof COLORS], textShadow: "0 0 6px #00ffe7" }}
                      >
                        {EMOJIS[label as keyof typeof EMOJIS]}
                      </span>
                      <span className="font-bold text-[#e0e7ef]">{percent[i]}%</span>
                      <span className="text-xs text-[#6c7383]">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-[#00ffe7] text-center w-full font-mono tracking-wide">
                  {dominant === "POSITIVE" && "VIBES: OPTIMAL 🚀"}
                  {dominant === "NEUTRAL" && "VIBES: STABLE 😎"}
                  {dominant === "NEGATIVE" && "VIBES: ALERT! 😬"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SentimentWidget;
