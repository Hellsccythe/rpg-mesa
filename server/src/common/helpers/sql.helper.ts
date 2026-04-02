export function sanitizeLikeTerm(input: string): string {
  return input.trim().replace(/[%_]/g, "");
}
