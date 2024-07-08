<script>
export default {
  name: `CssEditor`,
  props: {
    showCssEditor: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<template>
  <transition enter-active-class="bounceInRight">
    <el-col v-show="showCssEditor" :span="8" class="cssEditor-wrapper">
      <textarea
        id="cssEditor"
        type="textarea"
        placeholder="Your custom css here."
      />
    </el-col>
  </transition>
</template>

<style lang="less" scoped>
.bounceInRight {
  animation-name: bounceInRight;
  animation-duration: 1s;
  animation-fill-mode: both;
}

@keyframes bounceInRight {
  0%,
  60%,
  75%,
  90%,
  100% {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  0% {
    opacity: 0;
    transform: translate3d(3000px, 0, 0);
  }

  60% {
    opacity: 1;
    transform: translate3d(-25px, 0, 0);
  }

  75% {
    transform: translate3d(10px, 0, 0);
  }

  90% {
    transform: translate3d(-5px, 0, 0);
  }

  100% {
    transform: none;
  }
}
</style>
