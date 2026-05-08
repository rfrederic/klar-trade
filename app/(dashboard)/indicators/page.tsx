"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import {
  Plus, Search, Star, Download, Eye, Settings, Code, Layers, Sliders,
  ChevronRight, BarChart2, TrendingUp, Zap, Globe, Lock, MoreHorizontal,
  Play, Bell, Trash2, Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const myIndicators = [
  { name: "VWAP Deviation Bands", type: "overlay", mode: "no-code", active: true, starred: true },
  { name: "Session Kill Zones", type: "overlay", mode: "pine", active: true, starred: false },
  { name: "Cumulative Delta Momentum", type: "lower", mode: "js", active: false, starred: true },
  { name: "London Open Range", type: "overlay", mode: "no-code", active: true, starred: false },
];

const publicLibrary = [
  { name: "Klar Volume Profile", author: "KlarTrade", downloads: 4821, stars: 312, type: "overlay", tag: "official" },
  { name: "Smart Money Concepts", author: "SMC_trader", downloads: 9203, stars: 841, type: "overlay", tag: "popular" },
  { name: "Momentum Divergence", author: "quant_fx", downloads: 2104, stars: 178, type: "lower", tag: "" },
  { name: "HTF Bias Cloud", author: "nq_scalper", downloads: 3441, stars: 229, type: "overlay", tag: "popular" },
  { name: "Klar Order Flow", author: "KlarTrade", downloads: 6012, stars: 501, type: "lower", tag: "official" },
  { name: "Liquidity Sweep Detector", author: "liq_hunter", downloads: 1830, stars: 143, type: "overlay", tag: "" },
];

const noCodeBlocks = [
  { label: "Price", color: "#03588C" },
  { label: "Volume", color: "#4BA3D4" },
  { label: "EMA", color: "#22C55E" },
  { label: "RSI", color: "#D9CA82" },
  { label: "ATR", color: "#6B7280" },
  { label: "VWAP", color: "#03588C" },
  { label: "Compare", color: "#6B7280" },
  { label: "Cross", color: "#22C55E" },
  { label: "Offset", color: "#6B7280" },
  { label: "Plot", color: "#D9CA82" },
  { label: "Alert", color: "#EF4444" },
  { label: "Color", color: "#6B7280" },
];

const defaultPineScript = `// KlarTrade — Custom Indicator
//@version=5
indicator("My Indicator", overlay=true)

// Inputs
length = input.int(20, "Length", minval=1)
src = input.source(close, "Source")

// Calculation
ma = ta.ema(src, length)
upper = ma + ta.atr(length) * 1.5
lower = ma - ta.atr(length) * 1.5

// Plots
plot(ma, "MA", color=color.new(color.blue, 0), linewidth=2)
p1 = plot(upper, "Upper", color=color.new(color.green, 50))
p2 = plot(lower, "Lower", color=color.new(color.red, 50))
fill(p1, p2, color=color.new(color.blue, 90))
`;

const defaultJsScript = `// KlarTrade — JavaScript Indicator
// Access: klar.price, klar.volume, klar.high, klar.low, klar.close

const length = inputs.length || 20;

function calculate(bars) {
  const result = [];
  for (let i = length; i < bars.length; i++) {
    const slice = bars.slice(i - length, i);
    const avg = slice.reduce((s, b) => s + b.close, 0) / length;
    result.push({ value: avg, time: bars[i].time });
  }
  return result;
}

module.exports = { calculate, type: "overlay" };
`;

type BuilderMode = "no-code" | "pine" | "js";
type ActiveTab = "my" | "library";

export default function IndicatorsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("my");
  const [builderMode, setBuilderMode] = useState<BuilderMode>("no-code");
  const [search, setSearch] = useState("");
  const [selectedIndicator, setSelectedIndicator] = useState(myIndicators[0]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [starred, setStarred] = useState<Record<string, boolean>>({});
  const [indicatorName, setIndicatorName] = useState("New Indicator");
  const [indicatorType, setIndicatorType] = useState<"overlay" | "lower">("overlay");
  const [connectedCanvas, setConnectedCanvas] = useState<string[]>(["Trading", "Backtesting"]);

  const filteredLibrary = publicLibrary.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header
        title="Indicators"
        subtitle="Build, import, and manage custom indicators."
        action={
          <Button size="sm" onClick={() => setShowBuilder(true)}>
            <Plus className="w-3.5 h-3.5" />
            New Indicator
          </Button>
        }
      />

      <AnimatePresence mode="wait">
        {showBuilder ? (
          <motion.div
            key="builder"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex overflow-hidden"
          >
            {/* Builder main area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Builder toolbar */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] bg-[#06080f] flex-shrink-0">
                <button
                  onClick={() => setShowBuilder(false)}
                  className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors text-sm flex items-center gap-1"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Back
                </button>
                <div className="w-px h-4 bg-white/[0.08]" />
                <input
                  value={indicatorName}
                  onChange={(e) => setIndicatorName(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-[#F2F0EB] focus:outline-none min-w-0"
                />
                <div className="flex-1" />
                <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                  {([
                    { mode: "no-code" as BuilderMode, label: "No-Code", icon: <Layers className="w-3.5 h-3.5" /> },
                    { mode: "pine" as BuilderMode, label: "Pine Script", icon: <Code className="w-3.5 h-3.5" /> },
                    { mode: "js" as BuilderMode, label: "JavaScript", icon: <Zap className="w-3.5 h-3.5" /> },
                  ]).map(({ mode, label, icon }) => (
                    <button
                      key={mode}
                      onClick={() => setBuilderMode(mode)}
                      className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        builderMode === mode ? "bg-[#03588C] text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#03588C] text-white text-xs font-semibold hover:bg-[#024a77] transition-all shadow-glow-xs">
                  <Play className="w-3.5 h-3.5" /> Run
                </button>
              </div>

              {/* Builder canvas */}
              <div className="flex-1 overflow-hidden flex">
                {builderMode === "no-code" ? (
                  <div className="flex-1 flex flex-col">
                    {/* Blocks palette */}
                    <div className="border-b border-white/[0.05] px-4 py-2.5 bg-[#06080f] flex items-center gap-2 overflow-x-auto">
                      <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide flex-shrink-0">Blocks:</span>
                      {noCodeBlocks.map((block) => (
                        <button
                          key={block.label}
                          draggable
                          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-grab active:cursor-grabbing"
                          style={{ borderColor: block.color + "40", color: block.color, background: block.color + "15" }}
                        >
                          {block.label}
                        </button>
                      ))}
                    </div>

                    {/* Canvas drop zone */}
                    <div className="flex-1 relative overflow-auto bg-[#050508]"
                      style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-[#03588C]/20 border border-[#03588C]/30 flex items-center justify-center mx-auto">
                            <Layers className="w-6 h-6 text-[#4BA3D4]" />
                          </div>
                          <p className="text-sm text-[#6B7280]">Drag blocks here to build your indicator</p>
                          <p className="text-xs text-[#6B7280]/60">Connect blocks to define the calculation flow</p>
                        </div>
                      </div>

                      {/* Example connected blocks */}
                      <div className="absolute top-16 left-12 flex items-center gap-0">
                        <div className="px-4 py-2.5 rounded-xl border bg-[#03588C]/15 border-[#03588C]/30 text-xs font-semibold text-[#4BA3D4] shadow-glow-xs">
                          Price (Close)
                        </div>
                        <div className="w-8 h-px bg-[#03588C]/50 relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#03588C]" />
                        </div>
                        <div className="px-4 py-2.5 rounded-xl border bg-[#22C55E]/15 border-[#22C55E]/30 text-xs font-semibold text-[#22C55E]">
                          EMA (20)
                        </div>
                        <div className="w-8 h-px bg-[#22C55E]/50 relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#22C55E]" />
                        </div>
                        <div className="px-4 py-2.5 rounded-xl border bg-[#D9CA82]/15 border-[#D9CA82]/30 text-xs font-semibold text-[#D9CA82]">
                          Plot
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Code editors */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-auto bg-[#050508] p-4">
                      <pre className="text-xs leading-6 text-[#F2F0EB] font-mono">
                        <textarea
                          className="w-full h-full min-h-[400px] bg-transparent text-xs text-[#F2F0EB] font-mono leading-6 focus:outline-none resize-none"
                          defaultValue={builderMode === "pine" ? defaultPineScript : defaultJsScript}
                          spellCheck={false}
                        />
                      </pre>
                    </div>
                    {/* Console */}
                    <div className="h-24 border-t border-white/[0.05] bg-[#06080f] p-3 overflow-auto">
                      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Console</p>
                      <p className="text-[11px] text-[#22C55E] font-mono">✓ Compiled successfully</p>
                      <p className="text-[11px] text-[#6B7280] font-mono">Calculated 1,248 bars in 12ms</p>
                    </div>
                  </div>
                )}

                {/* Right settings panel */}
                <div className="w-56 flex-shrink-0 border-l border-white/[0.05] bg-[#06080f] overflow-y-auto p-4 space-y-4">
                  <div>
                    <label className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Type</label>
                    <div className="flex gap-1">
                      {(["overlay", "lower"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setIndicatorType(t)}
                          className={cn("flex-1 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all",
                            indicatorType === t ? "bg-[#03588C] text-white" : "bg-white/[0.04] text-[#6B7280] hover:text-[#F2F0EB]")}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Line Color</label>
                    <div className="flex gap-1.5">
                      {["#03588C", "#22C55E", "#D9CA82", "#EF4444", "#4BA3D4", "#F59E0B"].map((c) => (
                        <button key={c} className="w-5 h-5 rounded-full border-2 border-transparent hover:border-white/40 transition-all"
                          style={{ background: c }} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Line Width</label>
                    <input type="range" min={1} max={5} defaultValue={2} className="w-full accent-[#03588C]" />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Show On</label>
                    <div className="space-y-1">
                      {["Trading", "Backtesting"].map((c) => (
                        <button
                          key={c}
                          onClick={() => setConnectedCanvas((prev) =>
                            prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                          )}
                          className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs border transition-all",
                            connectedCanvas.includes(c)
                              ? "bg-[#03588C]/15 border-[#03588C]/30 text-[#4BA3D4]"
                              : "bg-white/[0.04] border-white/[0.08] text-[#6B7280]")}
                        >
                          <div className={cn("w-3 h-3 rounded border flex items-center justify-center",
                            connectedCanvas.includes(c) ? "bg-[#03588C] border-[#03588C]" : "border-white/20")}>
                            {connectedCanvas.includes(c) && <div className="w-1.5 h-1 border-b border-r border-white transform rotate-45 -translate-y-px" />}
                          </div>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Alerts</label>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-[#6B7280] hover:text-[#F2F0EB] transition-all">
                      <Bell className="w-3.5 h-3.5" /> Add Alert Condition
                    </button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                    <button className="w-full py-2 rounded-xl bg-[#03588C] text-white text-xs font-semibold hover:bg-[#024a77] transition-all shadow-glow-xs">
                      Save &amp; Apply
                    </button>
                    <button className="w-full py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-[#6B7280] hover:text-[#F2F0EB] transition-all flex items-center justify-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> Publish to Library
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex overflow-hidden"
          >
            {/* Left — indicator list */}
            <div className="w-72 flex-shrink-0 border-r border-white/[0.05] flex flex-col bg-[#06080f]">
              <div className="p-3 border-b border-white/[0.05]">
                <div className="flex gap-1 mb-3">
                  <button
                    onClick={() => setActiveTab("my")}
                    className={cn("flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
                      activeTab === "my" ? "bg-[#03588C] text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}
                  >
                    My Indicators
                  </button>
                  <button
                    onClick={() => setActiveTab("library")}
                    className={cn("flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
                      activeTab === "library" ? "bg-[#03588C] text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}
                  >
                    Public Library
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search indicators..."
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-8 pr-3 py-2 text-xs text-[#F2F0EB] placeholder-[#6B7280] focus:outline-none focus:border-[#03588C]/50"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {activeTab === "my" ? (
                  myIndicators.map((ind) => (
                    <button
                      key={ind.name}
                      onClick={() => setSelectedIndicator(ind)}
                      className={cn("w-full text-left px-3 py-2.5 rounded-xl transition-all group",
                        selectedIndicator?.name === ind.name ? "bg-[#03588C]/15 border border-[#03588C]/25" : "hover:bg-white/[0.04]")}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-semibold text-[#F2F0EB] truncate">{ind.name}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setStarred((s) => ({ ...s, [ind.name]: !s[ind.name] })); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Star className={cn("w-3.5 h-3.5", (starred[ind.name] ?? ind.starred) ? "text-[#D9CA82] fill-[#D9CA82]" : "text-[#6B7280]")} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase",
                          ind.mode === "no-code" ? "bg-[#03588C]/20 text-[#4BA3D4]" :
                          ind.mode === "pine" ? "bg-[#22C55E]/15 text-[#22C55E]" :
                          "bg-[#D9CA82]/15 text-[#D9CA82]")}
                        >
                          {ind.mode === "no-code" ? "No-Code" : ind.mode === "pine" ? "Pine" : "JS"}
                        </span>
                        <span className="text-[10px] text-[#6B7280] capitalize">{ind.type}</span>
                        <div className={cn("ml-auto w-1.5 h-1.5 rounded-full", ind.active ? "bg-[#22C55E]" : "bg-[#6B7280]")} />
                      </div>
                    </button>
                  ))
                ) : (
                  filteredLibrary.map((ind) => (
                    <div key={ind.name} className="px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-semibold text-[#F2F0EB] truncate">{ind.name}</p>
                        {ind.tag && (
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-semibold ml-1 flex-shrink-0",
                            ind.tag === "official" ? "bg-[#03588C]/20 text-[#4BA3D4]" : "bg-[#D9CA82]/15 text-[#D9CA82]")}>
                            {ind.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#6B7280] mb-1">by {ind.author}</p>
                      <div className="flex items-center gap-3 text-[10px] text-[#6B7280]">
                        <span className="flex items-center gap-0.5"><Download className="w-3 h-3" /> {ind.downloads.toLocaleString()}</span>
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3" /> {ind.stars}</span>
                        <button className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[#03588C]/20 text-[#4BA3D4] hover:bg-[#03588C]/30">
                          Import
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {activeTab === "my" && (
                <div className="p-3 border-t border-white/[0.05]">
                  <button
                    onClick={() => setShowBuilder(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#03588C]/10 border border-[#03588C]/20 text-xs font-semibold text-[#4BA3D4] hover:bg-[#03588C]/20 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Indicator
                  </button>
                </div>
              )}
            </div>

            {/* Right — detail panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedIndicator ? (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-2xl">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-[#F2F0EB] mb-1">{selectedIndicator.name}</h2>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold border",
                            selectedIndicator.mode === "no-code" ? "bg-[#03588C]/15 text-[#4BA3D4] border-[#03588C]/30" :
                            selectedIndicator.mode === "pine" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" :
                            "bg-[#D9CA82]/10 text-[#D9CA82] border-[#D9CA82]/20")}
                          >
                            {selectedIndicator.mode === "no-code" ? "No-Code" : selectedIndicator.mode === "pine" ? "Pine Script" : "JavaScript"}
                          </span>
                          <span className="text-[11px] text-[#6B7280] capitalize">{selectedIndicator.type} panel</span>
                          <div className={cn("flex items-center gap-1 text-[10px] font-semibold",
                            selectedIndicator.active ? "text-[#22C55E]" : "text-[#6B7280]")}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", selectedIndicator.active ? "bg-[#22C55E]" : "bg-[#6B7280]")} />
                            {selectedIndicator.active ? "Active" : "Inactive"}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowBuilder(true)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#03588C] text-white text-xs font-semibold hover:bg-[#024a77] transition-all shadow-glow-xs"
                        >
                          <Settings className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-[#6B7280] hover:text-[#F2F0EB] transition-all">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Preview chart area */}
                    <div className="glass rounded-2xl overflow-hidden mb-6">
                      <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#6B7280]">Preview — ES 15m</span>
                        <div className="flex items-center gap-2">
                          <button className="text-[11px] text-[#6B7280] hover:text-[#F2F0EB] transition-colors flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> View on Chart
                          </button>
                        </div>
                      </div>
                      <div className="relative h-40 bg-[#050508] overflow-hidden">
                        <div className="absolute inset-0 opacity-20"
                          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.03) 20px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.03) 40px)" }} />
                        <div className="absolute inset-0 flex items-end px-4 pb-4 gap-[2px]">
                          {Array.from({ length: 60 }).map((_, i) => {
                            const h = 20 + Math.sin(i * 0.4) * 15 + Math.random() * 10;
                            const isGreen = Math.random() > 0.45;
                            return (
                              <div key={i} className="flex-1">
                                <div className="w-full rounded-sm" style={{ height: `${h}px`, background: isGreen ? "#22C55E60" : "#EF444460" }} />
                              </div>
                            );
                          })}
                        </div>
                        {/* Indicator line overlay */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 160" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="indGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#03588C" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#03588C" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,80 C50,75 100,70 150,65 C200,60 250,55 300,58 C350,61 400,70 450,72 C500,74 550,68 600,65"
                            fill="none" stroke="#4BA3D4" strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: <Copy className="w-4 h-4" />, label: "Duplicate", desc: "Create a copy to modify" },
                        { icon: <Globe className="w-4 h-4" />, label: "Publish", desc: "Share to public library" },
                        { icon: <Bell className="w-4 h-4" />, label: "Add Alert", desc: "Get notified on signal" },
                        { icon: <Trash2 className="w-4 h-4" />, label: "Delete", desc: "Remove this indicator", red: true },
                      ].map(({ icon, label, desc, red }) => (
                        <button key={label}
                          className={cn("glass rounded-2xl p-4 text-left hover:bg-white/[0.05] transition-all group",
                            red && "hover:border-red-500/20")}
                        >
                          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2",
                            red ? "bg-red-500/10 text-red-400" : "bg-[#03588C]/15 text-[#4BA3D4]")}>
                            {icon}
                          </div>
                          <p className={cn("text-sm font-semibold mb-0.5", red ? "text-red-400" : "text-[#F2F0EB]")}>{label}</p>
                          <p className="text-[11px] text-[#6B7280]">{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart2 className="w-10 h-10 text-[#6B7280] mx-auto mb-3" />
                    <p className="text-sm text-[#6B7280]">Select an indicator to view details</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
