<template>
    <el-container class="top is-dark">
        <!-- 图片上传 -->
        <el-upload class="header__item" action="https://imgkr.com/api/files/upload"
            :headers="{'Content-Type': 'multipart/form-data'}"
            :show-file-list="false" :multiple="true" accept=".jpg,.jpeg,.png,.gif" name="file"
            :before-upload="beforeUpload">
            <el-tooltip :effect="effect" content="上传图片" placement="bottom-start">
            <i class="el-icon-upload" size="medium"></i>
            </el-tooltip>
        </el-upload>
        <!-- 下载文本文档 -->
        <el-tooltip class="header__item" :effect="effect" content="下载编辑框Markdown文档" placement="bottom-start">
            <i class="el-icon-download" size="medium" @click="downloadEditorContent"></i>
        </el-tooltip>
        <!-- 页面重置 -->
        <el-tooltip class="header__item" :effect="effect" content="重置页面" placement="bottom-start">
            <i class="el-icon-refresh" size="medium" @click="reset"></i>
        </el-tooltip>
        <!-- 插入表格 -->
        <el-tooltip class="header__item header__item_last" :effect="effect" content="插入表格" placement="bottom-start">
            <i class="el-icon-s-grid" size="medium" @click="$emit('showDialogForm')"></i>
        </el-tooltip>
        <el-form size="mini" class="ctrl" :inline=true>
            <el-form-item>
            <el-select v-model="selectFont" size="mini" placeholder="选择字体" clearable @change="fontChanged">
                <el-option v-for="font in config.builtinFonts" :style="{fontFamily: font.value}" :key="font.value"
                :label="font.label" :value="font.value">
                    <span class="select-item-left">{{ font.label }}</span>
                    <span class="select-item-right">Abc</span>
                </el-option>
            </el-select>
            </el-form-item>
            <el-form-item>
            <el-select v-model="selectSize" size="mini" placeholder="选择段落字号" clearable @change="sizeChanged">
                <el-option v-for="size in config.sizeOption" :key="size.value" :label="size.label" :value="size.value">
                    <span class="select-item-left">{{ size.label }}</span>
                    <span class="select-item-right">{{ size.desc }}</span>
                </el-option>
            </el-select>
            </el-form-item>
            <el-form-item>
            <el-select v-model="selectColor" size="mini" placeholder="选择颜色" clearable @change="colorChanged">
                <el-option v-for="color in config.colorOption" :key="color.value" :label="color.label" :value="color.value">
                    <span class="select-item-left">{{ color.label }}</span>
                    <span class="select-item-right">{{ color.hex }}</span>
                </el-option>
            </el-select>
            </el-form-item>
            <el-tooltip content="自定义颜色" :effect="effect" placement="top">
            <el-color-picker v-model="selectColor" size="mini" show-alpha @change="colorChanged"></el-color-picker>
            </el-tooltip>
            <el-tooltip content="微信外链自动转为文末引用" :effect="effect" placement="top">
                <el-switch class="header__switch" v-model="citeStatus" active-color="#67c23a" inactive-color="#dcdfe6" @change="statusChanged">
                </el-switch>
            </el-tooltip>
        </el-form>
        <el-tooltip class="item" :effect="effect" content="自定义CSS样式" placement="left">
            <el-button :type="btnType" plain size="medium" icon="el-icon-setting" @click="customStyle"></el-button>
        </el-tooltip>
        <el-button :type="btnType" plain size="medium" @click="copy">复制</el-button>
        <el-button :type="btnType" plain size="medium" class="about" @click="$emit('showAboutDialog')">关于</el-button>
        <el-tooltip content="夜间模式" placement="bottom-start">
            <div class="mode__switch" v-if="!nightMode" @click="themeChanged"></div>
            <div class="mode__switch mode__switch_black" v-else @click="themeChanged"></div>
        </el-tooltip>
        <resetDialog :showResetConfirm="showResetConfirm" @confirm="confirmReset" @close="cancelReset"/>
      </el-container>
</template>

<script>

import {
    setColorWithCustomTemplate,
    setFontSize,
    isImageIllegal
} from '../../scripts/util'
import fileApi from '../../api/file';
import {
    solveWeChatImage,
    solveHtml
} from '../../scripts/converter'
import config from '../../scripts/config'
import DEFAULT_CSS_CONTENT from '../../scripts/themes/default-theme-css'
import resetDialog from '../codeMirror/resetDialog'
import {mapState, mapMutations} from 'vuex'
export default {
    name: 'editor-header',
    data() {
        return {
            config: config,
            citeStatus: false,
            showResetConfirm: false,
            selectFont: '',
            selectSize: '',
            selectColor: ''
        };
    },
    components: {
        resetDialog
    },
    computed: {
        effect() {
            return this.nightMode ? 'dark' : 'light'
        },
        btnType() {
            return !this.nightMode ? 'success' : 'default';
        },
        ...mapState({
            output: state=> state.output,
            editor: state=> state.editor,
            cssEditor: state=> state.cssEditor,
            currentFont: state=> state.currentFont,
            currentSize: state=> state.currentSize,
            currentColor: state=> state.currentColor,
            nightMode: state=> state.nightMode
        })
    },
    methods: {
        fontChanged(fonts) {
            this.setWxRendererOptions({
                fonts: fonts
            })
            this.setCurrentFont(fonts);
            this.$emit('refresh')
        },
        sizeChanged(size) {
            let theme = setFontSize(size.replace('px', ''))
            theme = setColorWithCustomTemplate(theme, this.currentColor)
            this.setWxRendererOptions({
                size: size,
                theme: theme
            })
            this.setCurrentSize(size);
            this.$emit('refresh')
        },
        colorChanged(color) {
            let theme = setFontSize(this.currentSize.replace('px', ''))
            theme = setColorWithCustomTemplate(theme, color)
            this.setWxRendererOptions({
                theme: theme
            })
            this.setCurrentColor(color);
            this.$emit('refresh')
        },
        statusChanged(val) {
            this.setCiteStatus(val)
            this.$emit('refresh')
        },
        // 图片上传前的处理
        beforeUpload(file) {
            const checkImageResult = isImageIllegal(file);

            if (checkImageResult) {
                this.$message({
                    showClose: true,
                    message: checkImageResult,
                    type: 'error'
                });
                return false;
            }
            let fd = new FormData();

            fd.append('file', file);
            fileApi.fileUpload(fd).then(res => {
                this.$emit('uploaded', res)
            }).catch(err => {
                console.log(err.message)
            })
            return false;
        },
        // 复制到微信公众号
        copy() {
            this.$emit('startCopy');
            setTimeout(() => {
                let clipboardDiv = document.getElementById('output')
                solveWeChatImage()
                this.setHtml(solveHtml(this.nightMode))

                clipboardDiv.focus()
                window.getSelection().removeAllRanges()
                let range = document.createRange()

                range.setStartBefore(clipboardDiv.firstChild)
                range.setEndAfter(clipboardDiv.lastChild)
                window.getSelection().addRange(range)
                document.execCommand('copy')
                // 输出提示
                this.$notify({
                    showClose: true,
                    message: '已复制渲染后的文章到剪贴板，可直接到公众号后台粘贴',
                    offset: 80,
                    duration: 1600,
                    type: 'success'
                })
                clipboardDiv.innerHTML = this.output; // 恢复现场
                this.$emit('refresh')
                this.$emit('endCopy');
            }, 1000);
        },
        // 自定义CSS样式
        async customStyle () {
            this.$emit('showBox');
            this.$nextTick(() => {
                if(!this.cssEditor) {
                    this.cssEditor.refresh()
                }
            })
            setTimeout(() => {
                this.cssEditor.refresh()
            },50)
            let flag = await localStorage.getItem('__css_content')

            if (!flag) {
                this.setCssEditorValue(DEFAULT_CSS_CONTENT)
            }
        },
        // 重置页面
        reset() {
            this.showResetConfirm = true;
        },
        confirmReset() {
            localStorage.clear()
            this.clearEditorToDefault();
            this.editor.focus()
            this.citeStatus = false;
            this.statusChanged(false);
            this.fontChanged(this.config.builtinFonts[0].value)
            this.colorChanged(this.config.colorOption[1].value)
            this.sizeChanged(this.config.sizeOption[2].value)
            this.$emit('cssChanged')
        },
        cancelReset() {
            this.showResetConfirm = false;
            this.editor.focus()
        },
        // 下载编辑器内容到本地
        downloadEditorContent () {
            let downLink = document.createElement('a')
            downLink.download = 'content.md'
            downLink.style.display = 'none'
            let blob = new Blob([this.editor.getValue(0)])
            downLink.href = URL.createObjectURL(blob)
            document.body.appendChild(downLink)
            downLink.click()
            document.body.removeChild(downLink)
        },
        ...mapMutations(['clearEditorToDefault','setCurrentColor', 'setCiteStatus', 'themeChanged',
            'setHtml', 'setCurrentFont', 'setCurrentSize', 'setCssEditorValue', 'setWxRendererOptions'])
    },
    mounted() {
        this.selectFont = this.currentFont
        this.selectSize = this.currentSize
        this.selectColor = this.currentColor
    }
}
</script>

<style lang="less" scoped>
.editor__header {
    width: 100%;
}
.header__item {
    margin: 0 3px;
}
.header__item_last {
    margin-right: 8px;
}
.header__switch {
    margin-left: 8px;
}
.mode__switch {
    margin-left: 24px;
    width: 24px;
    height: 24px;
    background: url('../../assets/images/night.png') no-repeat;
    background-size: cover;
    transition: all .3s;
}
.mode__switch_black {
    background: url('../../assets/images/light.png') no-repeat;
    background-size: cover;
}
.top {
    margin-right: 0;
}
</style>