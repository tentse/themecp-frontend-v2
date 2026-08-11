import { apiGetPublic } from './client';
import type { LeaderboardEntry } from './types';

/**
 * Fetch the top users by rating (no auth — there is no per-user variation here).
 * Sorted highest first with a stable tiebreak; rank is the array index + 1.
 *
 * Omit `limit` to take whatever the server returns by default. Only send it when
 * a caller explicitly asks for a count; the server rejects anything outside 1–100
 * with a 422.
 */
export async function getLeaderboard(limit?: number): Promise<LeaderboardEntry[]> {
  const params: Record<string, string | number> = {};
  if (limit !== undefined) params.limit = limit;
  return apiGetPublic<LeaderboardEntry[]>('/users/leaderboard', params);
}
