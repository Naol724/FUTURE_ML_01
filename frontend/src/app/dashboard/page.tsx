import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Upload sales data and run demand forecasts.",
};

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardClient />
    </Suspense>
  );
}
