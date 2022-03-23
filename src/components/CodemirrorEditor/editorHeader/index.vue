<template>
  <el-container class="top is-dark">
    <left-side
      @show-dialog-upload-img="showDialogUploadImg"
      @download="download"
      @export="exportEditorContent"
      @refresh="refresh"
      @show-dialog-form="showDialogForm"
    ></left-side>
    <right-side
      @refresh="refresh"
      @showCssEditor="showCssEditor"
      @show-about-dialog="showAboutDialog"
      @endCopy="endCopy"
    ></right-side>
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
    showDialogUploadImg() {
      this.$emit(`show-dialog-upload-img`)
    },
    download() {
      this.$emit(`download`)
    },
    exportEditorContent() {
      this.$emit(`export`)
    },
    refresh() {
      this.$emit(`refresh`)
    },
    showDialogForm() {
      this.$emit(`show-dialog-form`)
    },
    showCssEditor() {
      this.$emit(`showCssEditor`)
    },
    endCopy() {
      this.$emit(`endCopy`)
    },
    showAboutDialog() {
      this.$emit(`show-about-dialog`)
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
