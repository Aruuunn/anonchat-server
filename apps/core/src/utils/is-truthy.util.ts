export function isTruthy(value: any): boolean {
  return typeof value !== 'undefined' && value !== null;
}
