<template>
    <div class="container" :class="{'container_night': nightMode}">
        <el-container>
            <el-header class="editor__header">
                <editor-header
                    @refresh="onEditorRefresh"
                    @uploaded="uploaded"
                    @cssChanged="cssChanged"
                    @showBox="showBox = !showBox"
                    @showAboutDialog="aboutDialogVisible = true"
                    @showDialogForm="dialogFormVisible = true"
                    @startCopy="isCoping = true, backLight = true"
                    @endCopy="endCopy"
                />
            </el-header>
            <el-main class="main-body">
                <el-row class="main-section">
                    <el-col :span="12">
                        <textarea id="editor" type="textarea" placeholder="Your markdown text here." v-model="source">
                        </textarea>
                    </el-col>
                    <el-col :span="12" class="preview-wrapper" id="preview" :class="{'preview-wrapper_night': nightMode && isCoping}">
                        <section id="output-wrapper" :class="{'output_night': nightMode && !backLight}">
                            <div class="preview">
                                <section id="output" v-html="output">
                                </section>
                                <div class="loading-mask" v-if="nightMode && isCoping">
                                    <div class="loading__img"></div>
                                    <span>正在生成</span>
                                </div>
                            </div>
                        </section>
                    </el-col>
                    <transition name="custom-classes-transition" enter-active-class="bounceInRight">
                        <el-col id="cssBox" :span="12" v-show="showBox">
                            <textarea id="cssEditor" type="textarea" placeholder="Your custom css here.">
                                </textarea>
                        </el-col>
                    </transition>
                </el-row>
            </el-main>
        </el-container>
        <about-dialog :aboutDialogVisible="aboutDialogVisible"
            @close="aboutDialogVisible = false" />
        <insert-form-dialog :dialogFormVisible="dialogFormVisible"
            @close="dialogFormVisible = false" />
    </div>
</template>
<script>
import fileApi from '../api/file';
import editorHeader from '../components/codeMirror/header';
import aboutDialog from '../components/codeMirror/aboutDialog';
import insertFormDialog from '../components/codeMirror/insertForm';
import {
    setFontSize,
    css2json,
    customCssWithTemplate,
    saveEditorContent,
    isImageIllegal
} from '../assets/scripts/util'

require('codemirror/mode/javascript/javascript')
import config from '../assets/scripts/config'
import {mapState, mapMutations} from 'vuex';
export default {
    data() {
        return {
            config: config,
            showBox: false,
            aboutDialogVisible: false,
            dialogFormVisible: false,
            isCoping: false,
            backLight: false,
            timeout: null,
            changeTimer: null,
            source: ''
        }
    },
    components: {
        editorHeader, aboutDialog, insertFormDialog
    },
    computed: {
        ...mapState({
            wxRenderer: state=> state.wxRenderer,
            output: state=> state.output,
            editor: state=> state.editor,
            cssEditor: state=> state.cssEditor,
            currentSize: state=> state.currentSize,
            currentColor: state=> state.currentColor,
            nightMode: state=> state.nightMode
        })
    },
    created() {
        this.initEditorState()
        this.$nextTick(() => {
            this.initEditor()
            this.initCssEditor()
            this.onEditorRefresh()
        })
    },
    methods: {
        initEditor() {
            this.initEditorEntity();
            this.editor.on('change', (cm, e) => {
                if (this.changeTimer) clearTimeout(this.changeTimer);
                this.changeTimer = setTimeout(() => {
                    this.onEditorRefresh()
                    saveEditorContent(this.editor, '__editor_content')
                }, 300);
            });

            // 粘贴上传图片并插入
            this.editor.on('paste', (cm, e) => {
                if (!(e.clipboardData && e.clipboardData.items)) {
                    return
                }
                for (let i = 0, len = e.clipboardData.items.length; i < len; ++i) {
                    let item = e.clipboardData.items[i]
                    if (item.kind === 'file') {
                        const pasteFile = item.getAsFile()
                        const checkImageResult = isImageIllegal(pasteFile);

                        if (checkImageResult) {
                            this.$message({
                                showClose: true,
                                message: checkImageResult,
                                type: 'error'
                            });
                            return;
                        }
                        let data = new FormData()
                        data.append('file', pasteFile)

                        fileApi.fileUpload(data).then(res => {
                            this.uploaded(res)
                        }).catch(err => {
                            console.log(err.message)
                        })
                    }
                }
            });
        },
        initCssEditor() {
            this.initCssEditorEntity();
            // 自动提示
            this.cssEditor.on('keyup', (cm, e) => {
                if ((e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode === 189) {
                    cm.showHint(e)
                }
            });
            this.cssEditor.on('update', (instance) => {
                this.cssChanged()
                saveEditorContent(this.cssEditor, '__css_content')
            })
        },
        cssChanged() {
            let json = css2json(this.cssEditor.getValue(0))
            let theme = setFontSize(this.currentSize.replace('px', ''))

            theme = customCssWithTemplate(json, this.currentColor, theme)
            this.setWxRendererOptions({
                theme: theme
            });
            this.onEditorRefresh()
        },
        onTextareaChange() {
            console.log('change');
        },
        // 图片上传结束
        uploaded(response, file, fileList) {
            if (response) {
                if (response.success) {
                    // 上传成功，获取光标
                    const cursor = this.editor.getCursor()
                    const imageUrl = response.data
                    const markdownImage = `![](${imageUrl})`
                    // 将 Markdown 形式的 URL 插入编辑框光标所在位置
                    this.editor.replaceSelection(`\n${markdownImage}\n`, cursor)
                    this.$message({
                        showClose: true,
                        message: '图片插入成功',
                        type: 'success'
                    })
                    this.onEditorRefresh()
                } else {
                    // 上传失败
                    this.$message({
                        showClose: true,
                        message: response.message,
                        type: 'error'
                    })
                }
            } else {
                this.$message({
                    showClose: true,
                    message: '上传图片未知异常',
                    type: 'error'
                })
            }
        },
        // 左右栏同步滚动
        leftAndRightScroll() {
            const _this = this;
            const previewRef = document.getElementById('preview');

            previewRef.addEventListener("scroll", function callback() {
                clearTimeout(_this.timeout)

                let source = this
                let target = this.id === 'preview' ? document.getElementsByClassName('CodeMirror-scroll')[0] : previewRef;
                
                target.removeEventListener("scroll", callback, false);
                let percentage = source.scrollTop / (source.scrollHeight - source.offsetHeight)
                let height = percentage * (target.scrollHeight - target.offsetHeight)
                target.scrollTo(0, height)

                _this.timeout = setTimeout(()=> {
                    target.addEventListener("scroll", callback, false);
                }, 300)
            }, false);
        },
        onEditorRefresh() {
            this.editorRefresh();
        },
        endCopy() {
            this.backLight = false;
            setTimeout(()=> {
                this.isCoping = false;
            }, 800);
        },
        ...mapMutations(['initEditorState', 'initEditorEntity', 'setWxRendererOptions',
            'editorRefresh', 'initCssEditorEntity'])
    },
    mounted() {
        this.leftAndRightScroll();
    }
}

</script>
<style lang="less" scoped>
.main-body {
    padding-top: 12px;
    overflow: hidden;
}
.el-main {
    transition: all .3s;
    padding: 0;
    margin: 20px;
    margin-top: 0;
}
.container {
    transition: all .3s;
}
.preview {
    transition: background 0s;
    transition-delay: .2s;
}
.preview-wrapper_night {
    overflow-y: inherit;
    position: relative;
    left: -3px;
    .preview {
        background-color: #fff;
    }
}
#output-wrapper {
    position: relative;
}
.loading-mask {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 376px;
    height: 101%;
    padding-top: 1px;
    font-size: 15px;
    color: gray;
    background-color: #1e1e1e;
    .loading__img {
        position: absolute;
        left: 50%;
        top: 330px;
        width: 50px;
        height: 50px;
        transform: translate(-50%, -50%);
        background: url('../assets/images/favicon.png') no-repeat;
        background-size: cover;
    }
    span {
        position: absolute;
        left: 50%;
        top: 390px;
        transform: translate(-50%, -50%);
    }
}
.bounceInRight {
    animation-name: bounceInRight;
    animation-duration: 1s;
    animation-fill-mode: both;
}
@keyframes bounceInRight {
    0%,60%,75%,90%,100% {
        transition-timing-function: cubic-bezier(0.215,.610,.355,1.000)
    }
    0% {
        opacity:0;
        transform:translate3d(3000px,0,0)}
    60% {
        opacity:1;
        transform:translate3d(-25px,0,0)
    }
    75% {
        transform:translate3d(10px,0,0)
    }
    90% {
        transform:translate3d(-5px,0,0)
    }
    100% {
        transform:none
    }
}
</style>
<style lang="less">
@import url('../assets/less/app.less');
@import url('../assets/less/style-mirror.css');
</style>

