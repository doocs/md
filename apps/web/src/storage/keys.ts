import { prefix } from '@md/shared/configs'
import { addPrefix } from '@/storage/prefix'

/** IndexedDB database name */
export const DB_NAME = `doocs-md`
export const DB_VERSION = 2

export const STORE_DOCUMENTS = `documents`
export const STORE_SETTINGS = `settings`
export const STORE_SECRETS = `secrets`
export const STORE_CACHE = `cache`
export const STORE_META = `meta`

export const MIGRATION_V1_KEY = addPrefix(`storage_migrated_v1`)
export const LOCALSTORAGE_CLEANED_KEY = addPrefix(`storage_localstorage_cleaned_v1`)

/** localStorage key prefix written by this app (MD__) */
export const LOCALSTORAGE_KEY_PREFIX = `${prefix}__`

/** App localStorage keys without the MD__ prefix */
export const UNPREFIXED_APP_KEYS = new Set([
  `isCiteStatus`,
  `isCountStatus`,
  `legend`,
  `previewWidth`,
  `showAIToolbox`,
  `viewMode`,
  `previewDevice`,
  `locale`,
  `openai_type`,
  `openai_temperature`,
  `openai_max_token`,
  `quick_commands`,
  `imgHost`,
  `useCompression`,
  `isShowCssEditor`,
  `hasShownAIToolboxHint`,
  `isMobile`,
  `formCustomConfig`,
])

/** Document-related settings keys (IDB settings only, not the documents table) */
export const KEY_CURRENT_POST_ID = addPrefix(`current_post_id`)
export const KEY_SORT_MODE = addPrefix(`sort_mode`)

/** Legacy localStorage posts bundle key (migration only) */
export const LEGACY_POSTS_KEY = addPrefix(`posts`)

const SECRET_SUFFIXES = [`Config`] as const

const SECRET_PREFIXES = [
  `openai_key_`,
  `openai_model_`,
  `openai_image_key_`,
  `openai_image_endpoint_`,
  `openai_image_model_`,
  `mpToken:`,
] as const

const CACHE_EXACT_KEYS = new Set([
  `uploaded_image_map`,
  `ai_generated_images`,
  `ai_image_timestamps`,
  `ai_image_prompts`,
  `ai_memory_context`,
  `ai_conversation_list`,
])

const CACHE_PREFIXES = [`ai_conversation_`] as const

/** Image host / AI secret configuration keys */
export function isSecretKey(key: string): boolean {
  if (SECRET_SUFFIXES.some(s => key.endsWith(s)))
    return true
  return SECRET_PREFIXES.some(p => key.startsWith(p))
}

/** Clearable cache data keys */
export function isCacheKey(key: string): boolean {
  if (CACHE_EXACT_KEYS.has(key))
    return true
  return CACHE_PREFIXES.some(p => key.startsWith(p))
}

/** IndexedDB object store names */
export function resolveStoreName(key: string): typeof STORE_SETTINGS | typeof STORE_SECRETS | typeof STORE_CACHE {
  if (isSecretKey(key))
    return STORE_SECRETS
  if (isCacheKey(key))
    return STORE_CACHE
  return STORE_SETTINGS
}

/** Legacy theme keys (removed after migration) */
export const LEGACY_THEME_KEYS = [`fonts`, `size`, `color`, `codeBlockTheme`, `headingStyles`, `isMacCodeBlock`, `isShowLineNumber`] as const

/** Whether a localStorage key belongs to this app (safe to delete after migration) */
export function isAppLocalStorageKey(key: string): boolean {
  if (key.startsWith(LOCALSTORAGE_KEY_PREFIX))
    return true
  if ((LEGACY_THEME_KEYS as readonly string[]).includes(key))
    return true
  if (UNPREFIXED_APP_KEYS.has(key))
    return true
  if (isSecretKey(key) || isCacheKey(key))
    return true
  return false
}

export const KEY_LEGACY_MIGRATED = addPrefix(`legacy_migrated`)
export const KEY_THEME = addPrefix(`theme`)
export const KEY_THEME_SETTINGS = addPrefix(`themeSettings`)

export const KEY_MP_PROFILE_MIGRATED = addPrefix(`mp_profile_migrated`)

/** Max entries in image hash cache */
export const MAX_IMAGE_MAP_ENTRIES = 500

/** Max entries in AI-generated image cache */
export const MAX_AI_IMAGE_ENTRIES = 50
