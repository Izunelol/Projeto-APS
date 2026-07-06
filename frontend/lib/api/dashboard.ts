import { apiFetch } from "@/lib/api/http";
import type { AreaIndicator, DashboardSummary, MeasurementTrendPoint, PointTypeIndicator } from "@/lib/types";

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/api/dashboard/summary");
}

export function getIndicatorsByArea(): Promise<AreaIndicator[]> {
  return apiFetch<AreaIndicator[]>("/api/dashboard/by-area");
}

export function getIndicatorsByType(): Promise<PointTypeIndicator[]> {
  return apiFetch<PointTypeIndicator[]>("/api/dashboard/by-type");
}

export function getMeasurementsTrend(pointCode: string): Promise<MeasurementTrendPoint[]> {
  return apiFetch<MeasurementTrendPoint[]>(
    `/api/dashboard/measurements-trend?pointCode=${encodeURIComponent(pointCode)}`,
  );
}
