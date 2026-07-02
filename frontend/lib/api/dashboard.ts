import { apiFetch } from "@/lib/api/http";
import type { DashboardSummary } from "@/lib/types";

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/api/dashboard/summary");
}
