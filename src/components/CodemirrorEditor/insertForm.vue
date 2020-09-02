<template>
  <el-dialog
    title="插入表格"
    class="insert__dialog"
    :visible="value"
    @close="$emit('input', false)"
    border
  >
    <el-row class="tb-options" type="flex" align="middle" :gutter="10">
      <el-col :span="6">
        行数
        <el-input-number
          v-model="rowNum"
          controls-position="right"
          @change="handleChange($event,'row')"
          :min="1"
          :max="100"
          size="small"
        ></el-input-number>
      </el-col>
      <el-col :span="6">
        列数
        <el-input-number
          v-model="colNum"
          controls-position="right"
          @change="handleChange($event,'col')"
          :min="1"
          :max="100"
          size="small"
        ></el-input-number>
      </el-col>
    </el-row>
    <!--  -->
    <table style="border-collapse: collapse" class="input-table">
      <tr :class="{ 'head-style': row===1 }" v-for="row in rowNum+1" :key="row">
        <td v-for="col in colNum" :key="col">
          <el-input
            align="center"
            v-model="tableData[`k_${row-1}_${col-1}`]"
            :placeholder="row===1?'表头':''"
          />
        </td>
      </tr>
    </table>
    <!--  -->
    <div slot="footer" class="dialog-footer">
      <el-button :type="btnType" plain @click="$emit('input', false)">取 消</el-button>
      <el-button :type="btnType" @click="insertTable" plain>确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
    import config from "../../assets/scripts/config";
    import {
        mapState,
        mapMutations
    } from "vuex";
    export default {
        props: {
            value: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                config: config,
                rowNum: 1,
                colNum: 1,
                tableData: {}
            };
        },
        computed: {
            btnType() {
                return this.nightMode ? "default" : "primary";
            },
            ...mapState({
                nightMode: state => state.nightMode,
                editor: state => state.editor
            })
        },
        methods: {
            // 插入表格
            insertTable() {
                const cursor = this.editor.getCursor();
                const rows = this.rowNum;
                const cols = this.colNum;

                let table = "";
                let currRow = [];
                for (let i = 0; i < rows + 2; ++i) {
                    table += "|\t";
                    currRow = [];
                    for (let j = 0; j < cols; ++j) {
                        const rowIdx = i > 1 ? i - 1 : i;
                        i === 1 ?
                        currRow.push("---\t") :
                        currRow.push(this.tableData[`k_${rowIdx}_${j}`] || "");
                    }
                    table += currRow.join("\t|\t");
                    table += "\t|\n";
                }
                this.tableData = {};
                this.rowNum = 1;
                this.colNum = 1;
                this.editor.replaceSelection(`\n${table}\n`, "end");
                this.$emit('input', false);
                this.editorRefresh();
            },
            ...mapMutations(["editorRefresh"]),
            handleChange(val, type) {}
        }
    };

</script>

<style lang="less">
.tb-options {
    margin-bottom: 20px;
}

.input-table {
    /deep/ .el-input__inner {
        border-radius: 0;
    }
}

.head-style .el-input__inner {
    background-color: #f2f2f2;
}
</style>
