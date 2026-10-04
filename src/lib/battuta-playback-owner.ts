// Shared by Web Audio demos and published HTMLAudio previews. Claim synchronously
// invalidates the previous owner, including work still waiting on audio loading.
export function createPlaybackOwner() {
  const stops = new Map<symbol, () => void>();
  let current: symbol | null = null;
  return {
    register(owner: symbol, stop: () => void) {
      stops.set(owner, stop);
      return () => {
        if (current === owner) { current = null; stop(); }
        stops.delete(owner);
      };
    },
    claim(owner: symbol) {
      if (!stops.has(owner)) return false;
      if (current !== owner) {
        const previous = current;
        current = owner;
        if (previous) stops.get(previous)?.();
      }
      return current === owner;
    },
    owns(owner: symbol) { return current === owner; },
    release(owner: symbol) { if (current === owner) current = null; },
  };
}
export const battutaPlaybackOwner = createPlaybackOwner();
