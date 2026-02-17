import { apiGet, apiPost } from './client';
import type {
  ContestSession,
  CreateContestSessionRequest,
  StartContestResponse,
  RefreshProblemStatus,
  EndContestResponse,
  ContestHistoryResponse,
} from './types';

export async function getActiveSession(): Promise<ContestSession> {
  return apiGet<ContestSession>('/contest-session');
}

export async function createSession(
  level: number,
  theme: string,
  durationInMin: number
): Promise<ContestSession> {
  const body: CreateContestSessionRequest = {
    level,
    theme,
    duration_in_min: durationInMin,
  };
  return apiPost<ContestSession>('/contest-session', body);
}

export async function startSession(): Promise<StartContestResponse> {
  return apiPost<StartContestResponse>('/contest-session/start');
}

export async function refreshStatus(): Promise<RefreshProblemStatus[]> {
  return apiPost<RefreshProblemStatus[]>('/contest-session/refresh');
}

export async function endSession(): Promise<EndContestResponse> {
  return apiPost<EndContestResponse>('/contest-session/end');
}

export async function getHistory(skip = 0, limit = 20): Promise<ContestHistoryResponse> {
  return apiGet<ContestHistoryResponse>('/contest-session/history', { skip, limit });
}
