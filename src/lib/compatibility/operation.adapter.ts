export function toAnyOperation<T>(op: T): any {
  return op as unknown as any;
}
