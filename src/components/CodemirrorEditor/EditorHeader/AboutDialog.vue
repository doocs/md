<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([`close`])

const links = [
  { label: `GitHub 仓库`, url: `https://github.com/doocs/md` },
  { label: `Gitee 仓库`, url: `https://gitee.com/doocs/md` },
  { label: `GitCode 仓库`, url: `https://gitcode.com/doocs/md` },
]

function onRedirect(url) {
  window.open(url, `_blank`)
}
</script>

<template>
  <el-dialog
    title="关于"
    class="about__dialog"
    :model-value="props.visible"
    width="520"
    center
    @close="emit('close')"
  >
    <div class="text-center">
      <h3>一款高度简洁的微信 Markdown 编辑器</h3>
      <p>扫码关注公众号 Doocs，原创技术文章第一时间推送！</p>
      <img
        class="mx-auto my-5"
        src="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/1648303220922-7e14aefa-816e-44c1-8604-ade709ca1c69.png"
        alt="Doocs Markdown 编辑器"
        style="width: 40%"
      >
    </div>
    <template #footer>
      <el-button
        v-for="link in links"
        :key="link.url"
        type="primary"
        plain
        @click="onRedirect(link.url)"
      >
        {{ link.label }}
      </el-button>
    </template>
  </el-dialog>
</template>
