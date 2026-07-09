import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="animate-fade-up flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <span className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <Icon className="size-8" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
