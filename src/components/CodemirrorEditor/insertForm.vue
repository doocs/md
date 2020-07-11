<template>
    <el-dialog title="插入表格" class="insert__dialog" :visible="dialogFormVisible" @close="$emit('close')">
        <el-form class="insert__form" :model="config.form">
            <el-form-item label="行数(表头不计入行数)">
            <el-input v-model="config.form.rows"></el-input>
            </el-form-item>
            <el-form-item label="列数">
            <el-input v-model="config.form.cols"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button :type="btnType" plain @click="$emit('close')">取 消</el-button>
            <el-button :type="btnType" @click="insertTable" plain>确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
import config from '../../assets/scripts/config'
import {mapState, mapMutations} from 'vuex';
export default {
    props: {
        dialogFormVisible: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            config: config
        }
    },
    computed: {
        btnType() {
            return !this.nightMode ? 'success' : 'default';
        },
        ...mapState({
            nightMode: state=> state.nightMode,
            editor: state=> state.editor
        })
    },
    methods: {
        // 插入表格
        insertTable() {
            const cursor = this.editor.getCursor()
            const rows = parseInt(this.config.form.rows)
            const cols = parseInt(this.config.form.cols)
            if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
                this.$message({
                    showClose: true,
                    message: '输入的行/列数无效，请重新输入',
                    type: 'error'
                })
                return
            }

            let table = ''
            for (let i = 0; i < rows + 2; ++i) {
                for (let j = 0; j < cols + 1; ++j) {
                    table += (j === 0 ? '|' : (i !== 1 ? '     |' : ' --- |'))
                }
                table += '\n'
            }

            this.editor.replaceSelection(`\n${table}\n`, cursor)
            this.$emit('close')
            this.editorRefresh()
        },
        ...mapMutations(['editorRefresh'])
    }
}
</script>

<style lang="less" scoped>
</style>