# IndexedDB 存储层

## 概览

Web 应用使用 IndexedDB（数据库名 `doocs-md`，当前版本 `3`）作为主存储，localStorage 作为降级方案。所有存储初始化逻辑位于 `apps/web/src/storage/`。

```ts
// apps/web/src/storage/keys.ts
export const DB_NAME = `doocs-md`
export const DB_VERSION = 3
```

启动时由 `initStorage()` 驱动，流程为：打开数据库 → 迁移 localStorage 数据 → 预加载 KV 到内存 → 加载文章列表。

## Object Stores

数据库包含 6 个 object store：

| Store       | 版本 | Key                       | Value            | 用途                                         |
| ----------- | ---- | ------------------------- | ---------------- | -------------------------------------------- |
| `documents` | v1   | `id` (string)             | `StoredDocument` | 用户编写的所有 Markdown 文章                 |
| `settings`  | v1   | `key` (string)            | `{ key, value }` | 普通配置（主题、字号、编辑器设置等）         |
| `secrets`   | v1   | `key` (string)            | `{ key, value }` | 敏感配置（API key、图床 token 等）           |
| `cache`     | v1   | `key` (string)            | `{ key, value }` | 可清理的缓存数据（图片 hash、AI 对话记录等） |
| `meta`      | v1   | `key` (string)            | `{ key, value }` | 迁移标记等元数据                             |
| `emoji`     | v3   | `MD__emoji_blob:<sha256>` | `Blob`           | 自定义表情包图片二进制                       |

### documents

唯一带索引的 store，有两个索引：

- `updateDatetime` — 按更新时间排序文章列表
- `parentId` — 支持文件夹层级结构

```ts
interface StoredDocument {
  id: string
  title: string
  content: string
  history: { datetime: number | string, content: string }[]
  createDatetime: string
  updateDatetime: string
  parentId?: string | null
  collapsed?: boolean
}
```

### settings / secrets / cache

三个 store 结构相同（`{ key, value }` 字符串对），通过 key 命名规则自动路由（见下方"key 路由规则"）。`IndexedDBEngine.preload()` 在启动时将这三个 store 全量加载到内存 `Map<string, string>`，实现后续同步读取。

`emoji` store 不参与 preload，因为其 value 是 `Blob` 而非 `string`，按需读取。

## 版本迁移

每次修改数据库结构（新增/删除 store 或索引）必须递增 `DB_VERSION`，浏览器才会触发 `upgrade` 回调。

| 版本 | 变更                                                                      |
| ---- | ------------------------------------------------------------------------- |
| v1   | 创建 documents（含索引）、settings、secrets、cache、meta                  |
| v2   | 占位（无结构变更）                                                        |
| v3   | 新增 `emoji` store；将误存在 `cache` 中的 emoji Blob 迁移到 `emoji` store |

升级逻辑在 `apps/web/src/storage/db.ts` 的 `upgradeDB()` 函数中。该函数使用 idb 传入的 versionchange 事务，**不能**在该事务内再调用 `db.transaction()` 新建事务，否则抛 `InvalidStateError`。

```ts
export async function upgradeDB(db, oldVersion, _newVersion, transaction) {
  if (oldVersion < 1) { /* 创建 v1 stores */ }
  if (oldVersion < 3 && db.objectStoreNames.contains('cache')) {
    db.createObjectStore('emoji')
    // 用 versionchange 事务读取 cache、写入 emoji
    const cacheStore = transaction.objectStore('cache')
    const emojiStore = transaction.objectStore('emoji')
    // ...
  }
}
```

## 架构分层

```
index.ts          初始化入口 (initStorage)
  |
  +-- db.ts               数据库连接 + upgrade 迁移
  +-- engine.ts           StorageEngine 接口定义
  +-- engines/
  |     indexed-db.ts     IndexedDBEngine / LocalStorageEngine / RestfulStorageEngine
  +-- manager.ts          StorageManager（统一读写、reactive 响应式绑定）
  +-- keys.ts             store 名称、key 路由、迁移标记、白名单
  +-- prefix.ts           MD__ 前缀工具
  +-- quota.ts            配额超限检测
  +-- safe-access.ts      安全读写封装
  +-- repositories/
  |     documents.ts      文章 CRUD（序列化写入、内存缓存）
  |     emoji.ts          emoji Blob CRUD
  |     cache.ts          缓存条目自动裁剪
  +-- migrate/
        from-local-storage.ts   localStorage -> IndexedDB 一次性迁移
```

### StorageEngine 接口

三种实现，`StorageManager` 在初始化后选择其中一种：

- **IndexedDBEngine**（默认）：preload 后支持同步读取，启动时将 settings/secrets/cache 全量加载到内存 Map
- **LocalStorageEngine**（降级）：IndexedDB 不可用时的后备方案
- **RestfulStorageEngine**（预留）：通过 REST API 做远程存储，当前未启用

### StorageManager

统一入口，提供 `get/set/getJSON/setJSON/reactive/customReactive` 等方法。`reactive()` 返回一个 Vue ref，深层监听变化，以 300ms 防抖写入引擎。`pagehide` 时同步刷写未保存的数据到 localStorage 备份，下次启动恢复。

### key 路由规则

`resolveStoreName()` 根据 key 决定写入哪个 store：

| key 特征                                                                              | 目标 store | 判定规则        |
| ------------------------------------------------------------------------------------- | ---------- | --------------- |
| 以 `openai_key_`、`mpToken:` 等开头，或以 `Config` 结尾                               | `secrets`  | `isSecretKey()` |
| 精确匹配 `uploaded_image_map`、`ai_generated_images` 等，或以 `ai_conversation_` 开头 | `cache`    | `isCacheKey()`  |
| 其他                                                                                  | `settings` | 默认            |

所有 key 都通过 `addPrefix()` 加上 `MD__` 前缀，避免与浏览器扩展、第三方脚本冲突。

## 初始化流程

```
initStorage()
  1. 打开 IndexedDB（触发 upgrade 如果版本落后）
  2. 检查 meta[storage_migrated_v1]
     → 未迁移: migrateFromLocalStorage() 将 localStorage 数据搬入 IDB
  3. engine.preload() 将 settings/secrets/cache 加载到内存 Map
  4. migrateLegacyThemeSettings() 迁移旧版主题 key
  5. migrateMpProfile() 迁移旧版公众号信息
  6. cleanupMigratedLocalStorage() 清理已迁移的 localStorage 条目
  7. store.setEngine(engine) 切换到 IndexedDBEngine
  8. store.restorePendingWrites() 恢复上次 pagehide 备份
  9. documentRepo.loadAll() 加载所有文章到内存
```

任何步骤失败时，自动降级到 LocalStorageEngine + localStorage 文章存储（`setUseLegacyDocumentStorage(true)`）。

## localStorage 迁移

旧版本数据全部存在 localStorage。首次打开新版时 `migrateFromLocalStorage()` 执行一次性迁移：

1. 读取 `MD__posts`（旧文章列表），通过 `documentRepo.saveAll()` 写入 `documents` store
2. 遍历所有 localStorage key，按路由规则写入 settings/secrets/cache
3. 迁移完成后写入 `meta[storage_migrated_v1] = "1"` 标记
4. `cleanupMigratedLocalStorage()` 删除已迁移的 localStorage 条目

## 降级机制

以下情况自动降级到 LocalStorageEngine：

- `indexedDB` 全局对象不存在（隐私模式等）
- IndexedDB 打开/初始化抛异常
- localStorage 迁移失败（会在下次启动重试）

降级后文章存储改用 `store.get(MD__posts)` 读写 JSON 序列化的文章数组。

## Emoji 存储

v3 新增的 `emoji` store 采用与其它 store 不同的设计：

- **二进制存储**：value 是 `Blob`，不参与 preload，通过 `repositories/emoji.ts` 按需读写
- **元数据分离**：包列表（包名、文件名、尺寸等）存在 `settings` store 的 `MD__emoji_packs` key，通过 `store.reactive()` 响应式管理
- **URL 缓存**：`services/emoji/urlResolver.ts` 维护 `id → blob:` URL 内存映射，避免重复读取 IDB
  - 预览：`blob:` URL 直接用于 `<img src>`
  - 导出：`lib/export/inlineEmojiImages.ts` 将 `blob:` URL 转为 base64 data URL，确保微信编辑器能正确粘贴

详细设计见 `apps/web/src/stores/emojiPack.ts` 和 `packages/core/src/extensions/emoji.ts`。
