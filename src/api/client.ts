import type { ApiError } from './types';

// Fallback for dev; set VITE_API_BASE_URL in .env for production
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_V2_PREFIX = '/api/v2';
export const AUTH_EXPIRED_EVENT = 'auth:expired';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function buildUrl(path: string, params?: Record<string, string | number>): string {
  const base = BASE_URL.replace(/\/$/, '');
  const pathStr = path.startsWith('/') ? path : `/${path}`;
  const baseAlreadyHasV2Prefix = base.endsWith(API_V2_PREFIX);
  const finalPath = baseAlreadyHasV2Prefix || pathStr === API_V2_PREFIX || pathStr.startsWith(`${API_V2_PREFIX}/`)
    ? pathStr
    : `${API_V2_PREFIX}${pathStr}`;
  const url = new URL(`${base}${finalPath}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

function getHeaders(includeAuth = true): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = includeAuth ? getToken() : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const hadToken = !!localStorage.getItem('token');
    let detail = 'An error occurred';
    try {
      const body = await response.json();
      if (body && typeof body.detail === 'string') {
        detail = body.detail;
      }
    } catch {
      detail = response.statusText || detail;
    }
    const error: ApiError = { detail, status: response.status };
    if (response.status === 401) {
      localStorage.removeItem('token');
      if (hadToken) {
        globalThis.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
      }
    }
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return response.text() as unknown as T;
}

export async function apiGet<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = buildUrl(path, params);
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const url = buildUrl(path);
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const url = buildUrl(path);
  const response = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const url = buildUrl(path);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse<T>(response);
}

// For unauthenticated requests (e.g. GET /contest-level)
export async function apiGetPublic<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = buildUrl(path, params);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<T>(response);
}
