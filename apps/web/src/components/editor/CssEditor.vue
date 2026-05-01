<script setup lang="ts">
import { exportMergedTheme } from '@md/core'
import { themeMap, themeOptionsMap } from '@md/shared'
import { Check, CheckSquare, Download, Edit3, Ellipsis, Eye, Plus, X } from 'lucide-vue-next'
import { useConfirmStore } from '@/stores/confirm'
import { useCssEditorStore } from '@/stores/cssEditor'
import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'
import { copyPlain } from '@/utils/clipboard'

const confirmStore = useConfirmStore()
const cssEditorStore = useCssEditorStore()
const uiStore = useUIStore()
const renderStore = useRenderStore()
const editorStore = useEditorStore()
const themeStore = useThemeStore()

const { isMobile } = storeToRefs(uiStore)
const { cssContentConfig, isSelectMode, selectedIds } = storeToRefs(cssEditorStore)

// 控制是否启用动画
const enableAnimation = ref(false)

// 监听 CssEditor 开关状态变化
watch(() => uiStore.isShowCssEditor, () => {
  if (isMobile.value) {
    // 在移动端,用户操作时启用动画
    enableAnimation.value = true
  }
})

// 监听设备类型变化，重置动画状态
watch(() => isMobile.value, () => {
  enableAnimation.value = false
})

const isOpenEditDialog = ref(false)
const editInputVal = ref(``)

const inlineEditId = ref<string | null>(null)
const inlineEditVal = ref(``)
let inlineInputRef: HTMLInputElement | null = null
function setInlineInputRef(el: unknown) {
  inlineInputRef = el as HTMLInputElement | null
}

function startInlineRename(tab: { id: string, title: string }) {
  inlineEditId.value = tab.id
  inlineEditVal.value = tab.title
  nextTick(() => {
    inlineInputRef?.select()
  })
}

function commitInlineRename() {
  const id = inlineEditId.value
  if (!id)
    return
  const trimmed = inlineEditVal.value.trim()
  if (!trimmed) {
    toast.error(`方案名不可为空`)
    inlineEditId.value = null
    return
  }
  const currentTab = cssContentConfig.value.tabs.find(t => t.id === id)
  if (currentTab && trimmed !== currentTab.title) {
    currentTab.title = trimmed
    currentTab.name = trimmed
    currentTab.updateDatetime = new Date()
    toast.success(`修改成功`)
  }
  inlineEditId.value = null
}

function cancelInlineRename() {
  inlineEditId.value = null
}

async function scrollToActiveTab() {
  await nextTick()
  const activeTab = document.querySelector('.cssEditor-wrapper .css-tab-active')
  if (activeTab) {
    activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
}

function rename(name: string) {
  editInputVal.value = name
  isOpenEditDialog.value = true
}

function editTabName() {
  if (!(editInputVal.value).trim()) {
    toast.error(`编辑失败，方案名不可为空`)
    return
  }

  cssEditorStore.renameTab(editInputVal.value)
  isOpenEditDialog.value = false
  toast.success(`修改成功`)
}

const isOpenAddDialog = ref(false)

const addInputVal = ref(``)
// 新建方案时选择的基础主题
const baseThemeForNew = ref<'blank' | 'default' | 'grace' | 'simple'>('blank')

async function addTab() {
  if (!(addInputVal.value).trim()) {
    toast.error(`新建失败，方案名不可为空`)
    return
  }

  // 根据选择的基础主题来初始化内容
  let initialContent = ''
  if (baseThemeForNew.value === 'blank') {
    initialContent = '' // 空白方案
  }
  else {
    // 基于内置主题
    initialContent = themeMap[baseThemeForNew.value]
  }

  const newTabName = addInputVal.value

  // addCssContentTab 会自动设置 active 并触发回调
  cssEditorStore.addCssContentTab(newTabName, initialContent)

  isOpenAddDialog.value = false
  toast.success(`新建成功`)

  // 重置为空白
  baseThemeForNew.value = 'blank'

  // 滚动到新创建的 tab
  scrollToActiveTab()
}

function removeHandler(targetId: string) {
  confirmStore.confirm({
    title: '提示',
    description: '此操作将删除该自定义方案，是否继续？',
    onConfirm: () => {
      const tabs = cssContentConfig.value.tabs
      if (tabs.length === 1) {
        toast.warning(`至少保留一个方案`)
        return
      }

      let activeId = cssContentConfig.value.active
      if (activeId === targetId) {
        tabs.forEach((tab, index) => {
          if (tab.id === targetId) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeId = nextTab.id
            }
          }
        })
      }

      cssEditorStore.tabChanged(activeId)
      cssContentConfig.value.tabs = tabs.filter(tab => tab.id !== targetId)

      toast.success(`删除成功`)
    },
  })
}

function addHandler() {
  addInputVal.value = `方案${cssContentConfig.value.tabs.length + 1}`
  baseThemeForNew.value = 'blank' // 重置选择
  isOpenAddDialog.value = true
}

const isOpenViewThemeDialog = ref(false)
const selectedViewTheme = ref<'default' | 'grace' | 'simple'>('default')

const contextMenuTargetId = ref<string | null>(null)
const showContextMenu = ref(false)
const contextMenuPos = ref({ x: 0, y: 0 })

function onContextMenu(e: MouseEvent, tabId: string) {
  e.preventDefault()
  e.stopPropagation()
  contextMenuTargetId.value = tabId
  contextMenuPos.value = { x: e.clientX, y: e.clientY }
  showContextMenu.value = true
}

function closeContextMenu() {
  showContextMenu.value = false
  contextMenuTargetId.value = null
}

function contextMenuRename() {
  const tab = cssContentConfig.value.tabs.find(t => t.id === contextMenuTargetId.value)
  if (tab) {
    rename(tab.name)
  }
  closeContextMenu()
}

function contextMenuExport() {
  if (contextMenuTargetId.value) {
    cssEditorStore.exportSingleTab(contextMenuTargetId.value)
  }
  closeContextMenu()
}

function contextMenuDelete() {
  if (contextMenuTargetId.value) {
    removeHandler(contextMenuTargetId.value)
  }
  closeContextMenu()
}

function enterSelectModeFromContextMenu() {
  if (contextMenuTargetId.value) {
    cssEditorStore.toggleSelectMode()
    cssEditorStore.toggleSelectTab(contextMenuTargetId.value)
  }
  closeContextMenu()
}

const allSelected = computed(
  () => cssContentConfig.value.tabs.length > 0 && selectedIds.value.length === cssContentConfig.value.tabs.length,
)

function openBatchDelConfirm() {
  const n = selectedIds.value.length
  const description = n === 1
    ? `此操作将删除「${cssContentConfig.value.tabs.find(t => t.id === selectedIds.value[0])?.title ?? ''}」，是否继续？`
    : `此操作将删除已选的 ${n} 个方案，是否继续？`

  confirmStore.confirm({
    title: '提示',
    description,
    confirmText: '确定删除',
    destructive: true,
    onConfirm: () => {
      cssEditorStore.batchDeleteTabs()
    },
  })
}

function handleTabClick(tabId: string) {
  if (isSelectMode.value) {
    cssEditorStore.toggleSelectTab(tabId)
  }
  else {
    tabChanged(tabId)
  }
}

function exitSelectMode() {
  cssEditorStore.toggleSelectMode()
}

function openViewThemeDialog() {
  selectedViewTheme.value = 'default'
  isOpenViewThemeDialog.value = true
}

// 复制主题 CSS
async function copyThemeCSS() {
  const css = themeMap[selectedViewTheme.value]
  await copyPlain(css)
  toast.success('已复制到剪贴板')
}

// 基于当前查看的主题新建方案
function createFromViewTheme() {
  isOpenViewThemeDialog.value = false
  // 设置基础主题并打开新建对话框
  baseThemeForNew.value = selectedViewTheme.value
  addInputVal.value = `基于${themeOptionsMap[selectedViewTheme.value].label}主题`
  isOpenAddDialog.value = true
}

function tabChanged(tabId: string | number) {
  cssEditorStore.tabChanged(tabId as string)
  // 切换后滚动到活跃的 tab
  scrollToActiveTab()
}

// 初始化 CSS 编辑器
onMounted(() => {
  // CSS 内容更新回调
  const handleCssUpdate = () => {
    // 1. 使用新主题系统应用 CSS
    themeStore.applyCurrentTheme()

    // 2. 触发编辑器刷新，重新渲染内容
    themeStore.updateCodeTheme()
    const raw = editorStore.getContent()
    renderStore.render(raw)
  }

  // 设置切换方案时的回调（与编辑时使用相同的逻辑）
  cssEditorStore.setOnTabChangedCallback(handleCssUpdate)

  // 初始化 CSS 编辑器
  cssEditorStore.initCssEditor(handleCssUpdate)

  // 初始化时滚动到活跃的 tab
  scrollToActiveTab()

  // 点击外部关闭右键菜单
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})

// 导出合并后的主题
function exportCurrentTheme() {
  const currentTab = cssContentConfig.value.tabs.find(tab => tab.id === cssContentConfig.value.active)
  if (!currentTab) {
    toast.error(`未找到当前方案`)
    return
  }

  const currentThemeName = currentTab.title || currentTab.name

  // 使用新的导出函数（包含 default 基础）
  const baseTheme = themeStore.theme === `default`
    ? themeMap.default
    : `${themeMap.default}\n\n${themeMap[themeStore.theme]}`

  exportMergedTheme(
    currentTab.content,
    baseTheme,
    {
      primaryColor: themeStore.primaryColor,
      fontFamily: themeStore.fontFamily,
      fontSize: themeStore.fontSize,
    },
    currentThemeName,
  )
}
</script>

<template>
  <!-- 移动端遮罩层 -->
  <div
    v-if="isMobile && uiStore.isShowCssEditor"
    class="fixed inset-0 bg-black/50 z-40"
    @click="uiStore.isShowCssEditor = false"
  />

  <div
    v-show="isMobile ? uiStore.isShowCssEditor : true"
    class="cssEditor-wrapper h-full flex flex-col overflow-y-auto"
    :class="{
      'fixed top-0 right-0 w-full h-full z-100 bg-background border-l shadow-lg mobile-css-editor': isMobile,
      'animate': isMobile && enableAnimation,
    }"
    :style="isMobile ? { transform: uiStore.isShowCssEditor ? 'translateX(0)' : 'translateX(100%)' } : undefined"
  >
    <!-- Tab 栏 + 工具栏合并 -->
    <div class="flex items-center h-9 px-2 shrink-0 border-b border-border">
      <div class="flex-1 flex items-center gap-0 overflow-x-auto custom-scrollbar min-w-0 h-full">
        <div
          v-for="item in cssContentConfig.tabs"
          :key="item.id"
          class="group/tab relative flex items-center gap-1.5 shrink-0 h-full px-3 text-xs transition-colors duration-150"
          :class="[
            cssContentConfig.active === item.id && !isSelectMode ? 'css-tab-active text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
            isSelectMode && selectedIds.includes(item.id) ? 'bg-accent text-accent-foreground' : '',
          ]"
          @click="handleTabClick(item.id)"
          @dblclick.stop="startInlineRename(item)"
          @contextmenu="onContextMenu($event, item.id)"
        >
          <span
            v-if="isSelectMode"
            class="inline-flex items-center justify-center size-4 rounded border transition-colors mr-1"
            :class="selectedIds.includes(item.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-border'"
          >
            <Check v-if="selectedIds.includes(item.id)" class="size-3" />
          </span>
          <input
            v-if="inlineEditId === item.id"
            :ref="setInlineInputRef"
            v-model="inlineEditVal"
            class="w-[80px] bg-transparent outline-none border-b border-primary text-xs"
            @click.stop
            @keyup.enter="commitInlineRename"
            @keyup.escape="cancelInlineRename"
            @blur="commitInlineRename"
          >
          <span v-else class="truncate max-w-[100px]">{{ item.title }}</span>

          <span
            v-if="cssContentConfig.active === item.id && !isSelectMode"
            class="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-primary"
          />

          <DropdownMenu v-if="cssContentConfig.active === item.id && !isSelectMode">
            <DropdownMenuTrigger as-child>
              <span
                class="inline-flex items-center justify-center size-4 rounded text-muted-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-100 cursor-pointer"
                @click.stop
              >
                <Ellipsis class="size-3" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-32">
              <DropdownMenuItem @click.stop="rename(item.name)">
                <Edit3 class="mr-2 size-4" /> 重命名
              </DropdownMenuItem>
              <DropdownMenuItem @click.stop="cssEditorStore.exportSingleTab(item.id)">
                <Download class="mr-2 size-4" /> 导出
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-if="cssContentConfig.tabs.length > 1"
                class="text-destructive focus:text-destructive"
                @click.stop="removeHandler(item.id)"
              >
                <X class="mr-2 size-4" /> 删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- 工具按钮组 -->
      <div class="flex items-center shrink-0">
        <!-- 新增 Tab -->
        <button
          class="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
          @click="addHandler"
        >
          <Plus class="size-3.5" />
        </button>

        <!-- 内置主题 -->
        <button
          class="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
          @click="openViewThemeDialog"
        >
          <Eye class="size-3.5" />
        </button>

        <!-- 导出主题 -->
        <button
          class="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
          @click="exportCurrentTheme"
        >
          <Download class="size-3.5" />
        </button>

        <!-- 关闭 -->
        <button
          class="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
          @click="uiStore.isShowCssEditor = false"
        >
          <X class="size-3.5" />
        </button>
      </div>
    </div>

    <!-- CSS编辑器内容区域 -->
    <div class="flex-1 min-h-0">
      <textarea
        id="cssEditor"
        type="textarea"
        placeholder="Your custom css here."
      />
    </div>

    <!-- 选择模式底部操作栏 -->
    <Transition name="slide-up">
      <div
        v-if="isSelectMode"
        class="shrink-0 border-t border-border bg-background px-3 pt-2 pb-3 space-y-2"
      >
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">
            已选
            <strong class="text-foreground font-semibold">{{ selectedIds.length }}</strong>
            个
          </span>
          <div class="flex items-center gap-2 text-muted-foreground">
            <button
              class="hover:text-foreground transition-colors"
              @click="allSelected ? cssEditorStore.clearSelection() : cssEditorStore.selectAllTabs()"
            >
              {{ allSelected ? '取消全选' : '全选' }}
            </button>
            <span class="opacity-30">·</span>
            <button class="hover:text-foreground transition-colors" @click="exitSelectMode">
              完成
            </button>
          </div>
        </div>
        <div class="flex">
          <button
            class="flex flex-1 items-center justify-center rounded-md py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
            title="导出"
            :disabled="!selectedIds.length"
            @click="cssEditorStore.batchExportTabs"
          >
            <Download class="size-4" />
          </button>
          <div class="mx-1 self-center h-5 w-px bg-border/60 shrink-0" />
          <button
            class="flex flex-1 items-center justify-center rounded-md py-2 text-destructive/60 transition-colors hover:bg-destructive/8 hover:text-destructive disabled:pointer-events-none disabled:opacity-35"
            :title="selectedIds.length >= cssContentConfig.tabs.length ? '至少保留一个方案' : '删除'"
            :disabled="!selectedIds.length || selectedIds.length >= cssContentConfig.tabs.length"
            @click="openBatchDelConfirm()"
          >
            <X class="size-4" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div
        v-if="showContextMenu"
        class="fixed z-50 min-w-[120px] rounded-md border border-border bg-background p-1 shadow-md animate-in fade-in-0 zoom-in-95"
        :style="{ left: `${contextMenuPos.x}px`, top: `${contextMenuPos.y}px` }"
        @click.stop
      >
        <button
          class="flex w-full items-center rounded-sm px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
          @click="contextMenuRename"
        >
          <Edit3 class="mr-2 size-3.5" /> 重命名
        </button>
        <button
          class="flex w-full items-center rounded-sm px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
          @click="contextMenuExport"
        >
          <Download class="mr-2 size-3.5" /> 导出
        </button>
        <div class="my-1 h-px bg-border" />
        <button
          v-if="cssContentConfig.tabs.length > 1"
          class="flex w-full items-center rounded-sm px-2 py-1.5 text-xs text-destructive hover:bg-destructive/8 transition-colors"
          @click="contextMenuDelete"
        >
          <X class="mr-2 size-3.5" /> 删除
        </button>
        <button
          class="flex w-full items-center rounded-sm px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
          @click="enterSelectModeFromContextMenu"
        >
          <CheckSquare class="mr-2 size-3.5" /> 多选
        </button>
      </div>
    </Teleport>

    <!-- 新增弹窗 -->
    <Dialog v-model:open="isOpenAddDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新建自定义 CSS</DialogTitle>
          <DialogDescription>
            请输入方案名称，并选择初始模板
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">方案名称</label>
            <Input v-model="addInputVal" placeholder="输入方案名称" @keyup.enter="addTab" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">初始模板</label>
            <Select v-model="baseThemeForNew">
              <SelectTrigger>
                <SelectValue placeholder="选择初始模板" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blank">
                  空白方案
                </SelectItem>
                <SelectItem value="default">
                  基于经典主题
                </SelectItem>
                <SelectItem value="grace">
                  基于优雅主题
                </SelectItem>
                <SelectItem value="simple">
                  基于简洁主题
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              选择一个内置主题作为起点，可以在其基础上进行修改
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isOpenAddDialog = false">
            取消
          </Button>
          <Button @click="addTab()">
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 重命名弹窗 -->
    <Dialog v-model:open="isOpenEditDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑方案名称</DialogTitle>
          <DialogDescription>
            请输入新的方案名称
          </DialogDescription>
        </DialogHeader>
        <Input v-model="editInputVal" @keyup.enter="editTabName" />
        <DialogFooter>
          <Button variant="outline" @click="isOpenEditDialog = false">
            取消
          </Button>
          <Button @click="editTabName">
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>

  <!-- 查看内置主题对话框 -->
  <Dialog v-model:open="isOpenViewThemeDialog">
    <DialogContent class="sm:max-w-4xl max-h-[90vh] flex flex-col" @open-auto-focus.prevent>
      <DialogHeader>
        <DialogTitle>查看内置主题样式</DialogTitle>
        <DialogDescription>
          查看并复制内置主题的 CSS 代码，或基于它们创建新方案
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 flex-1 min-h-0 flex flex-col">
        <!-- 主题选择器 -->
        <div class="space-y-2">
          <label class="text-sm font-medium">选择主题</label>
          <Select v-model="selectedViewTheme">
            <SelectTrigger class="w-full mt-2 sm:w-[200px] focus-visible:ring-0 focus-visible:ring-offset-0">
              <SelectValue placeholder="选择主题" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">
                {{ themeOptionsMap.default.label }}
              </SelectItem>
              <SelectItem value="grace">
                {{ themeOptionsMap.grace.label }}
              </SelectItem>
              <SelectItem value="simple">
                {{ themeOptionsMap.simple.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- CSS 代码查看器 -->
        <div class="flex-1 min-h-0 border rounded-lg overflow-auto">
          <pre class="h-full overflow-auto p-4 bg-muted text-sm"><code>{{ themeMap[selectedViewTheme] }}</code></pre>
        </div>
      </div>

      <DialogFooter class="flex-col sm:flex-row gap-2">
        <Button variant="outline" @click="isOpenViewThemeDialog = false">
          关闭
        </Button>
        <Button variant="outline" @click="copyThemeCSS">
          复制全部
        </Button>
        <Button variant="outline" @click="createFromViewTheme">
          基于此主题新建
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style lang="less" scoped>
/* 隐藏滚动条但保持滚动功能 */
.custom-scrollbar {
  /* Firefox */
  scrollbar-width: none;

  /* Chrome, Edge, Safari */
  &::-webkit-scrollbar {
    display: none;
  }
}

/* 移动端CSS编辑器动画 - 只有添加了 animate 类才启用 */
.mobile-css-editor.animate {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* 底部操作栏动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 200ms ease, opacity 200ms ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
