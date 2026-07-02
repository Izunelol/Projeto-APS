import { apiFetch } from "@/lib/api/http";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/lib/types";

export function login(payload: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function register(payload: RegisterRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
    auth: false,
  });
}
