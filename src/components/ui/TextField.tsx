import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const TextField = forwardRef<HTMLInputElement, Props>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-semibold text-maroon-900">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-foreground",
            "placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-maroon-700/30",
            error
              ? "border-status-unpaid focus:border-status-unpaid"
              : "border-neutral-300 focus:border-maroon-700",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-status-unpaid">{error}</p>
        ) : hint ? (
          <p className="text-xs font-medium text-status-paid">{hint}</p>
        ) : null}
      </div>
    );
  }
);
TextField.displayName = "TextField";
