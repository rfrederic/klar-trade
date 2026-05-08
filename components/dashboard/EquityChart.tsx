"use client";

import { useState } from "react";

const timeframes = ["1W", "1M", "3M", "6M", "YTD", "1Y", "ALL"];

// Simulated equity curves for different timeframes
const equityData = {
  "1W": [100, 103, 101, 105, 108, 106, 112],
  "1M": [100, 104, 102, 108, 105, 112, 110, 116, 113, 118, 120, 115, 122, 119, 125, 122, 128, 124, 130, 127, 133, 130, 136, 133, 138, 134, 140, 137, 142, 138, 145],
  "3M": Array.from({ length: 90 }, (_, i) => 100 + i * 0.6 + Math.sin(i * 0.3) * 5 + Math.random() * 3),
  "6M": Array.from({ length: 180 }, (_, i) => 100 + i * 0.45 + Math.sin(i * 0.2) * 8 + Math.random() * 4),
  "YTD": Array.from({ length: 365 }, (_, i) => 100 + i * 0.4 + Math.sin(i * 0.15) * 10 + Math.random() * 5),
  "1Y": Array.from({ length: 365 }, (_, i) => 100 + i * 0.38 + Math.sin(i * 0.12) * 12 + Math.random() * 5),
  "ALL": Array.from({ length: 500 }, (_, i) => 100 + i * 0.35 + Math.sin(i * 0.1) * 15 + Math.random() * 6),
};

function buildPath(data: number[], width: number, height: number): string {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height * 0.85 - height * 0.05;
    return `${x},${y}`;
  });
  return `M ${points.join(" L ")}`;
}

export function EquityChart() {
  const [activeFrame, setActiveFrame] = useState("1M");
  const data = equityData[activeFrame as keyof typeof equityData];
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const change = lastValue - firstValue;
  const changePct = ((change / firstValue) * 100).toFixed(2);
  const positive = change >= 0;

  const W = 600;
  const H = 160;
  const linePath = buildPath(data, W, H);
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div>
          <h3 className="text-sm font-semibold text-white">Equity Curve</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-lg font-bold font-display text-white">+$28,480</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${positive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
              {positive ? "+" : ""}{changePct}%
            </span>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveFrame(tf)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all duration-150 ${
                activeFrame === tf
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "text-slate-600 hover:text-slate-400"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-5 py-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: "180px" }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={positive ? "#6366f1" : "#f43f5e"} stopOpacity="0.35" />
              <stop offset="100%" stopColor={positive ? "#6366f1" : "#f43f5e"} stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1="0" y1={H * f}
              x2={W} y2={H * f}
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#chartGrad)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={positive ? "#6366f1" : "#f43f5e"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        </svg>
      </div>
    </div>
  );
}
