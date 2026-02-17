/**
 * Format remaining milliseconds as HH:MM:SS or "Time's up!"
 */
export function formatCountdown(targetMs: number): string {
  const now = Date.now();
  const remaining = Math.max(0, targetMs - now);
  if (remaining <= 0) return "Time's up!";
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
}

/**
 * Format duration in minutes as "Xh Ym"
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) {
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${m}m`;
}
