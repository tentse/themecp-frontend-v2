import { apiGet, apiPut } from './client';
import type { UserResponse, CodeforcesProblem } from './types';

/**
 * Fetch a profile. Omit `userId` for your own (token required); pass one to read
 * any user's public profile, in which case `email` comes back null unless you own it.
 */
export async function getProfile(userId?: string): Promise<UserResponse> {
  const params: Record<string, string | number> = {};
  if (userId) params.user_id = userId;
  return apiGet<UserResponse>('/users', params);
}

export async function getVerificationProblem(codeforcesHandle: string): Promise<CodeforcesProblem> {
  return apiGet<CodeforcesProblem>('/users/handle-verification-cf-problem', {
    codeforces_handle: codeforcesHandle,
  });
}

export async function updateHandle(
  codeforcesHandle: string,
  contestID: string,
  index: string
): Promise<boolean> {
  return apiPut<boolean>('/users/codeforces-handle', {
    codeforces_handle: codeforcesHandle,
    contestID,
    index,
  });
}
