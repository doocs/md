<script setup lang="ts">
const loading = ref(true)

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>

<template>
  <!-- <transition name="fade">
    <div
      v-if="loading"
      class="loading"
    >
      <div class="loading-content">
        <div class="logo-wrapper">
          <div class="logo-animation">
            <img
              src="@/assets/images/favicon.png"
              alt="loading icon"
              class="loading-icon"
            />
          </div>
        </div>
        <strong class="loading-text">适配 MultiPost 文章同步助手</strong>
      </div>
    </div>
  </transition> -->
  <div />
</template>

<style lang="less" scoped>
.loading {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999;
  width: 100vw;
  height: 100vh;
  background-color: hsl(var(--background));
  display: grid;
  place-items: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.logo-wrapper {
  width: 120px;
  height: 120px;
  display: grid;
  place-items: center;
}

.logo-animation {
  animation: pulse 2s infinite;
}

.loading-icon {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.loading-text {
  font-size: 18px;
  font-weight: 500;
  color: hsl(var(--foreground));
  opacity: 0.9;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
