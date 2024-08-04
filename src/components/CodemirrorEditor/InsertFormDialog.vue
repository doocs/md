<script>
import { mapActions, mapState } from 'pinia'
import { useStore } from '@/stores'

import config from '@/assets/scripts/config'
import { createTable } from '@/assets/scripts/util'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: [`close`, `formatContent`],
  data() {
    return {
      config,
      rowNum: 3,
      colNum: 3,
      tableData: {},
    }
  },
  computed: {
    ...mapState(useStore, {
      editor: state => state.editor,
    }),
  },
  methods: {
    // 插入表格
    insertTable() {
      // const cursor = this.editor.getCursor()
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
      this.$emit(`formatContent`)
    },
    ...mapActions(useStore, [`editorRefresh`]),
  },
}
</script>

<template>
  <el-dialog
    title="插入表格"
    class="insert__dialog"
    :model-value="visible"
    border
    @close="$emit('close')"
  >
    <el-row class="tb-options" type="flex" align="middle" :gutter="10">
      <el-col :span="12">
        行数：
        <el-input-number
          v-model="rowNum"
          controls-position="right"
          :min="1"
          :max="100"
          size="small"
        />
      </el-col>
      <el-col :span="12">
        列数：
        <el-input-number
          v-model="colNum"
          controls-position="right"
          :min="1"
          :max="100"
          size="small"
        />
      </el-col>
    </el-row>
    <table style="border-collapse: collapse" class="input-table">
      <tr
        v-for="row in rowNum + 1"
        :key="row"
        :class="{ 'head-style': row === 1 }"
      >
        <td v-for="col in colNum" :key="col">
          <el-input
            v-model="tableData[`k_${row - 1}_${col - 1}`]"
            align="center"
            :placeholder="row === 1 ? '表头' : ''"
          />
        </td>
      </tr>
    </table>
    <template #footer>
      <div class="dialog-footer">
        <el-button plain @click="$emit('close')">
          取 消
        </el-button>
        <el-button type="primary" plain @click="insertTable">
          确 定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
:deep(.el-dialog) {
  width: 55%;
  min-height: 375px;
  min-width: 440px;
}

.tb-options {
  margin-bottom: 20px;
}

.input-table :deep(.el-input__inner) {
  border-radius: 0;
}
</style>
