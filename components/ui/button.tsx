import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#03588C]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-[#03588C] text-white shadow-glow-xs hover:bg-[#024a77] hover:shadow-glow-sm",
        destructive:
          "bg-red-600/90 text-white hover:bg-red-500",
        outline:
          "border border-white/[0.1] bg-white/[0.03] text-[#F2F0EB] hover:bg-white/[0.07] hover:border-white/[0.18]",
        ghost:
          "text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.06]",
        link:
          "text-[#4BA3D4] underline-offset-4 hover:underline p-0 h-auto",
        navy:
          "border border-[#03588C]/40 bg-[#03588C]/10 text-[#4BA3D4] hover:bg-[#03588C]/20 hover:border-[#03588C]/60 hover:text-white hover:shadow-glow-xs",
        gold:
          "bg-[#D9CA82]/10 border border-[#D9CA82]/30 text-[#D9CA82] hover:bg-[#D9CA82]/20 hover:border-[#D9CA82]/50",
        success:
          "bg-green-600/90 text-white hover:bg-green-500",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 px-8 text-[15px]",
        xl: "h-14 px-10 text-base rounded-2xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
