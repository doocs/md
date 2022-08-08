<template>
  <div>
    <loading />
    <codemirror-editor />
  </div>
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
}
</script>

<style scoped></style>
