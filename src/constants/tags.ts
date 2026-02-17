export const THEME_TAGS = [
  'mixed',
  'random',
  'greedy',
  'brute force',
  'math',
  'strings',
  'constructive algorithms',
  'dp',
  'graphs',
  'binary search',
  'bitmasks',
  'data structures',
  'implementation',
  'trees',
  'number theory',
  'combinatorics',
  'shortest paths',
  'probabilities',
  'sortings',
] as const;

export type ThemeTag = (typeof THEME_TAGS)[number];
