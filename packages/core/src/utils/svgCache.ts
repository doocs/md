/**
 * 轻量 LRU 缓存，基于 Map 的插入顺序特性实现。
 *
 * - 命中时将条目移至末尾（最近使用）
 * - 超限时淘汰最久未使用的条目（头部）
 *
 * @template V 缓存值类型
 */
export class LRUMap<V> {
  private readonly map = new Map<string, V>()

  /**
   * @param maxSize 缓存最大条目数，必须 >= 1
   */
  constructor(private readonly maxSize: number = 50) {
    if (maxSize < 1) {
      throw new RangeError(`LRUMap maxSize must be >= 1, got ${maxSize}`)
    }
  }

  /** 读取缓存，命中时刷新为最近使用 */
  get(key: string): V | undefined {
    if (!this.map.has(key)) {
      return undefined
    }
    const value = this.map.get(key)!
    // 移至末尾（最近使用）
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }

  /** 写入缓存，超限时淘汰最久未使用的条目 */
  set(key: string, value: V): void {
    // 已存在则先删除，保证末尾是最新
    if (this.map.has(key)) {
      this.map.delete(key)
    }
    else if (this.map.size >= this.maxSize) {
      // 淘汰头部（最久未使用）
      const oldestKey = this.map.keys().next().value
      if (oldestKey !== undefined) {
        this.map.delete(oldestKey)
      }
    }
    this.map.set(key, value)
  }

  /** 当前缓存条目数 */
  get size(): number {
    return this.map.size
  }

  /** 清空缓存 */
  clear(): void {
    this.map.clear()
  }
}

/**
 * 为异步图表渲染器创建一个带 LRU 缓存的包装器。
 *
 * 返回的 `cache` 对象可直接在 marked 扩展的 renderer 中使用：
 * - `cache.get(key)` 命中则直接返回缓存的 HTML
 * - `cache.set(key, value)` 在异步渲染完成后写入缓存
 *
 * @param maxSize 缓存最大条目数，默认 50
 */
export function createSVGCache(maxSize: number = 50): LRUMap<string> {
  return new LRUMap<string>(maxSize)
}
