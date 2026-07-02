import type { ApiErrorBody } from "@/lib/types";
import { getToken } from "@/lib/api/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.status = body.status;
    this.details = body.details;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (token) {
      (finalHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new ApiError(
      data ?? {
        timestamp: new Date().toISOString(),
        status: response.status,
        error: response.statusText,
        message: "Erro inesperado ao comunicar com o servidor",
        path,
      },
    );
  }

  return data as T;
}
