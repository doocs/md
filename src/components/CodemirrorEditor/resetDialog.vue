<template>
    <el-dialog
        title="提示"
        class="reset__dialog"
        :visible="showResetConfirm"
        @close="$emit('close')"
    >
        <div class="text">
            此操作将丢失本地缓存的文本和自定义样式，是否继续?
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button :type="btnType" plain @click="$emit('close')"
                >取 消</el-button
            >
            <el-button :type="btnType" @click="$emit('confirm')" plain
                >确 定</el-button
            >
        </div>
    </el-dialog>
</template>

<script>
import { mapState } from "vuex";
export default {
    props: {
        showResetConfirm: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        btnType() {
            return this.nightMode ? "default" : "primary";
        },
        ...mapState({
            nightMode: (state) => state.nightMode,
        }),
    },
};
</script>

<style lang="less" scoped>
/deep/ .el-dialog {
    min-width: 440px;
}
.reset__dialog {
    text-align: center;
}

.text {
    text-align: center;
}

.dialog-footer {
    text-align: center;
}
</style>
