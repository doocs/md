<script setup lang="ts">
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([`close`])

const contributors = [
  {
    name: `yanglbme`,
    imageUrl: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/support1.jpg`,
    altText: `赞赏二维码 1`,
  },
  {
    name: `yangfong`,
    imageUrl: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/support2.jpg`,
    altText: `赞赏二维码 2`,
  },
]

function onUpdate(val: boolean) {
  if (!val) {
    emit(`close`)
  }
}
</script>

<template>
  <Dialog :open="props.visible" @update:open="onUpdate">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>赞赏</DialogTitle>
      </DialogHeader>
      <div class="text-center">
        <p>若觉得项目不错，可以通过以下方式支持我们～</p>
        <div class="grid grid-cols-2 my-5 gap-4">
          <div v-for="contributor in contributors" :key="contributor.name" class="text-center">
            <img
              :src="contributor.imageUrl"
              :alt="contributor.altText"
              class="mx-auto"
              style="width: 90%; max-width: 200px;border-radius: 10%;"
            >
          </div>
        </div>
      </div>

      <DialogFooter class="sm:justify-evenly">
        <Button @click="emit('close')">
          关闭
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
