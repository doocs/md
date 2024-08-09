<script setup>
import { onMounted, ref } from 'vue'
import { useStore } from '@/stores'

const loading = ref(true)

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 100)
})
</script>

<template>
  <transition name="fade">
    <div
      v-if="loading"
      class="loading"
    >
      <el-text size="large" tag="strong">
        致力于让 Markdown 编辑更简单
      </el-text>
    </div>
  </transition>
</template>

<style lang="less" scoped>
.loading {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  font-size: 18px;
  background-color: var(--el-bg-color-page);

  &::before {
    content: url('../assets/images/favicon.png');
    width: 100px;
    height: 100px;
    margin-bottom: 26px;
  }
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}
</style>
