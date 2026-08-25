import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "danger" | "success" | "warning" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-maroon-700 text-white hover:bg-maroon-800 focus-visible:outline-maroon-800",
  outline:
    "bg-white text-maroon-700 border border-maroon-700 hover:bg-maroon-50",
  danger: "bg-status-unpaid text-white hover:brightness-95",
  success: "bg-status-paid text-white hover:brightness-95",
  warning: "bg-status-partial text-white hover:brightness-95",
  ghost: "bg-transparent text-maroon-700 hover:bg-maroon-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(({ className, variant = "primary", size = "md", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";
