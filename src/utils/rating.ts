// Rating thresholds from API docs - [min, max, label]
export const RATING_THRESHOLDS: Array<[number, number, string]> = [
  [0, 1199, 'Newbie'],
  [1200, 1399, 'Pupil'],
  [1400, 1599, 'Specialist'],
  [1600, 1899, 'Expert'],
  [1900, 2099, 'Candidate Master'],
  [2100, 2299, 'Master'],
  [2300, 2399, 'International Master'],
  [2400, 2599, 'Grandmaster'],
  [2600, 2999, 'International Grandmaster'],
  [3000, Infinity, 'Legendary Grandmaster'],
];

// Codeforces rating background colors (for problem badges, level sheet, etc.)
export function getRatingColor(rating: number | null): string {
  if (rating === null || rating === undefined) return '#808080';
  const r = parseInt(String(rating), 10);
  if (r >= 0 && r < 1200) return '#CCCCCC';
  if (r >= 1200 && r < 1400) return '#77FF77';
  if (r >= 1400 && r < 1600) return '#77DDBB';
  if (r >= 1600 && r < 1900) return '#AAAAFF';
  if (r >= 1900 && r < 2100) return '#FF88FF';
  if (r >= 2100 && r < 2300) return '#FFCC88';
  if (r >= 2300 && r < 2400) return '#FFBB55';
  if (r >= 2400 && r < 2600) return '#FF7777';
  if (r >= 2600 && r < 3000) return '#FF3333';
  return '#AA0000';
}

// For text/labels (darker, higher contrast)
export function getRatingTextColor(rating: number | null): string {
  if (rating === null || rating === undefined) return '#000000';
  const r = parseInt(String(rating), 10);
  if (r >= 0 && r < 1200) return '#808080';
  if (r >= 1200 && r < 1400) return '#008000';
  if (r >= 1400 && r < 1600) return '#03A89E';
  if (r >= 1600 && r < 1900) return '#0000FF';
  if (r >= 1900 && r < 2100) return '#AA00AA';
  if (r >= 2100 && r < 2400) return '#FF8C00';
  if (r >= 2400) return '#FF0000';
  return '#000000';
}

export function getRatingLabel(rating: number | null): string {
  if (rating === null || rating === undefined || rating <= 0) return 'Unrated';
  const r = parseInt(String(rating), 10);
  for (const [min, max, label] of RATING_THRESHOLDS) {
    if (r >= min && r <= max) return label;
  }
  return 'Unrated';
}
