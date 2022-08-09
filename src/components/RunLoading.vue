<template>
  <transition name="fade" v-if="loading">
    <div
      class="loading"
      :class="{
        loading_night: nightMode,
      }"
    >
      <strong>致力于让 Markdown 编辑更简单</strong>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex'

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
  computed: {
    ...mapState({
      nightMode: ({ nightMode }) => nightMode,
    }),
  },
}
</script>

<style lang="less" scoped>
@light-color: #303133;
@light-background-color: #f2f2f2;
@night-color: #bbbbbb;
@night-background-color: #303133;

.loading {
  position: fixed;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  font-size: 18px;
  color: @light-color;
  background-color: @light-background-color;

  &::before {
    content: url('../assets/images/favicon.png');
    width: 100px;
    height: 100px;
    margin-bottom: 26px;
  }
}

.loading_night {
  color: @night-color;
  background-color: @night-background-color;
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
