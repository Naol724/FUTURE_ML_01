"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal accessible tooltip: shows on hover and keyboard focus,
 * announced via aria-describedby.
 */
export function Tooltip({
  content,
  children,
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={id} tabIndex={0} className="inline-flex cursor-help outline-none">
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-xl",
          "bg-navy px-3 py-2 text-xs leading-relaxed text-navy-foreground shadow-card-hover",
          "transition-all duration-200",
          open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
          className,
        )}
      >
        {content}
      </span>
    </span>
  );
}
