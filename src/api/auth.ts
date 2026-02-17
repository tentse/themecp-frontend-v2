import { apiPost } from './client';
import type { AuthResponse } from './types';

export async function login(email: string): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/login', { email });
}

export async function register(email: string): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/register', { email });
}
