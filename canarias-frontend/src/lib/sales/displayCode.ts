export function getDisplayCode(prefix: string, uuid: string): string {
  return `${prefix}-${uuid.replace(/-/g, "").substring(0, 8).toUpperCase()}`;
}
