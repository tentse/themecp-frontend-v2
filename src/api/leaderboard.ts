import { apiGetPublic } from './client';
import type { LeaderboardEntry } from './types';

/**
 * Fetch the top users by rating (no auth — there is no per-user variation here).
 * Sorted highest first with a stable tiebreak; rank is the array index + 1.
 */
export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  return apiGetPublic<LeaderboardEntry[]>('/users/leaderboard', { limit });
}
