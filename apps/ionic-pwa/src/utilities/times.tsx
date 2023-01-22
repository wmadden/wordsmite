export default function times<T>(count: number, fn: (i: number) => T): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i += 1) {
    result.push(fn(i));
  }
  return result;
}
