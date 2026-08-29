const TOKEN_KEY = 'kg_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401) {
    clearToken();
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response body
  }

  if (!res.ok) {
    const message = (data as { error?: string })?.error || `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

export const apiGet = <T>(path: string) => request<T>('GET', path);
export const apiPost = <T>(path: string, body?: unknown) => request<T>('POST', path, body);
export const apiPut = <T>(path: string, body?: unknown) => request<T>('PUT', path, body);
export const apiPatch = <T>(path: string, body?: unknown) => request<T>('PATCH', path, body);
export const apiDelete = <T>(path: string) => request<T>('DELETE', path);

export async function uploadFile(file: File): Promise<{ fileName: string; filePath: string; url: string }> {
  const form = new FormData();
  form.append('file', file);
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch('/api/upload', { method: 'POST', headers, body: form });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // ignore non-JSON
  }
  if (!res.ok) {
    const message = (data as { error?: string })?.error || `Upload failed (${res.status})`;
    throw new ApiError(res.status, message);
  }
  return data as { fileName: string; filePath: string; url: string };
}
