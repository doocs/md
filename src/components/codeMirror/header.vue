<template>
    <div>
        <!-- 图片上传 -->
        <el-upload action="https://imgkr.com/api/files/upload" :headers="{'Content-Type': 'multipart/form-data'}"
            :show-file-list="false" :multiple="true" accept=".jpg,.jpeg,.png,.gif" name="file"
            :before-upload="beforeUpload" :on-success="uploaded">
            <el-tooltip class="item" effect="dark" content="上传图片" placement="bottom-start">
            <i class="el-icon-upload" size="medium">&nbsp;</i>
            </el-tooltip>
        </el-upload>
        <!-- 下载文本文档 -->
        <el-tooltip class="item" effect="dark" content="下载编辑框Markdown文档" placement="bottom-start">
            <i class="el-icon-download" size="medium" @click="downloadEditorContent">&nbsp;</i>
        </el-tooltip>
        <!-- 页面重置 -->
        <el-tooltip class="item" effect="dark" content="重置页面" placement="bottom-start">
            <i class="el-icon-refresh" size="medium" @click="reset">&nbsp;</i>
        </el-tooltip>
        <!-- 插入表格 -->
        <el-tooltip class="item" effect="dark" content="插入表格" placement="bottom-start">
            <i class="el-icon-s-grid" size="medium" @click="dialogFormVisible = true">&nbsp;</i>
        </el-tooltip>
        <el-form size="mini" class="ctrl" :inline=true>
            <el-form-item>
            <el-select v-model="currentFont" size="mini" placeholder="选择字体" clearable @change="fontChanged">
                <el-option v-for="font in builtinFonts" :style="{fontFamily: font.value}" :key="font.value"
                :label="font.label" :value="font.value">
                <span class="select-item-left">{{ font.label }}</span>
                <span class="select-item-right">Abc</span>
                </el-option>
            </el-select>
            </el-form-item>
            <el-form-item>
            <el-select v-model="currentSize" size="mini" placeholder="选择段落字号" clearable @change="sizeChanged">
                <el-option v-for="size in sizeOption" :key="size.value" :label="size.label" :value="size.value">
                <span class="select-item-left">{{ size.label }}</span>
                <span class="select-item-right">{{ size.desc }}</span>
                </el-option>
            </el-select>
            </el-form-item>
            <el-form-item>
            <el-select v-model="currentColor" size="mini" placeholder="选择颜色" clearable @change="colorChanged">
                <el-option v-for="color in colorOption" :key="color.value" :label="color.label" :value="color.value">
                <span class="select-item-left">{{ color.label }}</span>
                <span class="select-item-right">{{ color.hex }}</span>
                </el-option>
            </el-select>
            </el-form-item>
            <el-tooltip content="自定义颜色" placement="top">
            <el-color-picker v-model="currentColor" size="mini" show-alpha @change="colorChanged"></el-color-picker>
            </el-tooltip>
            &nbsp;&nbsp;
            <el-tooltip content="微信外链自动转为文末引用" placement="top">
            <el-switch v-model="status" active-color="#67c23a" inactive-color="#dcdfe6" @change="statusChanged">
            </el-switch>
            </el-tooltip>
        </el-form>
        <el-tooltip class="item" effect="dark" content="自定义CSS样式" placement="left">
            <el-button type="success" plain size="medium" icon="el-icon-setting" @click="customStyle"></el-button>
        </el-tooltip>
        <el-button type="success" plain size="medium" @click="copy">复制</el-button>
        <el-button type="success" plain size="medium" class="about" @click="aboutDialogVisible = true">关于</el-button>
    </div>
</template>

<script>
export default {
    name: 'header',
    methods: {
        
    },
}
</script>

<style lang="less" scoped>

</style>