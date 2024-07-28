<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

defineEmits([`close`])

function onRedirect(url) {
  window.open(url)
}
</script>

<template>
  <el-dialog
    title="关于"
    class="about__dialog"
    :model-value="props.visible"
    width="30%"
    center
    @close="$emit('close')"
  >
    <div style="text-align: center">
      <h3>一款高度简洁的微信 Markdown 编辑器</h3>
      <p>扫码关注公众号 Doocs，原创技术文章第一时间推送！</p>
      <img
        src="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/1648303220922-7e14aefa-816e-44c1-8604-ade709ca1c69.png"
        style="width: 40%"
      >
    </div>
    <template #footer>
      <el-button
        type="primary"
        plain
        @click="onRedirect('https://github.com/doocs/md')"
      >
        GitHub 仓库
      </el-button>
      <el-button
        type="primary"
        plain
        @click="onRedirect('https://gitee.com/doocs/md')"
      >
        Gitee 仓库
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
:deep(.el-dialog) {
  min-width: 420px;
}
</style>
