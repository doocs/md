import Vue from 'vue'
import Vuex from 'vuex'
import config from '../assets/scripts/config';
import WxRenderer from '../assets/scripts/renderers/wx-renderer'
import marked from 'marked'
import CodeMirror from 'codemirror/lib/codemirror'
import DEFAULT_CONTENT from '../assets/scripts/default-content'
import DEFAULT_CSS_CONTENT from '../assets/scripts/themes/default-theme-css'
import {
    setColor,
    formatDoc
} from '../assets/scripts/util'

Vue.use(Vuex)

const state = {
    wxRenderer: null,
    output: '',
    html: '',
    editor: null,
    cssEditor: null,
    currentFont: '',
    currentSize: '',
    currentColor: '',
    citeStatus: 0,
    nightMode: false,
    rightClickMenuVisible: false
};
const mutations = {
    setEditorValue(state, data) {
        state.editor.setValue(data)
    },
    setCssEditorValue(state, data) {
        state.cssEditor.setValue(data)
    },
    setWxRendererOptions(state, data) {
        state.wxRenderer.setOptions(data);
    },
    setCiteStatus(state, data) {
        state.citeStatus = data;
        localStorage.setItem('citeStatus', data)
    },
    setCurrentFont(state, data) {
        state.currentFont = data;
        localStorage.setItem('fonts', data)
    },
    setCurrentSize(state, data) {
        state.currentSize = data;
        localStorage.setItem('size', data)
    },
    setCurrentColor(state, data) {
        state.currentColor = data;
        localStorage.setItem('color', data)
    },
    setRightClickMenuVisible(state, data) {
        state.rightClickMenuVisible = data;
    },
    themeChanged(state) {
        state.nightMode = !state.nightMode;
    },
    initEditorState(state) {
        state.currentFont = localStorage.getItem('fonts') || config.builtinFonts[0].value
        state.currentColor = localStorage.getItem('color') || config.colorOption[1].value
        state.currentSize = localStorage.getItem('size') || config.sizeOption[2].value
        state.citeStatus = localStorage.getItem('citeStatus') === 'true'
        state.wxRenderer = new WxRenderer({
            theme: setColor(state.currentColor),
            fonts: state.currentFont,
            size: state.currentSize,
            status: state.citeStatus
        })
    },
    initEditorEntity(state) {
        state.editor = CodeMirror.fromTextArea(
            document.getElementById('editor'), {
                value: '',
                mode: 'text/x-markdown',
                theme: 'xq-light',
                lineNumbers: false,
                lineWrapping: true,
                styleActiveLine: true,
                autoCloseBrackets: true,
                extraKeys: {
                    'Ctrl-F': function autoFormat(editor) {
                        const doc = formatDoc(editor.getValue(0))
                        localStorage.setItem('__editor_content', doc)
                        editor.setValue(doc)
                    }
                }
            }
        )
        
        // 如果有编辑器内容被保存则读取，否则加载默认内容
        state.editor.setValue(localStorage.getItem('__editor_content') || formatDoc(DEFAULT_CONTENT))
    },
    initCssEditorEntity(state) {
        state.cssEditor = CodeMirror.fromTextArea(
            document.getElementById('cssEditor'), {
                value: '',
                mode: 'css',
                theme: 'style-mirror',
                lineNumbers: false,
                lineWrapping: true,
                matchBrackets: true,
                autofocus: true,
                extraKeys: {
                    'Ctrl-F': function autoFormat(editor) {
                        const totalLines = editor.lineCount()
                        editor.autoFormatRange({
                            line: 0,
                            ch: 0
                        }, {
                            line: totalLines
                        })
                    }
                }
            }
        )

        // 如果有编辑器内容被保存则读取，否则加载默认内容
        state.cssEditor.setValue(localStorage.getItem('__css_content') || DEFAULT_CSS_CONTENT)
    },
    editorRefresh(state) {
        let output = marked(state.editor.getValue(0), {
            renderer: state.wxRenderer.getRenderer(state.citeStatus)
        })
        // 去除第一行的 margin-top
        output = output.replace(/(style=".*?)"/, '$1;margin-top: 0"')
        if (state.citeStatus) {
            // 引用脚注
            output += state.wxRenderer.buildFootnotes()
            // 附加的一些 style
            output += state.wxRenderer.buildAddition()
        }
        state.output = output
    },
    clearEditorToDefault(state) {
        const doc = formatDoc(DEFAULT_CONTENT)
        state.editor.setValue(doc)
        state.cssEditor.setValue(DEFAULT_CSS_CONTENT)
    }
}

export default new Vuex.Store({
    state,
    mutations,
    actions: {},
    modules: {}
})
