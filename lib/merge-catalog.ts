export function interleave<T>(first: T[], second: T[]): T[] {
  const mixed: T[] = [];
  const count = Math.max(first.length, second.length);
  for (let index = 0; index < count; index += 1) {
    if (index < first.length) mixed.push(first[index]);
    if (index < second.length) mixed.push(second[index]);
  }
  return mixed;
}
