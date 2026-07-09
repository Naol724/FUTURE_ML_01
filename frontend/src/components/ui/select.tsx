import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <span className={cn("relative inline-flex", className)}>
      <select
        ref={ref}
        className={cn(
          "h-9 w-full appearance-none rounded-lg border border-border bg-card pl-3 pr-8 text-sm",
          "text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </span>
  ),
);
Select.displayName = "Select";
