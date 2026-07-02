import { apiFetch } from "@/lib/api/http";
import type {
  InspectionPoint,
  InspectionPointCreateRequest,
  InspectionPointUpdateRequest,
  PageResponse,
  PointStatus,
} from "@/lib/types";

interface ListInspectionPointsParams {
  clientId?: string;
  areaId?: string;
  pointTypeId?: string;
  status?: PointStatus;
  page?: number;
  size?: number;
}

export function listInspectionPoints(
  params: ListInspectionPointsParams = {},
): Promise<PageResponse<InspectionPoint>> {
  const search = new URLSearchParams();
  if (params.clientId) search.set("clientId", params.clientId);
  if (params.areaId) search.set("areaId", params.areaId);
  if (params.pointTypeId) search.set("pointTypeId", params.pointTypeId);
  if (params.status) search.set("status", params.status);
  search.set("page", String(params.page ?? 0));
  search.set("size", String(params.size ?? 20));
  return apiFetch<PageResponse<InspectionPoint>>(`/api/inspection-points?${search.toString()}`);
}

export function getInspectionPointByCode(code: string): Promise<InspectionPoint> {
  return apiFetch<InspectionPoint>(`/api/inspection-points/${encodeURIComponent(code)}`);
}

export function createInspectionPoint(payload: InspectionPointCreateRequest): Promise<InspectionPoint> {
  return apiFetch<InspectionPoint>("/api/inspection-points", { method: "POST", body: payload });
}

export function updateInspectionPoint(
  id: string,
  payload: InspectionPointUpdateRequest,
): Promise<InspectionPoint> {
  return apiFetch<InspectionPoint>(`/api/inspection-points/${id}`, { method: "PUT", body: payload });
}

export function deleteInspectionPoint(id: string): Promise<void> {
  return apiFetch<void>(`/api/inspection-points/${id}`, { method: "DELETE" });
}
