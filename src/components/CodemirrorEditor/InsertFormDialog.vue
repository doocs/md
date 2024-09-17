<script setup lang="ts">
import { ref, toRaw } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useStore } from '@/stores'
import { createTable } from '@/utils'

const store = useStore()

const { toggleShowInsertFormDialog } = store

const rowNum = ref(3)
const colNum = ref(3)
const tableData = ref<Record<string, string>>({})

function resetVal() {
  rowNum.value = 3
  colNum.value = 3
  tableData.value = {}
}

// 插入表格
function insertTable() {
  const table = createTable({
    rows: rowNum.value,
    cols: colNum.value,
    data: tableData.value,
  })
  toRaw(store.editor!).replaceSelection(`\n${table}\n`, `end`)
  resetVal()
  toggleShowInsertFormDialog()
}

function onUpdate(val: boolean) {
  if (!val) {
    toggleShowInsertFormDialog(false)
  }
}
</script>

<template>
  <Dialog :open="store.isShowInsertFormDialog" @update:open="onUpdate">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>插入表格</DialogTitle>
      </DialogHeader>
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
        <tr v-for="row in rowNum + 1" :key="row" :class="{ 'head-style': row === 1 }">
          <td v-for="col in colNum" :key="col">
            <el-input
              v-model="tableData[`k_${row - 1}_${col - 1}`]"
              align="center"
              :placeholder="row === 1 ? '表头' : ''"
            />
          </td>
        </tr>
      </table>

      <DialogFooter>
        <Button variant="outline" @click="toggleShowInsertFormDialog(false)">
          取 消
        </Button>
        <Button @click="insertTable">
          确 定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style lang="less" scoped>
.tb-options {
  margin-bottom: 20px;
}

.input-table :deep(.el-input__inner) {
  border-radius: 0;
}
</style>
