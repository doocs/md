<script setup lang="ts">
import type { SlashCommandItem } from '@/composables/useSlashCommand'
import {
  Braces,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Image,
  Link,
  List,
  ListOrdered,
  Minus,
  Quote,
  Sigma,
  Table,
} from 'lucide-vue-next'

const props = defineProps<{
  visible: boolean
  position: { x: number, y: number }
  activeIndex: number
  basicCommands: SlashCommandItem[]
  commonCommands: SlashCommandItem[]
  filteredCommands: SlashCommandItem[]
}>()

const emit = defineEmits<{
  execute: [command: SlashCommandItem]
  close: []
}>()

// Map icon names to lucide components
const iconMap: Record<string, any> = {
  'H1': Heading1,
  'H2': Heading2,
  'H3': Heading3,
  'H4': Heading4,
  'H5': Heading5,
  'H6': Heading6,
  'ordered-list': ListOrdered,
  'unordered-list': List,
  'blockquote': Quote,
  'divider': Minus,
  'link': Link,
  'code': Braces,
  'formula': Sigma,
  'image': Image,
  'table': Table,
}

// Heading items use text labels in the grid; others use icon + label in list
const headingIds = [`h1`, `h2`, `h3`, `h4`, `h5`, `h6`]

const menuRef = useTemplateRef<HTMLDivElement>(`menuRef`)

// Calculate adjusted position so the menu stays in viewport
const adjustedPosition = computed(() => {
  const MENU_HEIGHT = 320
  const MENU_WIDTH = 240
  const PADDING = 8

  let { x, y } = props.position

  // Adjust horizontal
  if (x + MENU_WIDTH > window.innerWidth - PADDING) {
    x = window.innerWidth - MENU_WIDTH - PADDING
  }
  if (x < PADDING) {
    x = PADDING
  }

  // Adjust vertical — prefer below cursor, flip above if insufficient space
  if (y + MENU_HEIGHT > window.innerHeight - PADDING) {
    // Position above cursor (need cursor top, approximate with -24px offset)
    y = y - MENU_HEIGHT - 28
  }

  return { x, y }
})

// Close on outside click
function handleOutsideClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    emit(`close`)
  }
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      nextTick(() => {
        document.addEventListener(`mousedown`, handleOutsideClick)
        scrollActiveIntoView()
      })
    }
    else {
      document.removeEventListener(`mousedown`, handleOutsideClick)
    }
  },
)

onUnmounted(() => {
  document.removeEventListener(`mousedown`, handleOutsideClick)
})

// Scroll active item into view when navigating
watch(
  () => props.activeIndex,
  () => {
    scrollActiveIntoView()
  },
)

function scrollActiveIntoView() {
  nextTick(() => {
    const el = menuRef.value?.querySelector(`[data-active="true"]`)
    el?.scrollIntoView({ block: `nearest` })
  })
}

function getGlobalIndex(command: SlashCommandItem): number {
  return props.filteredCommands.indexOf(command)
}
</script>

<template>
  <Transition name="slash-menu">
    <div
      v-if="visible"
      ref="menuRef"
      class="slash-command-menu"
      :style="{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }"
    >
      <!-- Basic group -->
      <template v-if="basicCommands.length > 0">
        <div class="slash-group-label">
          基础
          <span class="slash-group-count">{{ basicCommands.length }}</span>
        </div>
        <!-- Heading grid row -->
        <div v-if="basicCommands.some(c => headingIds.includes(c.id))" class="slash-heading-grid">
          <button
            v-for="cmd in basicCommands.filter(c => headingIds.includes(c.id))"
            :key="cmd.id"
            class="slash-heading-btn"
            :class="{ active: getGlobalIndex(cmd) === activeIndex }"
            :data-active="getGlobalIndex(cmd) === activeIndex"
            @mousedown.prevent="emit('execute', cmd)"
          >
            {{ cmd.label }}
          </button>
        </div>
        <!-- Non-heading basic items grid -->
        <div class="slash-misc-grid">
          <button
            v-for="cmd in basicCommands.filter(c => !headingIds.includes(c.id))"
            :key="cmd.id"
            class="slash-misc-btn"
            :class="{ active: getGlobalIndex(cmd) === activeIndex }"
            :data-active="getGlobalIndex(cmd) === activeIndex"
            @mousedown.prevent="emit('execute', cmd)"
          >
            <span class="slash-misc-icon">
              <component :is="iconMap[cmd.icon]" v-if="iconMap[cmd.icon]" class="w-4 h-4" />
            </span>
            <span class="slash-misc-label">{{ cmd.label }}</span>
          </button>
        </div>
        <div v-if="commonCommands.length > 0" class="slash-separator" />
      </template>

      <!-- Common group -->
      <template v-if="commonCommands.length > 0">
        <div class="slash-group-label">
          常用
          <span class="slash-group-count">{{ commonCommands.length }}</span>
        </div>
        <div class="slash-common-list">
          <button
            v-for="cmd in commonCommands"
            :key="cmd.id"
            class="slash-common-item"
            :class="{ active: getGlobalIndex(cmd) === activeIndex }"
            :data-active="getGlobalIndex(cmd) === activeIndex"
            @mousedown.prevent="emit('execute', cmd)"
          >
            <span class="slash-common-icon">
              <!-- Special icon for markdown -->
              <template v-if="cmd.id === 'markdown'">
                <svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6h17.12C21.35 6 22 6.63 22 7.41v9.18c0 .78-.65 1.41-1.44 1.41zM7 15V9l2 2 2-2v6h2V9l2 2 2-2v6h1V9h-1l-2 2-2-2H9L7 9v6H6V9H5v6h2z" />
                </svg>
              </template>
              <component :is="iconMap[cmd.icon]" v-else-if="iconMap[cmd.icon]" class="w-4 h-4" />
            </span>
            <span class="slash-common-label">{{ cmd.label }}</span>
          </button>
        </div>
      </template>
    </div>
  </Transition>
</template>

<style scoped>
.slash-command-menu {
  position: fixed;
  z-index: 9999;
  width: 240px;
  border-radius: 10px;
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--popover));
  color: hsl(var(--popover-foreground));
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 6px;
  font-size: 13px;
}

.slash-group-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px 4px;
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  letter-spacing: 0.04em;
  text-transform: uppercase;
  user-select: none;
}

.slash-group-count {
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  border-radius: 10px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.6;
}

/* ── Heading grid ── */
.slash-heading-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 3px;
  padding: 2px 2px 4px;
}

.slash-heading-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  background: transparent;
  border: none;
  color: hsl(var(--foreground));
  transition: background 0.12s;
  outline: none;
}

.slash-heading-btn:hover,
.slash-heading-btn.active {
  background: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

/* ── Misc grid (ordered/unordered list, quote, divider) ── */
.slash-misc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
  padding: 2px 2px 4px;
}

.slash-misc-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 52px;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  border: none;
  color: hsl(var(--foreground));
  transition: background 0.12s;
  outline: none;
}

.slash-misc-btn:hover,
.slash-misc-btn.active {
  background: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

.slash-misc-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--foreground));
}

.slash-misc-label {
  font-size: 10px;
  color: hsl(var(--muted-foreground));
  white-space: nowrap;
}

.slash-misc-btn:hover .slash-misc-label,
.slash-misc-btn.active .slash-misc-label {
  color: hsl(var(--accent-foreground));
}

.slash-separator {
  height: 1px;
  background: hsl(var(--border));
  margin: 4px 4px;
}

/* ── Common list ── */
.slash-common-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 2px;
}

.slash-common-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  border: none;
  color: hsl(var(--foreground));
  text-align: left;
  width: 100%;
  transition: background 0.12s;
  outline: none;
}

.slash-common-item:hover,
.slash-common-item.active {
  background: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

.slash-common-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
  flex-shrink: 0;
  transition: background 0.12s, color 0.12s;
}

.slash-common-item:hover .slash-common-icon,
.slash-common-item.active .slash-common-icon {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.slash-common-label {
  font-size: 13px;
  font-weight: 500;
}

/* ── Transition ── */
.slash-menu-enter-active,
.slash-menu-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.slash-menu-enter-from,
.slash-menu-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
