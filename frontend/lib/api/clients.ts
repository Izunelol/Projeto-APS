import { apiFetch } from "@/lib/api/http";
import type { Client, ClientRequest, PageResponse } from "@/lib/types";

export function listClients(page = 0, size = 20): Promise<PageResponse<Client>> {
  return apiFetch<PageResponse<Client>>(`/api/clients?page=${page}&size=${size}`);
}

export function getClient(id: string): Promise<Client> {
  return apiFetch<Client>(`/api/clients/${id}`);
}

export function createClient(payload: ClientRequest): Promise<Client> {
  return apiFetch<Client>("/api/clients", { method: "POST", body: payload });
}

export function updateClient(id: string, payload: ClientRequest): Promise<Client> {
  return apiFetch<Client>(`/api/clients/${id}`, { method: "PUT", body: payload });
}

export function deleteClient(id: string): Promise<void> {
  return apiFetch<void>(`/api/clients/${id}`, { method: "DELETE" });
}
