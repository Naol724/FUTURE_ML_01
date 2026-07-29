"use client";

import { useEffect } from "react";
import { checkHealth } from "@/lib/api";

/**
 * Fire-and-forget API wake-up call, mounted in the root layout.
 *
 * Render free-tier services sleep when idle and take up to a minute to boot.
 * By pinging the health endpoint as soon as ANY page loads (including the
 * landing page), the API starts waking while the visitor is still reading —
 * so it's usually ready by the time they reach the dashboard.
 */
export function PrewarmApi() {
  useEffect(() => {
    checkHealth().catch(() => {
      // Expected while the server is still booting — the dashboard's status
      // banner handles user-facing messaging.
    });
  }, []);

  return null;
}
