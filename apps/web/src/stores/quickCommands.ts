import { ref, watch } from 'vue'
import { t } from '@/i18n/translate'
import { store } from '@/storage'

export interface QuickCommandPersisted {
  id: string
  label: string
  template: string // use {{sel}} as selection placeholder
}

export interface QuickCommandRuntime extends QuickCommandPersisted {
  buildPrompt: (sel?: string) => string
}

const STORAGE_KEY = `quick_commands`

function hydrate(cmd: QuickCommandPersisted): QuickCommandRuntime {
  return {
    ...cmd,
    buildPrompt: (sel = ``) =>
      cmd.template.replace(/\{\{\s*sel\s*\}\}/gi, sel),
  }
}

function getDefaultCommands(): QuickCommandPersisted[] {
  return [
    { id: `polish`, label: t('ai.quickCommand.polish.label'), template: t('ai.quickCommand.polish.template') },
    { id: `to-en`, label: t('ai.quickCommand.toEn.label'), template: t('ai.quickCommand.toEn.template') },
    { id: `to-zh`, label: t('ai.quickCommand.toZh.label'), template: t('ai.quickCommand.toZh.template') },
    { id: `summary`, label: t('ai.quickCommand.summary.label'), template: t('ai.quickCommand.summary.template') },
  ]
}

export const useQuickCommandsStore = defineStore(`quickCommands`, () => {
  // ---------- state ----------
  const commands = ref<QuickCommandRuntime[]>([])

  // ---------- helpers ----------
  async function save() {
    const toSave: QuickCommandPersisted[] = commands.value.map(
      ({ id, label, template }) => ({ id, label, template }),
    )
    await store.setJSON(STORAGE_KEY, toSave)
  }

  async function reloadFromStorage() {
    const parsed = await store.getJSON<QuickCommandPersisted[]>(STORAGE_KEY)

    if (parsed && Array.isArray(parsed)) {
      try {
        commands.value = parsed.map(hydrate)
      }
      catch (e) {
        console.warn(t('ai.quickCommand.parseFailed'), e)
        commands.value = getDefaultCommands().map(hydrate)
        await save()
      }
    }
    else {
      commands.value = getDefaultCommands().map(hydrate)
      await save()
    }
  }

  // ---------- CRUD ----------
  function add(label: string, template: string) {
    const id = crypto.randomUUID()
    commands.value.push(hydrate({ id, label, template }))
  }

  function update(id: string, label: string, template: string) {
    const idx = commands.value.findIndex(c => c.id === id)
    if (idx !== -1)
      commands.value[idx] = hydrate({ id, label, template })
  }

  function remove(id: string) {
    commands.value = commands.value.filter(c => c.id !== id)
  }

  // ---------- init ----------
  reloadFromStorage()
  watch(commands, save, { deep: true })

  return { commands, add, update, remove, reloadFromStorage }
})
