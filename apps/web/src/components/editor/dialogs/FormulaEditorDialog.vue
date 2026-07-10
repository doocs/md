<script setup lang="ts">
import { escapeHtml, normalizeFormulaInput, wrapFormula } from '@/lib/markdown/formula'
import { isMathJaxLoaded, loadMathJax } from '@/lib/preview/mathjax'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'

const { t } = useI18n()
const uiStore = useUIStore()
const editorStore = useEditorStore()

const latexText = ref(``)
const mathJaxReady = ref(false)
const latexInputRef = useTemplateRef<HTMLTextAreaElement>(`latexInputRef`)

const formulaGroups = [
  {
    key: `basic`,
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
    key: `greek`,
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
    key: `relation`,
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
    key: `symbol`,
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
    key: `logic`,
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
    key: `matrix`,
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
    key: `algebra`,
    items: [
      `\\left(x-1\\right)\\left(x+3\\right)`,
      `x=a_0+\\frac{1}{a_1+\\frac{1}{a_2}}`,
      `\\binom{n}{k}`,
      `\\frac{d}{dx}\\left(x^n\\right)=nx^{n-1}`,
      `x_{n+1}=x_n-\\frac{f(x_n)}{f'(x_n)}`,
    ],
  },
  {
    key: `calculus`,
    items: [
      `\\frac{dy}{dx}`,
      `\\int_a^b f(x)\\,dx`,
      `\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx`,
      `\\sum_{n=1}^{\\infty} \\frac{1}{n^2}`,
      `\\lim_{x\\to\\infty} \\left(1+\\frac{1}{x}\\right)^x`,
    ],
  },
  {
    key: `statistics`,
    items: [
      `\\mathbb{E}[X]`,
      `\\mathrm{Var}(X)`,
      `P(A\\mid B)`,
      `\\binom{n}{k}p^k(1-p)^{n-k}`,
      `\\sum_i p_i = 1`,
    ],
  },
  {
    key: `set`,
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
    key: `trigonometry`,
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
    key: `physics`,
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
    key: `chemistry`,
    items: [
      `2H_2 + O_2 \\rightarrow 2H_2O`,
      `A\\underset{b}{\\overset{a}{\\rightleftharpoons}}B`,
      `\\mathrm{CO_2 + H_2O \\rightarrow H_2CO_3}`,
      `\\mathrm{CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O}`,
      `\\mathrm{NaOH + HCl \\rightarrow NaCl + H_2O}`,
    ],
  },
] as const

const selectedGroupKey = ref<string>(formulaGroups[0].key)

const selectedGroup = computed(() => {
  return formulaGroups.find(group => group.key === selectedGroupKey.value) ?? formulaGroups[0]
})

function renderWithMathJax(latex: string, display: boolean): string {
  if (!isMathJaxLoaded()) {
    return `<div class="text-sm text-muted-foreground">${t('formula.loadingEngine')}</div>`
  }
  try {
    window.MathJax.texReset()
    const mjxContainer = window.MathJax.tex2svg(latex, { display })
    const svg = mjxContainer.firstChild as SVGElement
    svg.style.display = display ? `block` : `initial`
    svg.style.setProperty(`max-width`, `300vw`, `important`)
    svg.style.flexShrink = `0`
    return svg.outerHTML
  }
  catch {
    return `<div class="text-sm text-destructive break-all">${escapeHtml(latex)}</div>`
  }
}

const snippetPreviewCache = new Map<string, string>()
function renderSnippet(snippet: string): string {
  if (!mathJaxReady.value) {
    return `<div class="text-sm text-muted-foreground">${t('formula.loadingEngine')}</div>`
  }

  const cached = snippetPreviewCache.get(snippet)
  if (cached)
    return cached

  const html = renderWithMathJax(snippet, false)
  snippetPreviewCache.set(snippet, html)
  return html
}

const previewHtml = computed(() => {
  if (!mathJaxReady.value) {
    return `<div class="text-sm text-muted-foreground">${t('formula.loadingEngine')}</div>`
  }
  const content = latexText.value.trim()
  if (!content) {
    return `<div class="text-sm text-muted-foreground">${t('formula.previewEmpty')}</div>`
  }
  return renderWithMathJax(content, uiStore.formulaEditorDisplayMode)
})

watch(
  () => uiStore.isShowFormulaEditorDialog,
  async (open) => {
    if (!open) {
      mathJaxReady.value = false
      snippetPreviewCache.clear()
      return
    }

    try {
      await loadMathJax()
      snippetPreviewCache.clear()
      mathJaxReady.value = true
    }
    catch {
      mathJaxReady.value = false
    }

    const parsed = normalizeFormulaInput(uiStore.formulaEditorValue)
    latexText.value = parsed.latex || uiStore.formulaEditorValue
    uiStore.formulaEditorDisplayMode = uiStore.formulaEditorDisplayMode || parsed.displayMode
    selectedGroupKey.value = formulaGroups[0].key

    await nextTick()
    latexInputRef.value?.focus()
  },
  // Dialog is mounted via v-if when already open; without immediate the first open never loads MathJax.
  { immediate: true },
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
    toast.error(t('formula.contentRequired'))
    return
  }

  const wrapped = wrapFormula(content, uiStore.formulaEditorDisplayMode)
  const replaced = uiStore.formulaEditorSourceRaw
    ? editorStore.replaceText(uiStore.formulaEditorSourceRaw, wrapped)
    : false

  if (!replaced) {
    editorStore.replaceSelection(wrapped)
  }

  toast.success(t('formula.insertSuccess'))
  uiStore.closeFormulaEditor()
}

function toggleDisplayMode(nextMode: boolean) {
  uiStore.formulaEditorDisplayMode = nextMode
}

function setSelectedGroup(groupKey: string) {
  selectedGroupKey.value = groupKey
}
</script>

<template>
  <Dialog :open="uiStore.isShowFormulaEditorDialog" @update:open="onUpdate">
    <DialogContent class="sm:max-w-6xl max-h-[94vh] overflow-hidden flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-3 border-b">
        <DialogTitle>{{ t('formula.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('formula.description') }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-0">
        <div class="lg:min-h-0 border-b lg:border-b-0 lg:border-r p-6 space-y-4 lg:overflow-hidden flex flex-col">
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <label class="text-sm font-medium">{{ t('formula.latexInput') }}</label>
              <div class="inline-flex rounded-md border overflow-hidden">
                <button
                  type="button"
                  class="px-3 py-1.5 text-sm transition-colors"
                  :class="!uiStore.formulaEditorDisplayMode ? 'bg-foreground text-background' : 'bg-transparent text-muted-foreground'"
                  @click="toggleDisplayMode(false)"
                >
                  {{ t('formula.inline') }}
                </button>
                <button
                  type="button"
                  class="px-3 py-1.5 text-sm transition-colors"
                  :class="uiStore.formulaEditorDisplayMode ? 'bg-foreground text-background' : 'bg-transparent text-muted-foreground'"
                  @click="toggleDisplayMode(true)"
                >
                  {{ t('formula.block') }}
                </button>
              </div>
            </div>
            <textarea
              ref="latexInputRef"
              v-model="latexText"
              class="flex min-h-48 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              :placeholder="t('formula.latexPlaceholder')"
              @input="handleLatexInput"
            />
          </div>

          <div class="space-y-2 lg:flex-1 lg:min-h-0 flex flex-col">
            <label class="text-sm font-medium">{{ t('formula.preview') }}</label>
            <div class="rounded-lg border bg-muted/30 p-4 overflow-x-auto min-h-28 flex-1 flex items-center">
              <div class="w-full" v-html="previewHtml" />
            </div>
          </div>
        </div>

        <div class="lg:min-h-0 p-6 space-y-4 lg:overflow-hidden bg-muted/20 flex flex-col">
          <div class="space-y-2 flex-shrink-0">
            <h3 class="text-sm font-medium">
              {{ t('formula.library') }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="group in formulaGroups"
                :key="group.key"
                type="button"
                class="rounded-full border px-3 py-1.5 text-sm transition-colors"
                :class="selectedGroupKey === group.key ? 'bg-foreground text-background border-foreground' : 'bg-background text-foreground hover:bg-accent'"
                @click="setSelectedGroup(group.key)"
              >
                {{ t(`formula.groups.${group.key}`) }}
              </button>
            </div>
          </div>

          <div class="lg:min-h-0 lg:flex-1 lg:overflow-y-auto rounded-lg border bg-background p-3">
            <div class="grid grid-cols-2 xl:grid-cols-3 gap-2 content-start">
              <button
                v-for="snippet in selectedGroup.items"
                :key="`${selectedGroup.key}-${snippet}`"
                type="button"
                class="rounded-lg border bg-background px-3 py-2 text-left text-sm hover:border-primary hover:bg-primary/5 transition-colors"
                @click="insertSnippet(snippet)"
              >
                <span class="flex items-center overflow-x-auto whitespace-nowrap font-mono h-15" v-html="renderSnippet(snippet)" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="px-6 py-4 border-t bg-background">
        <Button variant="outline" @click="uiStore.closeFormulaEditor()">
          {{ t('common.cancel') }}
        </Button>
        <Button @click="saveFormula()">
          {{ t('formula.insertFormula') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
