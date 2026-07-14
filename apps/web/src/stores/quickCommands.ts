import { computed, ref, watch } from 'vue'
import { t } from '@/i18n/translate'
import { store } from '@/storage'
import { useLocaleStore } from '@/stores/locale'

export interface QuickCommandPersisted {
  id: string
  label: string
  template: string // use {{sel}} as selection placeholder
}

export interface QuickCommandRuntime extends QuickCommandPersisted {
  builtin: boolean
  buildPrompt: (sel?: string) => string
}

const STORAGE_KEY = `quick_commands`

/** Built-in command ids — labels/templates always resolve from i18n; not editable or removable. */
export const BUILTIN_QUICK_COMMAND_IDS = [`polish`, `to-en`, `to-zh`, `summary`] as const

const BUILTIN_ID_SET = new Set<string>(BUILTIN_QUICK_COMMAND_IDS)

const BUILTIN_I18N_KEYS: Record<(typeof BUILTIN_QUICK_COMMAND_IDS)[number], { label: string, template: string }> = {
  'polish': { label: `ai.quickCommand.polish.label`, template: `ai.quickCommand.polish.template` },
  'to-en': { label: `ai.quickCommand.toEn.label`, template: `ai.quickCommand.toEn.template` },
  'to-zh': { label: `ai.quickCommand.toZh.label`, template: `ai.quickCommand.toZh.template` },
  'summary': { label: `ai.quickCommand.summary.label`, template: `ai.quickCommand.summary.template` },
}

export function isBuiltinQuickCommand(id: string): boolean {
  return BUILTIN_ID_SET.has(id)
}

function hydrate(cmd: QuickCommandPersisted, builtin: boolean): QuickCommandRuntime {
  return {
    ...cmd,
    builtin,
    buildPrompt: (sel = ``) =>
      cmd.template.replace(/\{\{\s*sel\s*\}\}/gi, sel),
  }
}

function getBuiltinCommands(): QuickCommandRuntime[] {
  return BUILTIN_QUICK_COMMAND_IDS.map((id) => {
    const keys = BUILTIN_I18N_KEYS[id]
    return hydrate({ id, label: t(keys.label), template: t(keys.template) }, true)
  })
}

function normalizeCustom(list: unknown[]): QuickCommandPersisted[] {
  return list
    .filter((item): item is QuickCommandPersisted => {
      if (!item || typeof item !== `object`)
        return false
      const cmd = item as Record<string, unknown>
      return typeof cmd.id === `string`
        && typeof cmd.label === `string`
        && typeof cmd.template === `string`
        && !isBuiltinQuickCommand(cmd.id)
    })
    .map(({ id, label, template }) => ({ id, label, template }))
}

export const useQuickCommandsStore = defineStore(`quickCommands`, () => {
  const localeStore = useLocaleStore()
  const customCommands = ref<QuickCommandPersisted[]>([])

  // Built-ins always resolve from i18n so they follow the active locale.
  const commands = computed<QuickCommandRuntime[]>(() => {
    void localeStore.locale
    return [
      ...getBuiltinCommands(),
      ...customCommands.value.map(cmd => hydrate(cmd, false)),
    ]
  })

  async function save() {
    await store.setJSON(STORAGE_KEY, customCommands.value)
  }

  async function reloadFromStorage() {
    const parsed = await store.getJSON<unknown[]>(STORAGE_KEY)

    if (parsed && Array.isArray(parsed)) {
      try {
        customCommands.value = normalizeCustom(parsed)
        // Migrate away from persisting built-in copies (old format stored all commands).
        await save()
      }
      catch (e) {
        console.warn(t(`ai.quickCommand.parseFailed`), e)
        customCommands.value = []
        await save()
      }
    }
    else {
      customCommands.value = []
      await save()
    }
  }

  function add(label: string, template: string) {
    const id = crypto.randomUUID()
    customCommands.value.push({ id, label, template })
  }

  function update(id: string, label: string, template: string) {
    if (isBuiltinQuickCommand(id))
      return
    const idx = customCommands.value.findIndex(c => c.id === id)
    if (idx !== -1)
      customCommands.value[idx] = { id, label, template }
  }

  function remove(id: string) {
    if (isBuiltinQuickCommand(id))
      return
    customCommands.value = customCommands.value.filter(c => c.id !== id)
  }

  reloadFromStorage()
  watch(customCommands, save, { deep: true })

  return { commands, add, update, remove, reloadFromStorage }
})
