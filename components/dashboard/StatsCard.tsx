import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  description?: string;
}

export function StatsCard({
  label,
  value,
  change,
  changePositive = true,
  icon: Icon,
  iconColor = "text-indigo-400",
  iconBg = "bg-indigo-500/15",
  description,
}: StatsCardProps) {
  return (
    <div className="glass rounded-2xl p-5 hover:bg-white/[0.05] transition-all duration-200 hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          <Icon className={cn("w-4.5 h-4.5", iconColor)} />
        </div>
      </div>

      <p className="text-2xl font-bold font-display text-white mb-1">{value}</p>

      <div className="flex items-center gap-2">
        {change && (
          <span
            className={cn(
              "text-xs font-semibold",
              changePositive ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {changePositive ? "↑" : "↓"} {change}
          </span>
        )}
        {description && (
          <span className="text-xs text-slate-600">{description}</span>
        )}
      </div>
    </div>
  );
}
