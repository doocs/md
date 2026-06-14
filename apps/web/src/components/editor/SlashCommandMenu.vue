<script setup lang="ts">
import type { Component } from 'vue'
import type { SlashCommandItem } from '@/composables/slashCommands'
import {
  Blocks,
  Bold,
  Braces,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Palette,
  Quote,
  RefreshCw,
  Search,
  Sigma,
  Strikethrough,
  Table,
  Trash2,
  WandSparkles,
} from '@lucide/vue'
import {
  SLASH_BASIC_BLOCK_IDS,
  SLASH_BASIC_FORMAT_IDS,
  SLASH_EDIT_DOC_IDS,
  SLASH_HEADING_IDS,
} from '@/composables/slashCommands'
import { useSlashMenuPosition } from '@/composables/useSlashMenuPosition'
import { useSlashMenuScrollHint } from '@/composables/useSlashMenuScrollHint'

const props = defineProps<{
  visible: boolean
  position: { x: number, y: number, top: number }
  activeIndex: number
  filter: string
  containerEl: HTMLElement | null
  basicCommands: SlashCommandItem[]
  commonCommands: SlashCommandItem[]
  editCommands: SlashCommandItem[]
  styleCommands: SlashCommandItem[]
  filteredCommands: SlashCommandItem[]
}>()

const emit = defineEmits<{
  execute: [command: SlashCommandItem]
  close: []
}>()

const iconMap: Record<string, Component> = {
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
  'code': Braces,
  'formula': Sigma,
  'image': Image,
  'table': Table,
  'blocks': Blocks,
  'bold': Bold,
  'italic': Italic,
  'strikethrough': Strikethrough,
  'code-inline': Code,
  'link-wrap': Link,
  'format': WandSparkles,
  'reset': RefreshCw,
  'clear': Trash2,
  'find': Search,
  'theme': Palette,
  'color': Palette,
}

const menuRef = useTemplateRef<HTMLDivElement>(`menuRef`)
const scrollRef = useTemplateRef<HTMLDivElement>(`scrollRef`)

const visibleRef = toRef(props, `visible`)
const positionRef = toRef(props, `position`)
const filterRef = toRef(props, `filter`)
const activeIndexRef = toRef(props, `activeIndex`)
const containerElRef = toRef(props, `containerEl`)
const filteredCommandsLengthRef = computed(() => props.filteredCommands.length)

const isFiltering = computed(() => props.filter.trim().length > 0)

const headingCommands = computed(() =>
  props.basicCommands.filter(c => SLASH_HEADING_IDS.includes(c.id as typeof SLASH_HEADING_IDS[number])),
)

const basicBlockCommands = computed(() =>
  props.basicCommands.filter(c => SLASH_BASIC_BLOCK_IDS.includes(c.id as typeof SLASH_BASIC_BLOCK_IDS[number])),
)

const basicFormatCommands = computed(() =>
  props.basicCommands.filter(c => SLASH_BASIC_FORMAT_IDS.includes(c.id as typeof SLASH_BASIC_FORMAT_IDS[number])),
)

const editDocCommands = computed(() =>
  props.editCommands.filter(c => SLASH_EDIT_DOC_IDS.includes(c.id as typeof SLASH_EDIT_DOC_IDS[number])),
)

const styleThemeCommands = computed(() =>
  props.styleCommands.filter(c => c.id.startsWith(`theme-`)),
)

const styleColorCommands = computed(() =>
  props.styleCommands.filter(c => c.id.startsWith(`color-`)),
)

const {
  adjustedPosition,
  updateAdjustedPosition,
  bindContainerObserver,
  unbindContainerObserver,
} = useSlashMenuPosition({
  visible: visibleRef,
  position: positionRef,
  filter: filterRef,
  containerEl: containerElRef,
  menuRef,
  isFiltering,
})

const {
  canScrollDown,
  updateScrollHint,
  scrollActiveIntoView,
  bindScrollContentObserver,
  unbindScrollContentObserver,
} = useSlashMenuScrollHint({
  visible: visibleRef,
  scrollRef,
  menuRef,
  filter: filterRef,
  filteredCommandsLength: filteredCommandsLengthRef,
  activeIndex: activeIndexRef,
})

function handleOutsideClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node))
    emit(`close`)
}

function getGlobalIndex(command: SlashCommandItem): number {
  return props.filteredCommands.indexOf(command)
}

function isActive(command: SlashCommandItem) {
  return getGlobalIndex(command) === props.activeIndex
}

function shortThemeLabel(label: string) {
  return label.replace(/^主题 · /, ``)
}

function shortColorLabel(label: string) {
  return label.replace(/^主题色 · /, ``)
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      bindContainerObserver()
      bindScrollContentObserver()
      nextTick(() => {
        updateAdjustedPosition()
        updateScrollHint()
        document.addEventListener(`mousedown`, handleOutsideClick)
        scrollActiveIntoView()
      })
    }
    else {
      unbindContainerObserver()
      unbindScrollContentObserver()
      canScrollDown.value = false
      document.removeEventListener(`mousedown`, handleOutsideClick)
    }
  },
)

watch(
  () => [props.visible, props.position.x, props.position.y, props.position.top, props.filter, props.containerEl] as const,
  () => {
    if (!props.visible)
      return
    nextTick(() => {
      updateAdjustedPosition()
      updateScrollHint()
    })
  },
)

watch(
  () => props.activeIndex,
  () => {
    scrollActiveIntoView()
  },
)

onUnmounted(() => {
  unbindContainerObserver()
  unbindScrollContentObserver()
  document.removeEventListener(`mousedown`, handleOutsideClick)
})
</script>

<template>
  <Transition name="slash-menu">
    <div
      v-if="visible"
      ref="menuRef"
      class="slash-command-menu rounded-md shadow-md"
      :style="{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }"
      @contextmenu.capture.prevent.stop
    >
      <div class="slash-scroll-wrap">
        <!-- 搜索模式：统一列表 -->
        <div
          v-if="isFiltering"
          ref="scrollRef"
          class="slash-scroll slash-scroll--filter"
          :class="{ 'slash-scroll--has-hint': canScrollDown }"
          @scroll="updateScrollHint"
        >
          <div class="slash-filter-hint">
            匹配「{{ filter }}」
          </div>
          <div class="slash-list">
            <button
              v-for="cmd in filteredCommands"
              :key="cmd.id"
              class="slash-list-item"
              :class="{ active: isActive(cmd) }"
              :data-active="isActive(cmd)"
              :title="cmd.label"
              @mousedown.prevent="emit('execute', cmd)"
            >
              <span class="slash-list-icon">
                <span
                  v-if="cmd.swatch"
                  class="slash-swatch"
                  :style="{ backgroundColor: cmd.swatch }"
                />
                <template v-else-if="cmd.id === 'markdown'">
                  <svg viewBox="0 0 24 24" class="size-3.5" fill="currentColor" aria-hidden="true">
                    <path d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6h17.12C21.35 6 22 6.63 22 7.41v9.18c0 .78-.65 1.41-1.44 1.41zM7 15V9l2 2 2-2v6h2V9l2 2 2-2v6h1V9h-1l-2 2-2-2H9L7 9v6H6V9H5v6h2z" />
                  </svg>
                </template>
                <component :is="iconMap[cmd.icon]" v-else-if="iconMap[cmd.icon]" class="size-3.5" />
                <span v-else class="slash-list-fallback">{{ cmd.label.slice(0, 1) }}</span>
              </span>
              <span class="slash-list-text">
                <span class="slash-list-label">{{ cmd.label }}</span>
                <span class="slash-list-group">{{ cmd.groupLabel }}</span>
              </span>
            </button>
          </div>
        </div>

        <!-- 默认模式：分区紧凑布局 -->
        <div
          v-else
          ref="scrollRef"
          class="slash-scroll"
          :class="{ 'slash-scroll--has-hint': canScrollDown }"
          @scroll="updateScrollHint"
        >
          <section v-if="headingCommands.length > 0 || basicBlockCommands.length > 0 || basicFormatCommands.length > 0" class="slash-section">
            <div class="slash-section-title">
              基础
            </div>
            <div v-if="headingCommands.length > 0" class="slash-heading-row">
              <button
                v-for="cmd in headingCommands"
                :key="cmd.id"
                class="slash-heading-chip"
                :class="{ active: isActive(cmd) }"
                :data-active="isActive(cmd)"
                :title="cmd.label"
                @mousedown.prevent="emit('execute', cmd)"
              >
                {{ cmd.label }}
              </button>
            </div>
            <div class="slash-icon-row">
              <button
                v-for="cmd in basicBlockCommands"
                :key="cmd.id"
                class="slash-icon-btn"
                :class="{ active: isActive(cmd) }"
                :data-active="isActive(cmd)"
                :title="cmd.label"
                @mousedown.prevent="emit('execute', cmd)"
              >
                <component :is="iconMap[cmd.icon]" v-if="iconMap[cmd.icon]" class="size-3.5" />
              </button>
              <button
                v-for="cmd in basicFormatCommands"
                :key="cmd.id"
                class="slash-icon-btn"
                :class="{ active: isActive(cmd) }"
                :data-active="isActive(cmd)"
                :title="cmd.label"
                @mousedown.prevent="emit('execute', cmd)"
              >
                <component :is="iconMap[cmd.icon]" v-if="iconMap[cmd.icon]" class="size-3.5" />
              </button>
            </div>
          </section>

          <section v-if="commonCommands.length > 0" class="slash-section">
            <div class="slash-section-title">
              常用
            </div>
            <div class="slash-grid-2">
              <button
                v-for="cmd in commonCommands"
                :key="cmd.id"
                class="slash-grid-item"
                :class="{ active: isActive(cmd) }"
                :data-active="isActive(cmd)"
                @mousedown.prevent="emit('execute', cmd)"
              >
                <span class="slash-grid-icon">
                  <template v-if="cmd.id === 'markdown'">
                    <svg viewBox="0 0 24 24" class="size-3.5" fill="currentColor" aria-hidden="true">
                      <path d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6h17.12C21.35 6 22 6.63 22 7.41v9.18c0 .78-.65 1.41-1.44 1.41zM7 15V9l2 2 2-2v6h2V9l2 2 2-2v6h1V9h-1l-2 2-2-2H9L7 9v6H6V9H5v6h2z" />
                    </svg>
                  </template>
                  <component :is="iconMap[cmd.icon]" v-else-if="iconMap[cmd.icon]" class="size-3.5" />
                </span>
                <span>{{ cmd.label }}</span>
              </button>
            </div>
          </section>

          <section v-if="editDocCommands.length > 0" class="slash-section">
            <div class="slash-section-title">
              编辑
            </div>
            <div class="slash-chip-row slash-chip-row--compact">
              <button
                v-for="cmd in editDocCommands"
                :key="cmd.id"
                class="slash-chip slash-chip--half"
                :class="{ active: isActive(cmd) }"
                :data-active="isActive(cmd)"
                @mousedown.prevent="emit('execute', cmd)"
              >
                <component :is="iconMap[cmd.icon]" v-if="iconMap[cmd.icon]" class="size-3.5 shrink-0" />
                <span>{{ cmd.label }}</span>
              </button>
            </div>
          </section>

          <section v-if="styleCommands.length > 0" class="slash-section slash-section--last">
            <div class="slash-section-title">
              样式
            </div>

            <div v-if="styleThemeCommands.length > 0" class="slash-subsection">
              <div class="slash-subsection-title">
                主题
              </div>
              <div class="slash-theme-row">
                <button
                  v-for="cmd in styleThemeCommands"
                  :key="cmd.id"
                  class="slash-theme-pill"
                  :class="{ active: isActive(cmd) }"
                  :data-active="isActive(cmd)"
                  :title="cmd.label"
                  @mousedown.prevent="emit('execute', cmd)"
                >
                  {{ shortThemeLabel(cmd.label) }}
                </button>
              </div>
            </div>

            <div v-if="styleColorCommands.length > 0" class="slash-subsection">
              <div class="slash-subsection-title">
                主题色
              </div>
              <div class="slash-color-grid">
                <button
                  v-for="cmd in styleColorCommands"
                  :key="cmd.id"
                  class="slash-color-btn"
                  :class="{ active: isActive(cmd) }"
                  :data-active="isActive(cmd)"
                  :title="shortColorLabel(cmd.label)"
                  @mousedown.prevent="emit('execute', cmd)"
                >
                  <span
                    class="slash-swatch slash-swatch--lg"
                    :style="{ backgroundColor: cmd.swatch }"
                  />
                </button>
              </div>
            </div>
          </section>
        </div>

        <div
          v-if="canScrollDown"
          class="slash-scroll-hint"
          aria-hidden="true"
        >
          <ChevronDown class="size-4" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slash-command-menu {
  position: absolute;
  z-index: 9999;
  width: 260px;
  border: 1px solid hsl(var(--border) / 0.8);
  background-color: hsl(var(--popover));
  color: hsl(var(--popover-foreground));
  overflow: hidden;
}

.slash-scroll-wrap {
  position: relative;
}

.slash-scroll {
  max-height: 380px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.slash-scroll::-webkit-scrollbar {
  display: none;
}

.slash-scroll-hint {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  height: 32px;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
  pointer-events: none;
  color: hsl(var(--muted-foreground));
  background: linear-gradient(
    to bottom,
    hsl(var(--popover) / 0),
    hsl(var(--popover) / 0.88) 45%,
    hsl(var(--popover)) 100%
  );
}

.slash-scroll--filter {
  max-height: 320px;
  padding: 6px;
}

.slash-scroll--has-hint {
  padding-bottom: 28px;
}

.slash-filter-hint {
  padding: 4px 8px 8px;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.slash-section + .slash-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid hsl(var(--border) / 0.6);
}

.slash-section--last {
  padding-bottom: 2px;
}

.slash-section-title {
  padding: 0 4px 6px;
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
}

.slash-subsection {
  margin-top: 8px;
}

.slash-subsection-title {
  padding: 0 4px 5px;
  font-size: 10px;
  color: hsl(var(--muted-foreground) / 0.85);
}

.slash-heading-row {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 4px;
  margin-bottom: 6px;
}

.slash-heading-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-radius: 8px;
  border: 1px solid hsl(var(--border) / 0.5);
  background: hsl(var(--muted) / 0.35);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  color: hsl(var(--foreground));
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.slash-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.slash-chip-row--compact {
  margin-top: 6px;
}

.slash-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: hsl(var(--muted) / 0.45);
  font-size: 12px;
  cursor: pointer;
  color: hsl(var(--foreground));
  transition: background 0.12s, border-color 0.12s;
}

.slash-chip--half {
  flex: 1 1 calc(50% - 2px);
  min-width: 0;
  justify-content: center;
}

.slash-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
}

.slash-grid-item {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: hsl(var(--muted) / 0.35);
  font-size: 12px;
  cursor: pointer;
  color: hsl(var(--foreground));
  text-align: left;
  transition: background 0.12s, border-color 0.12s;
}

.slash-grid-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: hsl(var(--background) / 0.7);
  color: hsl(var(--foreground));
  flex-shrink: 0;
}

.slash-icon-row {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  border-radius: 10px;
  background: hsl(var(--muted) / 0.35);
}

.slash-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 32px;
  border-radius: 7px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: hsl(var(--foreground));
  transition: background 0.12s, color 0.12s;
}

.slash-theme-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
}

.slash-theme-pill {
  height: 30px;
  border-radius: 8px;
  border: 1px solid hsl(var(--border) / 0.5);
  background: hsl(var(--muted) / 0.35);
  font-size: 12px;
  cursor: pointer;
  color: hsl(var(--foreground));
  transition: background 0.12s, border-color 0.12s;
}

.slash-color-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 5px;
}

.slash-color-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  padding: 0;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: border-color 0.12s, transform 0.12s;
}

.slash-swatch {
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  border: 1px solid rgb(0 0 0 / 0.08);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.15);
}

.slash-swatch--lg {
  width: 22px;
  height: 22px;
}

.slash-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.slash-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  color: hsl(var(--foreground));
  transition: background 0.12s;
}

.slash-list-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: hsl(var(--muted) / 0.55);
  flex-shrink: 0;
}

.slash-list-fallback {
  font-size: 12px;
  font-weight: 600;
}

.slash-list-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.slash-list-label {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
}

.slash-list-group {
  font-size: 10px;
  color: hsl(var(--muted-foreground));
}

.slash-heading-chip:hover,
.slash-chip:hover,
.slash-grid-item:hover,
.slash-icon-btn:hover,
.slash-theme-pill:hover,
.slash-color-btn:hover,
.slash-list-item:hover {
  background: hsl(var(--accent) / 0.65);
}

.slash-heading-chip.active,
.slash-chip.active,
.slash-grid-item.active,
.slash-icon-btn.active,
.slash-theme-pill.active,
.slash-list-item.active {
  background: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
  border-color: hsl(var(--primary) / 0.25);
}

.slash-color-btn.active {
  border-color: hsl(var(--primary));
  transform: scale(1.05);
}

.slash-grid-item.active .slash-grid-icon,
.slash-list-item.active .slash-list-icon {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

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
