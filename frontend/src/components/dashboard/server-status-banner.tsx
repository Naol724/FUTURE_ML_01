"use client";

import { useQuery } from "@tanstack/react-query";
import { CloudOff, Loader2 } from "lucide-react";
import { checkHealth } from "@/lib/api";

/**
 * Handles Render free-tier cold starts gracefully: while the health check is
 * pending or failing, tell the user the server is waking up instead of
 * showing raw fetch errors.
 */
export function ServerStatusBanner() {
  const { isSuccess, isError, failureCount } = useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => checkHealth(signal),
    retry: 10,
    retryDelay: 3000,
    refetchInterval: (query) => (query.state.status === "success" ? false : 3000),
    staleTime: 5 * 60 * 1000,
  });

  if (isSuccess) return null;

  if (isError && failureCount >= 10) {
    return (
      <div
        role="alert"
        className="animate-fade-in mb-6 flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
      >
        <CloudOff className="size-4 shrink-0" aria-hidden="true" />
        The forecasting API is unreachable. Check that the backend is running and
        NEXT_PUBLIC_API_URL is set correctly.
      </div>
    );
  }

  return (
    <div
      role="status"
      className="animate-fade-in mb-6 flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground"
    >
      <Loader2 className="size-4 shrink-0 animate-spin text-warning" aria-hidden="true" />
      Waking up the forecasting server — free-tier instances sleep when idle, this can take up to
      30 seconds.
    </div>
  );
}
