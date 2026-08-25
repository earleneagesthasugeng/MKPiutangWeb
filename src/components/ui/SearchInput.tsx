import { Search } from "lucide-react";
import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function SearchInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative flex-1", className)}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
      />
      <input
        type="search"
        className={cn(
          "w-full rounded-full border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-sm",
          "placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-maroon-700/30 focus:border-maroon-700"
        )}
        {...props}
      />
    </div>
  );
}
