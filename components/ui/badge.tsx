import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
        success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
        danger: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
        warning: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
        outline: "border border-white/10 text-slate-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
