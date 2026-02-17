export function buildCodeforcesUrl(contestID: string, index: string): string {
  return `https://codeforces.com/problemset/problem/${contestID}/${index}`;
}
