import { apiGetPublic } from './client';
import type { ContestThemeOutput } from './types';

/** Fetch all contest themes (no auth). Backend returns theme in uppercase. */
export async function getContestThemes(): Promise<ContestThemeOutput[]> {
  return apiGetPublic<ContestThemeOutput[]>('/contest-theme');
}
