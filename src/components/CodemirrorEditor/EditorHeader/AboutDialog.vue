<script setup lang="ts">
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([`close`])

function onUpdate(val: boolean) {
  if (!val) {
    emit(`close`)
  }
}

const links = [
  { label: `GitHub 仓库`, url: `https://github.com/leaper-one/multipost-wechat-markdown-editor` },
  { label: `原项目`, url: `https://github.com/doocs/md` },
]

function onRedirect(url: string) {
  window.open(url, `_blank`)
}
</script>

<template>
  <Dialog :open="props.visible" @update:open="onUpdate">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>关于</DialogTitle>
      </DialogHeader>
      <div class="text-center">
        <h3>MultiPost - Markdown 编辑器</h3>
        <p>适配 MultiPost 文章同步助手</p>
        <p class="mt-2 text-sm text-gray-500">
          本项目基于 <a href="https://github.com/doocs/md" target="_blank" class="text-blue-500 hover:underline">doocs/md</a> 进行改造，特此感谢！
        </p>
        <img
          class="mx-auto my-5"
          src="@/assets/images/favicon.png"
          alt="MultiPost Markdown 编辑器"
          style="width: 40%"
        >
      </div>
      <DialogFooter class="sm:justify-evenly">
        <Button
          v-for="link in links"
          :key="link.url"
          @click="onRedirect(link.url)"
        >
          {{ link.label }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
