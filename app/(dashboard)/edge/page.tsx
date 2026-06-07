"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import {
  Plus, Layers, Check, ChevronRight, TrendingDown, Star, Edit2, Trash2,
  Zap, X, Loader2, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TradingPlan {
  id: string;
  name: string;
  description: string;
  active: boolean;
  tags: string[];
  entry_criteria: string[];
  exit_rules: string[];
  invalidations: string[];
  ideal_conditions: string[];
  winRate: number;
  totalPnl: number;
  tradeCount: number;
  created_at: string;
}

const gradeColors: Record<string, string> = {
  "A+": "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25",
  "A": "text-[#4BA3D4] bg-[#4BA3D4]/10 border-[#4BA3D4]/25",
  "B+": "text-[#D9CA82] bg-[#D9CA82]/10 border-[#D9CA82]/25",
  "B": "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25",
  "C": "text-[#6B7280] bg-white/[0.04] border-white/[0.08]",
  "—": "text-[#6B7280] bg-white/[0.04] border-white/[0.08]",
};

function getGrade(winRate: number, tradeCount: number): string {
  if (tradeCount === 0) return "—";
  if (winRate >= 70) return "A+";
  if (winRate >= 60) return "A";
  if (winRate >= 50) return "B+";
  if (winRate >= 40) return "B";
  return "C";
}

interface PlanFormData {
  name: string;
  description: string;
  active: boolean;
  tags: string;
  entry_criteria: string;
  exit_rules: string;
  invalidations: string;
  ideal_conditions: string;
}

const emptyForm: PlanFormData = {
  name: "",
  description: "",
  active: true,
  tags: "",
  entry_criteria: "",
  exit_rules: "",
  invalidations: "",
  ideal_conditions: "",
};

function planToForm(plan: TradingPlan): PlanFormData {
  return {
    name: plan.name,
    description: plan.description,
    active: plan.active,
    tags: plan.tags.join(", "),
    entry_criteria: plan.entry_criteria.join("\n"),
    exit_rules: plan.exit_rules.join("\n"),
    invalidations: plan.invalidations.join("\n"),
    ideal_conditions: plan.ideal_conditions.join("\n"),
  };
}

function formToPayload(form: PlanFormData) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    active: form.active,
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    entry_criteria: form.entry_criteria.split("\n").map((t) => t.trim()).filter(Boolean),
    exit_rules: form.exit_rules.split("\n").map((t) => t.trim()).filter(Boolean),
    invalidations: form.invalidations.split("\n").map((t) => t.trim()).filter(Boolean),
    ideal_conditions: form.ideal_conditions.split("\n").map((t) => t.trim()).filter(Boolean),
  };
}

function PlanModal({ plan, onClose, onSave }: {
  plan: TradingPlan | null;
  onClose: () => void;
  onSave: (data: ReturnType<typeof formToPayload>) => Promise<void>;
}) {
  const [form, setForm] = useState<PlanFormData>(plan ? planToForm(plan) : emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof PlanFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(formToPayload(form));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="w-full max-w-2xl glass rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-[#F2F0EB]">{plan ? "Edit Plan" : "New Trading Plan"}</h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Plan Name *</label>
              <input
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. ES Trend Continuation"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] placeholder-[#6B7280]/60 focus:outline-none focus:border-[#03588C]/50"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Description</label>
              <input
                value={form.description}
                onChange={set("description")}
                placeholder="Short description of the setup"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] placeholder-[#6B7280]/60 focus:outline-none focus:border-[#03588C]/50"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Tags (comma-separated)</label>
              <input
                value={form.tags}
                onChange={set("tags")}
                placeholder="ES, Trend, NY Session"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] placeholder-[#6B7280]/60 focus:outline-none focus:border-[#03588C]/50"
              />
            </div>
            <div className="flex items-end gap-3 pb-1">
              <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">Active</label>
              <button
                onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                className={cn("w-10 h-5 rounded-full transition-all relative flex-shrink-0",
                  form.active ? "bg-[#03588C]" : "bg-white/[0.08]")}
              >
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                  form.active ? "left-[22px]" : "left-0.5")} />
              </button>
            </div>
          </div>

          {[
            { key: "entry_criteria" as const, label: "Entry Criteria", color: "bg-[#22C55E]", placeholder: "One criterion per line\nPrice breaks key resistance...\nWait for 15m retest..." },
            { key: "exit_rules" as const, label: "Exit Rules", color: "bg-[#4BA3D4]", placeholder: "One rule per line\nStop: below structure\nTarget 1: 1.5R..." },
            { key: "invalidations" as const, label: "Invalidations", color: "bg-red-400", placeholder: "One per line\nPrice reverses back through level\nVolume dries up..." },
            { key: "ideal_conditions" as const, label: "Ideal Conditions", color: "bg-[#D9CA82]", placeholder: "One per line\nStrong 4H trend confirmed\nNo major news in 30 min..." },
          ].map(({ key, label, color, placeholder }) => (
            <div key={key}>
              <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5 flex items-center gap-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", color)} /> {label}
              </label>
              <textarea
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                rows={3}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] placeholder-[#6B7280]/40 focus:outline-none focus:border-[#03588C]/50 resize-none leading-relaxed"
              />
            </div>
          ))}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {plan ? "Save Changes" : "Create Plan"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function EdgePage() {
  const router = useRouter();
  const [plans, setPlans] = useState<TradingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [modalPlan, setModalPlan] = useState<TradingPlan | null | "new">(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/edge/plans");
    const data = await res.json();
    const loaded: TradingPlan[] = data.plans ?? [];
    setPlans(loaded);
    if (loaded.length > 0 && !selected) setSelected(loaded[0].id);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedPlan = plans.find((p) => p.id === selected) ?? null;

  const handleCreate = async (payload: ReturnType<typeof formToPayload>) => {
    const res = await fetch("/api/edge/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error ?? "Failed to create plan");
    }
    const { plan } = await res.json();
    setPlans((p) => [plan, ...p]);
    setSelected(plan.id);
  };

  const handleUpdate = async (id: string, payload: ReturnType<typeof formToPayload>) => {
    const res = await fetch(`/api/edge/plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error ?? "Failed to update plan");
    }
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trading plan? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/edge/plans/${id}`, { method: "DELETE" });
    setPlans((p) => p.filter((x) => x.id !== id));
    if (selected === id) setSelected(plans.find((p) => p.id !== id)?.id ?? null);
    setDeleting(null);
  };

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Edge"
        subtitle="Build and refine your trading playbooks — your rules, biases, and edge in one place."
        action={
          <Button size="sm" onClick={() => setModalPlan("new")}>
            <Plus className="w-3.5 h-3.5" />
            New Plan
          </Button>
        }
      />

      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        {/* Left panel */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-2 overflow-y-auto">
          <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-widest px-1 mb-1">MY PLANS</p>

          {loading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="w-5 h-5 animate-spin text-[#6B7280]" />
            </div>
          ) : plans.length === 0 ? (
            <div className="glass rounded-2xl p-5 text-center">
              <BookOpen className="w-8 h-8 text-[#6B7280] mx-auto mb-2" />
              <p className="text-sm text-[#6B7280] mb-3">No trading plans yet</p>
              <button
                onClick={() => setModalPlan("new")}
                className="text-xs text-[#4BA3D4] hover:text-white transition-colors"
              >
                Create your first plan
              </button>
            </div>
          ) : (
            plans.map((plan) => {
              const grade = getGrade(plan.winRate, plan.tradeCount);
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelected(plan.id)}
                  className={cn(
                    "w-full text-left rounded-2xl p-4 border transition-all duration-200",
                    selected === plan.id
                      ? "bg-[#03588C]/12 border-[#03588C]/30"
                      : "glass hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", gradeColors[grade] ?? gradeColors["C"])}>{grade}</span>
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border",
                      plan.active ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-white/[0.04] text-[#6B7280] border-white/[0.07]")}>
                      {plan.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#F2F0EB] mb-1">{plan.name}</p>
                  <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                    {plan.tradeCount > 0 ? (
                      <>
                        <span className="text-[#22C55E] font-semibold">{plan.winRate}% WR</span>
                        <span>·</span>
                        <span>{plan.tradeCount} trades</span>
                      </>
                    ) : (
                      <span>No trades yet</span>
                    )}
                  </div>
                </button>
              );
            })
          )}

          {/* AI suggestion */}
          <div className="glass rounded-2xl p-4 mt-2 border border-[#03588C]/15 bg-[#03588C]/[0.03]">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-[#4BA3D4]" />
              <p className="text-xs font-semibold text-[#4BA3D4]">KlarAI</p>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed mb-2">
              Ask KlarAI to analyze your setups and suggest improvements based on your trade data.
            </p>
            <button
              onClick={() => router.push("/klar-ai")}
              className="text-xs text-[#4BA3D4] hover:text-[#F2F0EB] transition-colors flex items-center gap-1"
            >
              Open KlarAI <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 overflow-auto">
          {!selectedPlan ? (
            <div className="h-full flex flex-col items-center justify-center text-center glass rounded-2xl">
              <Layers className="w-10 h-10 text-[#6B7280] mb-3" />
              <p className="text-sm text-[#6B7280] mb-1">No plan selected</p>
              <p className="text-[11px] text-[#6B7280]/60">Create a plan or select one from the list</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPlan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="glass rounded-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#03588C]/15 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-[#4BA3D4]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-semibold text-[#F2F0EB]">{selectedPlan.name}</h2>
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border",
                          gradeColors[getGrade(selectedPlan.winRate, selectedPlan.tradeCount)])}>
                          {getGrade(selectedPlan.winRate, selectedPlan.tradeCount)}
                        </span>
                      </div>
                      {selectedPlan.description && (
                        <p className="text-xs text-[#6B7280] mt-0.5">{selectedPlan.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setModalPlan(selectedPlan)}>
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <button
                      onClick={() => handleDelete(selectedPlan.id)}
                      disabled={deleting === selectedPlan.id}
                      className="w-8 h-8 rounded-xl bg-red-500/08 border border-red-500/15 flex items-center justify-center text-red-400 hover:bg-red-500/15 transition-all disabled:opacity-50"
                    >
                      {deleting === selectedPlan.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Win Rate", value: selectedPlan.tradeCount > 0 ? `${selectedPlan.winRate}%` : "—", color: selectedPlan.winRate >= 50 ? "text-[#22C55E]" : "text-red-400" },
                      { label: "Total PnL", value: selectedPlan.tradeCount > 0 ? `${selectedPlan.totalPnl >= 0 ? "+" : ""}$${selectedPlan.totalPnl.toLocaleString()}` : "—", color: selectedPlan.totalPnl >= 0 ? "text-[#22C55E]" : "text-red-400" },
                      { label: "Total Trades", value: `${selectedPlan.tradeCount}`, color: "text-[#F2F0EB]" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3.5">
                        <p className="text-[10px] text-[#6B7280] uppercase tracking-wide font-medium mb-1.5">{s.label}</p>
                        <p className={cn("text-xl font-bold font-mono-nums", s.color)}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  {selectedPlan.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedPlan.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full text-xs border border-[#03588C]/25 bg-[#03588C]/08 text-[#4BA3D4]">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Rules grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Entry */}
                    <div>
                      <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> Entry Criteria
                      </h3>
                      {selectedPlan.entry_criteria.length === 0 ? (
                        <p className="text-[11px] text-[#6B7280]/50 italic">No criteria defined</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedPlan.entry_criteria.map((e, i) => (
                            <div key={i} className="flex gap-2 text-xs text-[#6B7280] bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5">
                              <div className="w-4 h-4 rounded-full bg-[#22C55E]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="w-2.5 h-2.5 text-[#22C55E]" />
                              </div>
                              {e}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Exits */}
                    <div>
                      <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4BA3D4]" /> Exit Rules
                      </h3>
                      {selectedPlan.exit_rules.length === 0 ? (
                        <p className="text-[11px] text-[#6B7280]/50 italic">No rules defined</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedPlan.exit_rules.map((e, i) => (
                            <div key={i} className="flex gap-2 text-xs text-[#6B7280] bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5">
                              <div className="w-4 h-4 rounded-full bg-[#03588C]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <ChevronRight className="w-2.5 h-2.5 text-[#4BA3D4]" />
                              </div>
                              {e}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Invalidations + Conditions */}
                    <div>
                      <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Invalidations
                      </h3>
                      {selectedPlan.invalidations.length === 0 ? (
                        <p className="text-[11px] text-[#6B7280]/50 italic mb-4">None defined</p>
                      ) : (
                        <div className="space-y-2 mb-5">
                          {selectedPlan.invalidations.map((e, i) => (
                            <div key={i} className="flex gap-2 text-xs text-[#6B7280] bg-red-500/[0.04] border border-red-500/15 rounded-xl p-2.5">
                              <TrendingDown className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                              {e}
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedPlan.ideal_conditions.length > 0 && (
                        <>
                          <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mt-2 mb-3 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D9CA82]" /> Ideal Conditions
                          </h3>
                          <div className="space-y-2">
                            {selectedPlan.ideal_conditions.map((c, i) => (
                              <div key={i} className="flex gap-2 text-xs text-[#6B7280] bg-[#D9CA82]/[0.04] border border-[#D9CA82]/15 rounded-xl p-2.5">
                                <Star className="w-3 h-3 text-[#D9CA82] flex-shrink-0 mt-0.5" />
                                {c}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {selectedPlan.tradeCount === 0 && (
                    <div className="p-4 rounded-xl bg-[#03588C]/08 border border-[#03588C]/15 text-center">
                      <p className="text-[11px] text-[#6B7280]">
                        No trades tagged with this plan yet. Log trades in the{" "}
                        <button onClick={() => router.push("/journal")} className="text-[#4BA3D4] hover:text-white transition-colors">
                          Journal
                        </button>
                        {" "}and set the setup name to <span className="text-[#F2F0EB] font-medium">{selectedPlan.name}</span>.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <AnimatePresence>
        {modalPlan !== null && (
          <PlanModal
            plan={modalPlan === "new" ? null : modalPlan}
            onClose={() => setModalPlan(null)}
            onSave={async (payload) => {
              if (modalPlan === "new") {
                await handleCreate(payload);
              } else {
                await handleUpdate(modalPlan.id, payload);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
