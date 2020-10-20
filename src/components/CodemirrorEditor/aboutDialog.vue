<template>
    <el-dialog
        title="关于"
        class="about__dialog"
        :visible="value"
        @close="$emit('input', false)"
        width="30%"
        center
    >
        <div style="text-align: center">
            <h3>一款高度简洁的微信 Markdown 编辑器</h3>
        </div>
        <div style="text-align: center; margin-top: 10px">
            <p>扫码关注我的公众号，原创技术文章第一时间推送！</p>
            <img
                src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/qrcode.png"
                style="width: 40%; display: block; margin: 20px auto 10px"
            />
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button
                type="primary"
                @click="onRedirect('https://github.com/doocs/md')"
                plain
                >GitHub 仓库</el-button
            >
            <el-button
                type="primary"
                @click="onRedirect('https://gitee.com/doocs/md')"
                plain
                >Gitee 仓库</el-button
            >
        </span>
    </el-dialog>
</template>

<script>
export default {
    props: {
        value: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        onRedirect(url) {
            window.open(url);
        },
    },
};
</script>

<style lang="less" scoped></style>
