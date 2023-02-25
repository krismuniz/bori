export function truncateString(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "..." : str;
}
