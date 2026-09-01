// Per-user localStorage snapshots so the app keeps working offline.
// Data is cached on every successful fetch and served from cache when the
// network (or API server) is unreachable.
const key = (userId: string, name: string) => `kg_offline:${userId}:${name}`;

export function saveSnapshot<T>(userId: string, name: string, data: T): void {
  try {
    localStorage.setItem(key(userId, name), JSON.stringify(data));
  } catch (err) {
    console.warn('Offline cache save failed:', err);
  }
}

export function loadSnapshot<T>(userId: string, name: string): T | null {
  try {
    const raw = localStorage.getItem(key(userId, name));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
