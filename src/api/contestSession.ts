import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type {
  ContestSessionOutput,
  ContestSessionInput,
  ContestSessionProblemsStatus,
  ContestHistoryOutput,
  ProblemDetail,
  RatingPlot,
} from './types';

/** Backend may send contestID or contestId. Normalize to contestId. */
function normalizeProblemDetail(p: ProblemDetail & { contestID?: string }): ProblemDetail {
  return {
    contestId: p.contestId ?? p.contestID ?? '',
    index: p.index,
    rating: p.rating,
  };
}

function normalizeSessionPayload<T extends { p1: unknown; p2: unknown; p3: unknown; p4: unknown }>(
  raw: T
): T {
  return {
    ...raw,
    p1: normalizeProblemDetail(raw.p1 as ProblemDetail & { contestID?: string }),
    p2: normalizeProblemDetail(raw.p2 as ProblemDetail & { contestID?: string }),
    p3: normalizeProblemDetail(raw.p3 as ProblemDetail & { contestID?: string }),
    p4: normalizeProblemDetail(raw.p4 as ProblemDetail & { contestID?: string }),
  };
}

export async function getActiveSession(): Promise<ContestSessionOutput> {
  const raw = await apiGet<ContestSessionOutput>('/contest-session');
  return normalizeSessionPayload(raw);
}

export async function createSession(level: number, theme: string): Promise<ContestSessionOutput> {
  const body: ContestSessionInput = { level, theme };
  const raw = await apiPost<ContestSessionOutput>('/contest-session', body);
  return normalizeSessionPayload(raw);
}

export async function startSession(sessionId: string): Promise<ContestSessionOutput> {
  const raw = await apiPut<ContestSessionOutput>(`/contest-session/${sessionId}/start`);
  return normalizeSessionPayload(raw);
}

export async function reRollProblem(
  sessionId: string,
  problemNumber: number
): Promise<ContestSessionOutput> {
  const raw = await apiPut<ContestSessionOutput>(
    `/contest-session/${sessionId}/re-roll-problem/${problemNumber}`
  );
  return normalizeSessionPayload(raw);
}

export async function refreshStatus(
  sessionId: string
): Promise<ContestSessionProblemsStatus> {
  const raw = await apiPut<ContestSessionProblemsStatus>(
    `/contest-session/${sessionId}/refresh`
  );
  return normalizeSessionPayload(raw);
}

export async function endSession(sessionId: string): Promise<void> {
  await apiPut<void>(`/contest-session/${sessionId}/end`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await apiDelete<void>(`/contest-session/${sessionId}`);
}

export async function getHistory(
  skip = 0,
  limit = 50
): Promise<ContestHistoryOutput> {
  const res = await apiGet<ContestHistoryOutput>('/contest-session/history', {
    skip,
    limit,
  });
  res.items = res.items.map((item) => normalizeSessionPayload(item));
  return res;
}

export async function getRatingPlot(codeforces_rating = false): Promise<RatingPlot> {
  return apiGet<RatingPlot>('/contest-session/rating-plot', {
    codeforces_rating: codeforces_rating ? 'true' : 'false',
  });
}
