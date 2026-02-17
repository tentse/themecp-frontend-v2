import { apiGet, apiPut } from './client';
import type { UserResponse, CodeforcesProblem } from './types';

export async function getProfile(): Promise<UserResponse> {
  return apiGet<UserResponse>('/users');
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
