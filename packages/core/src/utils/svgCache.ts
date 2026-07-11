/**
 * Lightweight LRU cache using Map insertion order.
 *
 * - On hit, move entry to the end (most recently used)
 * - On overflow, evict the oldest entry (head)
 */
export class LRUMap<V> {
  private readonly map = new Map<string, V>()

  constructor(private readonly maxSize: number = 50) {
    if (maxSize < 1) {
      throw new RangeError(`LRUMap maxSize must be >= 1, got ${maxSize}`)
    }
  }

  get(key: string): V | undefined {
    if (!this.map.has(key)) {
      return undefined
    }
    const value = this.map.get(key)!
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }

  set(key: string, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key)
    }
    else if (this.map.size >= this.maxSize) {
      const oldestKey = this.map.keys().next().value
      if (oldestKey !== undefined) {
        this.map.delete(oldestKey)
      }
    }
    this.map.set(key, value)
  }

  get size(): number {
    return this.map.size
  }

  clear(): void {
    this.map.clear()
  }
}

/** LRU cache for async diagram SVG (default max 50 entries). */
export function createSVGCache(maxSize: number = 50): LRUMap<string> {
  return new LRUMap<string>(maxSize)
}
