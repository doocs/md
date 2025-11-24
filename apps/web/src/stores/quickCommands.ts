import { ref, watch } from 'vue'
import { store } from '@/utils/storage'

export interface QuickCommandPersisted {
  id: string
  label: string
  template: string // 用 {{sel}} 占位
}

export interface QuickCommandRuntime extends QuickCommandPersisted {
  buildPrompt: (sel?: string) => string
}

const STORAGE_KEY = `quick_commands`

// 把持久化的对象转换为可执行的 buildPrompt
function hydrate(cmd: QuickCommandPersisted): QuickCommandRuntime {
  return {
    ...cmd,
    buildPrompt: (sel = ``) =>
      cmd.template.replace(/\{\{\s*sel\s*\}\}/gi, sel),
  }
}

// 4 条默认指令
const DEFAULT_COMMANDS: QuickCommandPersisted[] = [
  { id: `polish`, label: `润色`, template: `请润色以下内容：\n\n{{sel}}` },
  { id: `to-en`, label: `翻译成英文`, template: `请将以下内容翻译为英文：\n\n{{sel}}` },
  { id: `to-zh`, label: `翻译成中文`, template: `Please translate the following content into Chinese:\n\n{{sel}}` },
  { id: `summary`, label: `总结`, template: `请对以下内容进行总结：\n\n{{sel}}` },
]

export const useQuickCommands = defineStore(`quickCommands`, () => {
  // ---------- state ----------
  const commands = ref<QuickCommandRuntime[]>([])

  // ---------- helpers ----------
  async function save() {
    const toSave: QuickCommandPersisted[] = commands.value.map(
      ({ id, label, template }) => ({ id, label, template }),
    )
    await store.setJSON(STORAGE_KEY, toSave)
  }

  async function load() {
    const parsed = await store.getJSON<QuickCommandPersisted[]>(STORAGE_KEY)

    if (parsed && Array.isArray(parsed)) {
      try {
        commands.value = parsed.map(hydrate)
      }
      catch (e) {
        console.warn(`解析快捷指令失败，已恢复默认值`, e)
        commands.value = DEFAULT_COMMANDS.map(hydrate)
        await save()
      }
    }
    else {
      commands.value = DEFAULT_COMMANDS.map(hydrate)
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
  load()
  watch(commands, save, { deep: true })

  return { commands, add, update, remove }
})
