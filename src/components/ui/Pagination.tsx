import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const safeTotal = Math.max(totalPages, 1);

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <button
        type="button"
        aria-label="Halaman sebelumnya"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full bg-maroon-700 text-white",
          "disabled:opacity-30 disabled:cursor-not-allowed hover:bg-maroon-800"
        )}
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-medium text-maroon-900">
        page {safeTotal === 0 ? 0 : page} of {safeTotal}
      </span>
      <button
        type="button"
        aria-label="Halaman berikutnya"
        disabled={page >= safeTotal}
        onClick={() => onPageChange(page + 1)}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full bg-maroon-700 text-white",
          "disabled:opacity-30 disabled:cursor-not-allowed hover:bg-maroon-800"
        )}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
