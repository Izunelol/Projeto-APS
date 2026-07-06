import { API_URL, ApiError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();
  const response = await fetch(`${API_URL}/api/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const data = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new ApiError(
      data ?? {
        timestamp: new Date().toISOString(),
        status: response.status,
        error: response.statusText,
        message: "Não foi possível enviar o arquivo.",
        path: "/api/uploads",
      },
    );
  }

  return (data as { url: string }).url;
}
