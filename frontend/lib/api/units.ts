import { apiFetch } from "@/lib/api/http";
import type { Unit, UnitRequest } from "@/lib/types";

export function listUnitsByClient(clientId: string): Promise<Unit[]> {
  return apiFetch<Unit[]>(`/api/clients/${clientId}/units`);
}

export function createUnit(clientId: string, payload: UnitRequest): Promise<Unit> {
  return apiFetch<Unit>(`/api/clients/${clientId}/units`, { method: "POST", body: payload });
}

export function updateUnit(id: string, payload: UnitRequest): Promise<Unit> {
  return apiFetch<Unit>(`/api/units/${id}`, { method: "PUT", body: payload });
}

export function deleteUnit(id: string): Promise<void> {
  return apiFetch<void>(`/api/units/${id}`, { method: "DELETE" });
}
