<template>
  <transition name="fade" v-if="loading">
    <loading />
  </transition>
  <codemirror-editor v-else />
</template>

<script>
import Loading from '../components/Loading'
import CodemirrorEditor from './CodemirrorEditor'

export default {
  name: `App`,
  components: {
    Loading,
    CodemirrorEditor,
  },
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

<style scoped></style>
