<template>
  <transition name="fade" v-if="loading">
    <loading />
  </transition>
  <codemirror-editor v-else />
</template>

<script>
import Loading from "../../components/Loading";
import CodemirrorEditor from "./view/CodemirrorEditor";
export default {
  name: "App",
  components: {
    Loading,
    CodemirrorEditor,
  },
  data() {
    return {
      loading: true,
    };
  },
  mounted() {
    setTimeout(() => {
      this.loading = false;
    }, 100);
  },
};
</script>

<style scoped>
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
  transition: all 1s;
}
</style>
