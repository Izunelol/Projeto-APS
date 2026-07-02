import { apiFetch } from "@/lib/api/http";
import type { Inspection, InspectionRequest } from "@/lib/types";

export function listInspectionsByPointCode(code: string): Promise<Inspection[]> {
  return apiFetch<Inspection[]>(`/api/inspection-points/${encodeURIComponent(code)}/inspections`);
}

export function createInspection(code: string, payload: InspectionRequest): Promise<Inspection> {
  return apiFetch<Inspection>(`/api/inspection-points/${encodeURIComponent(code)}/inspections`, {
    method: "POST",
    body: payload,
  });
}

export function getInspectionById(id: string): Promise<Inspection> {
  return apiFetch<Inspection>(`/api/inspections/${id}`);
}
