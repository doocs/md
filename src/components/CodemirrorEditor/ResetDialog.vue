<template>
  <el-dialog
    title="提示"
    class="reset__dialog"
    :visible="showResetConfirm"
    @close="$emit('close')"
    center
  >
    <div style="text-align: center">此操作将丢失本地自定义样式，是否继续?</div>
    <template slot="footer">
      <el-button :type="btnType" @click="$emit('close')" plain>
        取 消
      </el-button>
      <el-button :type="btnType" @click="$emit('confirm')" plain>
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    showResetConfirm: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    btnType() {
      return this.nightMode ? `default` : `primary`
    },
    ...mapState({
      nightMode: (state) => state.nightMode,
    }),
  },
}
</script>

<style lang="less" scoped>
/deep/ .el-dialog {
  min-width: 440px;
}
</style>
