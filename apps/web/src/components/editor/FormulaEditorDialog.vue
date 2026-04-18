<script setup lang="ts">
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'
import { escapeHtml, normalizeFormulaInput, wrapFormula } from '@/utils/formula'

const uiStore = useUIStore()
const editorStore = useEditorStore()

const latexText = ref(``)
const latexInputRef = useTemplateRef<HTMLTextAreaElement>(`latexInputRef`)

const formulaGroups = [
  {
    name: `基础`,
    items: [
      `x^2+y^2=z^2`,
      `\\frac{a}{b}`,
      `\\sqrt{x}`,
      `\\sqrt[n]{x}`,
      `\\sum_{i=1}^{n} i`,
      `\\prod_{i=1}^{n} i`,
      `\\int_0^1 x\\,dx`,
      `\\lim_{x\\to 0}\\frac{\\sin x}{x}`,
    ],
  },
  {
    name: `希腊`,
    items: [
      `\\alpha`,
      `\\beta`,
      `\\gamma`,
      `\\delta`,
      `\\theta`,
      `\\lambda`,
      `\\mu`,
      `\\omega`,
    ],
  },
  {
    name: `关系`,
    items: [
      `a=b`,
      `a\\neq b`,
      `a\\leq b`,
      `a\\geq b`,
      `a\\approx b`,
      `a\\sim b`,
      `a\\equiv b`,
      `a\\propto b`,
    ],
  },
  {
    name: `符号`,
    items: [
      `\\infty`,
      `\\partial`,
      `\\nabla`,
      `\\pm`,
      `\\times`,
      `\\div`,
      `\\cdot`,
      `\\angle`,
    ],
  },
  {
    name: `逻辑`,
    items: [
      `p\\land q`,
      `p\\lor q`,
      `\\neg p`,
      `p\\Rightarrow q`,
      `p\\Leftrightarrow q`,
      `x\\in A`,
      `x\\notin A`,
      `A\\subseteq B`,
    ],
  },
  {
    name: `矩阵`,
    items: [
      `\\begin{bmatrix}a & b\\\\c & d\\end{bmatrix}`,
      `\\begin{pmatrix}1 & 0\\\\0 & 1\\end{pmatrix}`,
      `\\begin{cases}a & x>0\\\\b & x\\le 0\\end{cases}`,
      `\\begin{aligned}a&=b+c\\\\d&=e+f\\end{aligned}`,
      `\\begin{vmatrix}a & b\\\\c & d\\end{vmatrix}`,
      `\\begin{matrix}1 & 2\\\\3 & 4\\end{matrix}`,
    ],
  },
  {
    name: `代数`,
    items: [
      `\\left(x-1\\right)\\left(x+3\\right)`,
      `x=a_0+\\frac{1}{a_1+\\frac{1}{a_2}}`,
      `\\binom{n}{k}`,
      `\\frac{d}{dx}\\left(x^n\\right)=nx^{n-1}`,
      `x_{n+1}=x_n-\\frac{f(x_n)}{f'(x_n)}`,
    ],
  },
  {
    name: `微积分`,
    items: [
      `\\frac{dy}{dx}`,
      `\\int_a^b f(x)\\,dx`,
      `\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx`,
      `\\sum_{n=1}^{\\infty} \\frac{1}{n^2}`,
      `\\lim_{x\\to\\infty} \\left(1+\\frac{1}{x}\\right)^x`,
    ],
  },
  {
    name: `统计`,
    items: [
      `\\mathbb{E}[X]`,
      `\\mathrm{Var}(X)`,
      `P(A\\mid B)`,
      `\\binom{n}{k}p^k(1-p)^{n-k}`,
      `\\sum_i p_i = 1`,
    ],
  },
  {
    name: `集合`,
    items: [
      `A\\cup B`,
      `A\\cap B`,
      `A\\setminus B`,
      `A\\subset B`,
      `A\\subseteq B`,
      `A\\supseteq B`,
    ],
  },
  {
    name: `三角`,
    items: [
      `\\sin\\theta`,
      `\\cos\\theta`,
      `\\tan\\theta`,
      `\\cot\\theta`,
      `\\arcsin x`,
      `\\cos^2\\theta+\\sin^2\\theta=1`,
    ],
  },
  {
    name: `物理`,
    items: [
      `E=mc^2`,
      `F=ma`,
      `p=mv`,
      `V=IR`,
      `s=ut+\\frac{1}{2}at^2`,
      `\\Delta E = Q - W`,
    ],
  },
  {
    name: `化学`,
    items: [
      `2H_2 + O_2 \\rightarrow 2H_2O`,
      `A\\underset{b}{\\overset{a}{\\rightleftharpoons}}B`,
      `\\mathrm{CO_2 + H_2O \\rightarrow H_2CO_3}`,
      `\\mathrm{CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O}`,
      `\\mathrm{NaOH + HCl \\rightarrow NaCl + H_2O}`,
    ],
  },
] as const

const selectedGroupName = ref<string>(formulaGroups[0].name)

const selectedGroup = computed(() => {
  return formulaGroups.find(group => group.name === selectedGroupName.value) ?? formulaGroups[0]
})

const previewHtml = computed(() => {
  const content = latexText.value.trim()
  if (!content) {
    return `<div class="text-sm text-muted-foreground">输入公式后会在这里显示预览</div>`
  }

  try {
    return katex.renderToString(content, {
      displayMode: uiStore.formulaEditorDisplayMode,
      throwOnError: false,
      strict: false,
      trust: true,
    })
  }
  catch {
    return `<div class="text-sm text-destructive break-all">${escapeHtml(content)}</div>`
  }
})

watch(
  () => uiStore.isShowFormulaEditorDialog,
  async (open) => {
    if (!open)
      return

    const parsed = normalizeFormulaInput(uiStore.formulaEditorValue)
    latexText.value = parsed.latex || uiStore.formulaEditorValue
    uiStore.formulaEditorDisplayMode = uiStore.formulaEditorDisplayMode || parsed.displayMode
    selectedGroupName.value = formulaGroups[0].name

    await nextTick()
    latexInputRef.value?.focus()
  },
)

function onUpdate(open: boolean) {
  if (!open) {
    uiStore.closeFormulaEditor()
  }
}

function handleLatexInput() {
  if (latexText.value.includes(`\n`)) {
    uiStore.formulaEditorDisplayMode = true
  }
}

function insertSnippet(snippet: string) {
  const input = latexInputRef.value
  if (!input) {
    latexText.value += snippet
    return
  }

  const start = input.selectionStart ?? latexText.value.length
  const end = input.selectionEnd ?? start
  latexText.value = `${latexText.value.slice(0, start)}${snippet}${latexText.value.slice(end)}`

  nextTick(() => {
    input.focus()
    const cursor = start + snippet.length
    input.setSelectionRange(cursor, cursor)
  })
}

function saveFormula() {
  const content = latexText.value.trim()
  if (!content) {
    toast.error(`请输入公式内容`)
    return
  }

  const wrapped = wrapFormula(content, uiStore.formulaEditorDisplayMode)
  const replaced = uiStore.formulaEditorSourceRaw
    ? editorStore.replaceText(uiStore.formulaEditorSourceRaw, wrapped)
    : false

  if (!replaced) {
    editorStore.replaceSelection(wrapped)
  }

  toast.success(`公式已插入`)
  uiStore.closeFormulaEditor()
}

function toggleDisplayMode(nextMode: boolean) {
  uiStore.formulaEditorDisplayMode = nextMode
}

function setSelectedGroup(groupName: string) {
  selectedGroupName.value = groupName
}
</script>

<template>
  <Dialog :open="uiStore.isShowFormulaEditorDialog" @update:open="onUpdate">
    <DialogContent class="sm:max-w-6xl max-h-[94vh] overflow-hidden flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-3 border-b">
        <DialogTitle>公式编辑器</DialogTitle>
        <DialogDescription>
          支持 LaTeX 编辑、实时预览和公式库插入。
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-0">
        <div class="min-h-0 border-b lg:border-b-0 lg:border-r p-6 space-y-4 overflow-hidden flex flex-col">
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <label class="text-sm font-medium">LaTeX 输入</label>
              <div class="inline-flex rounded-md border overflow-hidden">
                <button
                  type="button"
                  class="px-3 py-1.5 text-sm transition-colors"
                  :class="!uiStore.formulaEditorDisplayMode ? 'bg-foreground text-background' : 'bg-transparent text-muted-foreground'"
                  @click="toggleDisplayMode(false)"
                >
                  行内
                </button>
                <button
                  type="button"
                  class="px-3 py-1.5 text-sm transition-colors"
                  :class="uiStore.formulaEditorDisplayMode ? 'bg-foreground text-background' : 'bg-transparent text-muted-foreground'"
                  @click="toggleDisplayMode(true)"
                >
                  块级
                </button>
              </div>
            </div>
            <textarea
              ref="latexInputRef"
              v-model="latexText"
              class="flex min-h-48 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="输入 LaTeX 公式"
              @input="handleLatexInput"
            />
          </div>

          <div class="space-y-2 flex-1 min-h-0 flex flex-col">
            <label class="text-sm font-medium">预览</label>
            <div class="rounded-lg border bg-muted/30 p-4 overflow-x-auto min-h-28 flex-1 flex items-center">
              <div class="w-full" v-html="previewHtml" />
            </div>
          </div>
        </div>

        <div class="min-h-0 p-6 space-y-4 overflow-hidden bg-muted/20 flex flex-col">
          <div class="space-y-2 flex-shrink-0">
            <h3 class="text-sm font-medium">公式库</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="group in formulaGroups"
                :key="group.name"
                type="button"
                class="rounded-full border px-3 py-1.5 text-sm transition-colors"
                :class="selectedGroupName === group.name ? 'bg-foreground text-background border-foreground' : 'bg-background text-foreground hover:bg-accent'"
                @click="setSelectedGroup(group.name)"
              >
                {{ group.name }}
              </button>
            </div>
          </div>

          <div class="min-h-0 flex-1 overflow-hidden rounded-lg border bg-background p-3">
            <div class="grid grid-cols-2 xl:grid-cols-3 gap-2 h-full content-start overflow-hidden">
              <button
                v-for="snippet in selectedGroup.items"
                :key="`${selectedGroup.name}-${snippet}`"
                type="button"
                class="rounded-lg border bg-background px-3 py-2 text-left text-sm hover:border-primary hover:bg-primary/5 transition-colors"
                @click="insertSnippet(snippet)"
              >
                <span class="flex items-center overflow-x-auto whitespace-nowrap font-mono h-15" v-html="katex.renderToString(snippet, { throwOnError: false, strict: false, trust: true })" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="px-6 py-4 border-t bg-background">
        <Button variant="outline" @click="uiStore.closeFormulaEditor()">
          取消
        </Button>
        <Button @click="saveFormula()">
          插入公式
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
