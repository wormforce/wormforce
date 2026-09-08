/** Seeded editorial shuffle: favour distinct brands/families and include a
 * community recording when available. No tracking or popularity claims. */
export function discoveryMix<T extends { id: string; brand: string; family: string; community: boolean }>(items: T[], seed: number, limit = 6): T[] {
  let state = seed >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const pool = items.map(item => ({ item, tie: random() }));
  const selected: T[] = [];
  const brands = new Set<string>(), families = new Set<string>();
  while (pool.length && selected.length < limit) {
    const needCommunity = !selected.some(item => item.community);
    const score = ({item, tie}: typeof pool[number]) => tie + (brands.has(item.brand) ? 0 : 2) + (families.has(item.family) ? 0 : 1.5) + (needCommunity && item.community ? 3 : 0);
    pool.sort((a,b) => score(b) - score(a));
    const next = pool.shift()!.item;
    selected.push(next); brands.add(next.brand); families.add(next.family);
  }
  return selected;
}
