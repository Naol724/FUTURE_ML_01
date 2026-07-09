import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "accent" | "success" | "danger" | "warning";

const variants: Record<Variant, string> = {
  default: "bg-muted text-muted-foreground",
  accent: "bg-accent-soft text-accent",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  warning: "bg-warning/10 text-warning",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
