// Offline write queue: mutations attempted while the API is unreachable are
// parked in localStorage and replayed in order once connectivity returns.
import { getToken } from './api';

export interface QueuedOp {
  opId: string;
  method: string;
  path: string;
  body?: unknown;
  ts: number;
}

export type ReplayStopReason = 'auth' | 'offline' | 'server';

export interface ReplayResult {
  sent: number;
  remaining: number;
  stopped?: ReplayStopReason;
}

const CAP = 50;
const KEY_PREFIX = 'kg_queue:';

let userId = 'anonymous';
const listeners = new Set<(count: number) => void>();
let replaying = false;

const storageKey = () => `${KEY_PREFIX}${userId}`;

export function setQueueUser(id: string): void {
  userId = id || 'anonymous';
  emit();
}

function read(): QueuedOp[] {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueuedOp[]) : [];
  } catch {
    return [];
  }
}

function write(ops: QueuedOp[]): void {
  try {
    if (ops.length === 0) localStorage.removeItem(storageKey());
    else localStorage.setItem(storageKey(), JSON.stringify(ops));
  } catch {
    // Quota exceeded or storage disabled — the optimistic UI state still stands.
  }
  emit();
}

function emit(): void {
  const count = read().length;
  listeners.forEach(fn => fn(count));
}

export function peek(): QueuedOp[] {
  return read();
}

export function pendingCount(): number {
  return read().length;
}

export function subscribe(fn: (count: number) => void): () => void {
  listeners.add(fn);
  fn(read().length);
  return () => { listeners.delete(fn); };
}

export function enqueue(op: Omit<QueuedOp, 'opId' | 'ts'>): QueuedOp {
  const queued: QueuedOp = {
    ...op,
    opId: `op-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
  };
  const ops = read();
  ops.push(queued);
  // Drop the oldest writes first: a stale mutation is worth less than a fresh one.
  write(ops.slice(-CAP));
  return queued;
}

export function clear(): void {
  write([]);
}

function drop(opId: string): void {
  write(read().filter(o => o.opId !== opId));
}

/**
 * Replay queued writes oldest-first, stopping at the first op that cannot be
 * completed. Validation and uniqueness errors are treated as done: the server
 * has already accounted for that write, so retrying it would only fail again.
 */
export async function replayAll(): Promise<ReplayResult> {
  if (replaying) return { sent: 0, remaining: pendingCount() };
  const token = getToken();
  if (!token) return { sent: 0, remaining: pendingCount(), stopped: 'auth' };

  replaying = true;
  let sent = 0;
  let stopped: ReplayStopReason | undefined;

  try {
    for (const op of read()) {
      let res: Response;
      try {
        res = await fetch(`/api${op.path}`, {
          method: op.method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'x-op-id': op.opId,
          },
          body: op.body === undefined ? undefined : JSON.stringify(op.body),
        });
      } catch {
        stopped = 'offline';
        break;
      }

      if (res.ok || [400, 404, 409, 422].includes(res.status)) {
        drop(op.opId);
        sent += 1;
        continue;
      }
      if (res.status === 401 || res.status === 403) {
        stopped = 'auth';
        break;
      }
      stopped = 'server';
      break;
    }
  } finally {
    replaying = false;
  }

  emit();
  return { sent, remaining: pendingCount(), stopped };
}
