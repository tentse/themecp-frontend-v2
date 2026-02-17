import { apiGetPublic } from './client';
import type { ContestLevel } from './types';

export async function getLevels(): Promise<ContestLevel[]> {
  return apiGetPublic<ContestLevel[]>('/contest-level');
}
