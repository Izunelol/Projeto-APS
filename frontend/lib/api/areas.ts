import { apiFetch } from "@/lib/api/http";
import type { Area, AreaRequest } from "@/lib/types";

export function listAreasByUnit(unitId: string): Promise<Area[]> {
  return apiFetch<Area[]>(`/api/units/${unitId}/areas`);
}

export function createArea(unitId: string, payload: AreaRequest): Promise<Area> {
  return apiFetch<Area>(`/api/units/${unitId}/areas`, { method: "POST", body: payload });
}

export function updateArea(id: string, payload: AreaRequest): Promise<Area> {
  return apiFetch<Area>(`/api/areas/${id}`, { method: "PUT", body: payload });
}

export function deleteArea(id: string): Promise<void> {
  return apiFetch<void>(`/api/areas/${id}`, { method: "DELETE" });
}
