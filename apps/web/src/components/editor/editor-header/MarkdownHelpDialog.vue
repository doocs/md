<script setup lang="ts">
import { BookOpen, Code2, FileText, FunctionSquare, PieChart } from 'lucide-vue-next'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([`close`])

const activeTab = ref(`basic`)

function onUpdate(val: boolean) {
  if (!val) {
    emit(`close`)
  }
}

interface SyntaxItem {
  name: string
  syntax: string
  example?: string
  tip?: string
}

interface SyntaxCategory {
  id: string
  label: string
  icon: Component
  items: SyntaxItem[]
}

const syntaxCategories: SyntaxCategory[] = [
  {
    id: `basic`,
    label: `基础语法`,
    icon: FileText,
    items: [
      {
        name: `标题`,
        syntax: `# 一级标题\n## 二级标题\n### 三级标题`,
        tip: `# 数量表示标题级别，最多支持六级`,
      },
      {
        name: `粗体`,
        syntax: `**粗体文本**`,
        example: `粗体文本`,
      },
      {
        name: `斜体`,
        syntax: `*斜体文本*`,
        example: `斜体文本`,
      },
      {
        name: `删除线`,
        syntax: `~~删除线~~`,
        example: `删除线`,
      },
      {
        name: `高亮`,
        syntax: `==高亮文本==`,
        example: `高亮文本`,
      },
      {
        name: `下划线`,
        syntax: `++下划线++`,
        example: `下划线`,
      },
      {
        name: `行内代码`,
        syntax: `\`代码\``,
        example: `代码`,
      },
      {
        name: `无序列表`,
        syntax: `- 项目 1\n- 项目 2\n  - 嵌套项目`,
        tip: `使用 -、* 或 + 加空格`,
      },
      {
        name: `有序列表`,
        syntax: `1. 项目 1\n2. 项目 2`,
        tip: `数字加点号`,
      },
      {
        name: `链接`,
        syntax: `[显示文本](链接地址)`,
        example: `Doocs`,
        tip: `微信公众号不支持外链跳转`,
      },
      {
        name: `图片`,
        syntax: `![描述](图片地址)`,
        tip: `支持网络图片地址`,
      },
      {
        name: `引用`,
        syntax: `> 引用内容\n>> 嵌套引用`,
      },
      {
        name: `分割线`,
        syntax: `---`,
        tip: `三个或更多 -、* 或 _`,
      },
      {
        name: `表格`,
        syntax: `| 列1 | 列2 |\n| --- | --- |\n| 内容1 | 内容2 |`,
        tip: `点击「编辑 > 插入表格」快速创建`,
      },
    ],
  },
  {
    id: `code`,
    label: `代码块`,
    icon: Code2,
    items: [
      {
        name: `基本代码块`,
        syntax: `\`\`\`\n代码内容\n\`\`\``,
      },
      {
        name: `指定语言`,
        syntax: `\`\`\`js\nconsole.log("Hello")\n\`\`\``,
        tip: `支持 js、ts、python、java、go 等多种语言`,
      },
    ],
  },
  {
    id: `math`,
    label: `数学公式`,
    icon: FunctionSquare,
    items: [
      {
        name: `行内公式`,
        syntax: `$E = mc^2$`,
        example: `E = mc²`,
      },
      {
        name: `块级公式`,
        syntax: `$$\n\\int_0^1 x^2 dx\n$$`,
      },
      {
        name: `LaTeX 格式（行内）`,
        syntax: `\\(x^2 + y^2\\)`,
        tip: `LaTeX 标准格式`,
      },
      {
        name: `LaTeX 格式（块级）`,
        syntax: `\\[\n\\sum_{i=1}^n x_i\n\\]`,
      },
    ],
  },
  {
    id: `diagram`,
    label: `图表绘制`,
    icon: PieChart,
    items: [
      {
        name: `Mermaid 流程图`,
        syntax: `\`\`\`mermaid\ngraph LR\n  A --> B\n\`\`\``,
        tip: `支持流程图、时序图、饼图等`,
      },
      {
        name: `PlantUML`,
        syntax: `\`\`\`plantuml\n@startuml\nA -> B\n@enduml\n\`\`\``,
        tip: `详见 plantuml.com`,
      },
      {
        name: `信息图`,
        syntax: `\`\`\`infographic\ninfographic list-row\n...\n\`\`\``,
        tip: `AntV 信息图引擎`,
      },
    ],
  },
  {
    id: `other`,
    label: `其他语法`,
    icon: BookOpen,
    items: [
      {
        name: `注音标注`,
        syntax: `[文字]{注音}\n[文字]^(注音)`,
        example: `你好`,
        tip: `支持日语假名、拼音等`,
      },
      {
        name: `幻灯片`,
        syntax: `<![alt](url1),![alt](url2)>`,
        tip: `横屏滑动图片，仅支持微信公众号`,
      },
      {
        name: `HTML 标签`,
        syntax: `<center>居中内容</center>`,
        tip: `部分 HTML 标签可用`,
      },
    ],
  },
]

function copySyntax(syntax: string) {
  navigator.clipboard.writeText(syntax)
  toast.success(`已复制到剪贴板`)
}
</script>

<template>
  <Dialog :open="props.visible" @update:open="onUpdate">
    <DialogContent class="sm:max-w-2xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>Markdown 语法帮助</DialogTitle>
        <DialogDescription>
          查看支持的 Markdown 语法，点击语法可直接复制
        </DialogDescription>
      </DialogHeader>

      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-5">
          <TabsTrigger
            v-for="cat in syntaxCategories"
            :key="cat.id"
            :value="cat.id"
            class="!flex-col !items-center !justify-center gap-1 py-2 px-2 [&>span]:flex [&>span]:flex-col [&>span]:items-center [&>span]:justify-center"
          >
            <component :is="cat.icon" class="size-4" />
            <span class="text-xs whitespace-normal">{{ cat.label }}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          v-for="cat in syntaxCategories"
          :key="cat.id"
          :value="cat.id"
          class="mt-4 overflow-y-auto max-h-[50vh] space-y-3"
        >
          <div
            v-for="item in cat.items"
            :key="item.name"
            class="rounded-lg border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
            @click="copySyntax(item.syntax)"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-sm">{{ item.name }}</span>
              <span class="text-xs text-muted-foreground">点击复制</span>
            </div>
            <pre class="text-xs bg-muted/50 p-2 rounded overflow-x-auto font-mono">{{ item.syntax }}</pre>
            <div v-if="item.tip" class="mt-2 text-xs text-muted-foreground">
              💡 {{ item.tip }}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter class="sm:justify-between">
        <span class="text-xs text-muted-foreground hidden sm:inline">
          基于 CommonMark 规范，支持多种扩展语法
        </span>
        <Button variant="outline" @click="emit(`close`)">
          关闭
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
