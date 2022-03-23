<template>
  <el-container class="top is-dark">
    <left-side @refresh="refresh"></left-side>
    <right-side></right-side>
  </el-container>
</template>

<script>
import LeftSide from '@/components/CodemirrorEditor/editorHeader/leftSide'
import RightSide from '@/components/CodemirrorEditor/editorHeader/rightSide'

export default {
  name: `editor-header`,
  components: {
    LeftSide,
    RightSide,
  },
  methods: {
    refresh() {
      this.$emit(`refresh`)
    },
  },
}
</script>

<style lang="less" scoped>
.top {
  height: 60px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  margin-right: 0;
}
</style>
