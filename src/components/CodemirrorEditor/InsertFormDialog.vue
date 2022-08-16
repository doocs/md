<template>
  <el-dialog
    title="插入表格"
    class="insert__dialog"
    :visible="visible"
    @close="$emit('close')"
    border
  >
    <el-row class="tb-options" type="flex" align="middle" :gutter="10">
      <el-col>
        行数：
        <el-input-number
          v-model="rowNum"
          controls-position="right"
          :min="1"
          :max="100"
          size="small"
        ></el-input-number>
      </el-col>
      <el-col>
        列数：
        <el-input-number
          v-model="colNum"
          controls-position="right"
          :min="1"
          :max="100"
          size="small"
        ></el-input-number>
      </el-col>
    </el-row>
    <table style="border-collapse: collapse" class="input-table">
      <tr
        :class="{ 'head-style': row === 1 }"
        v-for="row in rowNum + 1"
        :key="row"
      >
        <td v-for="col in colNum" :key="col">
          <el-input
            align="center"
            v-model="tableData[`k_${row - 1}_${col - 1}`]"
            :placeholder="row === 1 ? '表头' : ''"
          />
        </td>
      </tr>
    </table>
    <div slot="footer" class="dialog-footer">
      <el-button :type="btnType" @click="$emit('close')" plain>
        取 消
      </el-button>
      <el-button :type="btnType" @click="insertTable" plain> 确 定 </el-button>
    </div>
  </el-dialog>
</template>

<script>
import config from '@/assets/scripts/config'
import { createTable } from '@/assets/scripts/util'
import { mapState, mapMutations } from 'vuex'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      config: config,
      rowNum: 3,
      colNum: 3,
      tableData: {},
    }
  },
  computed: {
    btnType() {
      return this.nightMode ? `default` : `primary`
    },
    ...mapState({
      nightMode: (state) => state.nightMode,
      editor: (state) => state.editor,
    }),
  },
  methods: {
    // 插入表格
    insertTable() {
      const cursor = this.editor.getCursor()
      const table = createTable({
        data: this.tableData,
        rows: this.rowNum,
        cols: this.colNum,
      })

      this.tableData = {}
      this.rowNum = 3
      this.colNum = 3
      this.editor.replaceSelection(`\n${table}\n`, `end`)
      this.$emit(`close`)
      this.editorRefresh()
    },
    ...mapMutations([`editorRefresh`]),
  },
}
</script>

<style lang="less" scoped>
/deep/ .el-dialog {
  width: 55%;
  min-height: 375px;
  min-width: 440px;
}

.tb-options {
  margin-bottom: 20px;
}

.input-table ::v-deep .el-input__inner {
  border-radius: 0;
}

.head-style /deep/ .el-input__inner {
  background-color: #f2f2f2;
}
</style>
