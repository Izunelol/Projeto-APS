import { apiFetch } from "@/lib/api/http";
import type { PageResponse, PointType, PointTypeRequest } from "@/lib/types";

export function listPointTypes(page = 0, size = 20): Promise<PageResponse<PointType>> {
  return apiFetch<PageResponse<PointType>>(`/api/point-types?page=${page}&size=${size}`);
}

export function createPointType(payload: PointTypeRequest): Promise<PointType> {
  return apiFetch<PointType>("/api/point-types", { method: "POST", body: payload });
}

export function updatePointType(id: string, payload: PointTypeRequest): Promise<PointType> {
  return apiFetch<PointType>(`/api/point-types/${id}`, { method: "PUT", body: payload });
}

export function deletePointType(id: string): Promise<void> {
  return apiFetch<void>(`/api/point-types/${id}`, { method: "DELETE" });
}
