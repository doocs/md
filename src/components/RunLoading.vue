<template>
  <transition name="fade" v-if="loading">
    <div class="loading">
      <div class="loading-wrapper">
        <div class="loading-anim"></div>
        <div class="loading-text">致力于让 Markdown 编辑更简单</div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: `RunLoading`,
  data() {
    return {
      loading: true,
    }
  },
  mounted() {
    setTimeout(() => {
      this.loading = false
    }, 100)
  },
}
</script>

<style lang="less" scoped>
.loading {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 99999;
  background-color: #f2f2f2;
}

.loading_night {
  background-color: #303133;
}

.loading-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  text-align: center;
}

.loading-anim {
  display: inline-block;
  width: 100px;
  height: 100px;
  background: url('../assets/images/favicon.png') no-repeat;
  background-size: cover;
}

.loading-text {
  font-size: 18px;
  font-weight: bold;
  margin-top: 26px;
  color: #303133;
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
