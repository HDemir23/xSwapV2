type CacheEntry<T> = {
  value: T;
  timestamp: number;
};

export class SimpleCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private ttlMs: number;

  constructor(ttlMs: number = 60000) {
    this.ttlMs = ttlMs;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  resolver?: (...args: Parameters<T>) => string,
  ttlMs: number = 60000,
): T {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();

  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    const entry = cache.get(key);

    if (entry && Date.now() - entry.timestamp <= ttlMs) {
      return entry.value;
    }

    const value = fn(...args) as ReturnType<T>;
    cache.set(key, { value, timestamp: Date.now() });
    return value;
  }) as T;
}
