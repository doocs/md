let app = new Vue({
  el: '#app',
  data: function () {
    let d = {
      aboutOutput: '',
      output: '',
      source: '',
      editor: null,
      cssEditor: null,
      builtinFonts: [
        { label: '无衬线', value: "-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif" },
        { label: '衬线', value: "Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif" }
      ],
      sizeOption: [
        { label: '13px', value: '13px', desc: '稍小' },
        { label: '14px', value: '14px', desc: '推荐' },
        { label: '15px', value: '15px', desc: '稍大' }
      ],
      colorOption: [
        { label: '经典蓝', value: 'rgba(15, 76, 129, 1)', hex: '最新流行' },
        { label: '翡翠绿', value: 'rgba(0, 152, 116, 1)', hex: '优雅清新' },
        { label: '活力橘', value: 'rgba(250, 81, 81, 1)', hex: '热情活泼' }
      ],
      showBox: true,
      aboutDialogVisible: false,
      dialogFormVisible: false,
      form: {
        rows: 1,
        cols: 1
      }
    };
    d.currentFont = d.builtinFonts[0].value;
    d.currentSize = d.sizeOption[1].value;
    d.currentColor = d.colorOption[1].value;
    d.status = '1';
    return d;
  },
  mounted() {
    this.showBox = false
    this.editor = CodeMirror.fromTextArea(
      document.getElementById('editor'),
      {
        mode: 'text/x-markdown',
        theme: 'xq-light',
        lineNumbers: false,
        lineWrapping: true,
        styleActiveLine: true,
        autoCloseBrackets: true
      }
    );
    this.cssEditor = CodeMirror.fromTextArea(
      document.getElementById('cssEditor'), {
      mode: 'css',
      theme: 'style-mirror',
      lineNumbers: false,
      lineWrapping: true,
      matchBrackets: true,
      autofocus: true,
      extraKeys: {
        'Ctrl-F': function autoFormat(editor) {
          const totalLines = editor.lineCount();
          editor.autoFormatRange({ line: 0, ch: 0 }, { line: totalLines });
        }
      },
    }
    );
    // 自动提示
    this.cssEditor.on('keyup', (cm, e) => {
      if ((e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode === 189) {
        cm.showHint(e);
      }
    });
    this.editor.on('change', (cm, e) => {
      this.refresh();
      this.saveEditorContent(this.editor, '__editor_content');
    });

    // 粘贴上传图片并插入
    this.editor.on('paste', (cm, e) => {
      if (!(e.clipboardData && e.clipboardData.items)) {
        return;
      }
      for (let i = 0, len = e.clipboardData.items.length; i < len; ++i) {
        let item = e.clipboardData.items[i];
        if (item.kind === 'file') {
          const pasteFile = item.getAsFile();
          if (!(this.checkType(pasteFile) && this.checkImageSize(pasteFile))) {
            return;
          }
          let data = new FormData();
          data.append('file', pasteFile);
          axios.post('https://imgkr.com/api/files/upload', data, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then(resp => {
            this.uploaded(resp.data)
          }).catch(err => { })
        }
      }
    });
    this.cssEditor.on('update', (instance) => {
      this.cssChanged();
      this.saveEditorContent(this.cssEditor, '__css_content');
    });
    this.wxRenderer = new WxRenderer({
      theme: setColor(this.currentColor),
      fonts: this.currentFont,
      size: this.currentSize,
      status: this.status
    });

    // 如果有编辑器内容被保存则读取，否则加载默认内容
    this.loadLocalStorage(this.editor, '__editor_content', DEFAULT_CONTENT);
    this.loadLocalStorage(this.cssEditor, '__css_content', DEFAULT_CSS_CONTENT);
  },
  methods: {
    renderWeChat(source) {
      let output = marked(source, { renderer: this.wxRenderer.getRenderer(this.status) });
      // 去除第一行的 margin-top
      output = output.replace(/(style=".*?)"/, '$1;margin-top: 0"');
      if (this.status) {
        // 引用脚注
        output += this.wxRenderer.buildFootnotes();
        // 附加的一些 style
        output += this.wxRenderer.buildAddition();
      }
      return output;
    },
    editorThemeChanged(editorTheme) {
      this.editor.setOption('theme', editorTheme);
    },
    fontChanged(fonts) {
      this.wxRenderer.setOptions({
        fonts: fonts
      });
      this.refresh();
    },
    sizeChanged(size) {
      this.wxRenderer.setOptions({
        size: size
      });
      this.refresh();
    },
    colorChanged(color) {
      let theme = setColor(color);
      this.wxRenderer.setOptions({
        theme: theme
      });
      this.refresh();
    },
    cssChanged() {
      let json = css2json(this.cssEditor.getValue(0));
      let theme = customCssWithTemplate(json, this.currentColor);
      this.wxRenderer.setOptions({
        theme: theme
      });
      this.refresh();
    },
    // 图片上传前的处理
    beforeUpload(file) {
      return this.checkType(file) && this.checkImageSize(file);
    },
    // 检查文件类型
    checkType(file) {
      if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.name)) {
        this.$message({
          showClose: true,
          message: '请上传 JPG/PNG/GIF 格式的图片',
          type: 'error'
        });
        return false;
      }
      return true;
    },
    // 检查图片大小
    checkImageSize(file) {
      if (file.size > 5 * 1024 * 1024) {
        this.$message({
          showClose: true,
          message: '由于公众号限制，图片大小不能超过 5.0M',
          type: 'error'
        });
        return false;
      }
      return true;
    },
    // 图片上传结束
    uploaded(response, file, fileList) {
      if (response.success) {
        // 上传成功，获取光标
        const cursor = this.editor.getCursor();
        const imageUrl = response.data
        const markdownImage = `![](${imageUrl})`
        // 将 Markdown 形式的 URL 插入编辑框光标所在位置
        this.editor.replaceSelection(`\n${markdownImage}\n`, cursor);
        this.$message({
          showClose: true,
          message: '图片插入成功',
          type: 'success'
        });
        this.refresh();
      } else {
        // 上传失败
        this.$message({
          showClose: true,
          message: response.message,
          type: 'error'
        });
      }
    },
    // 刷新右侧预览
    refresh() {
      this.output = this.renderWeChat(this.editor.getValue(0));
    },
    // 重置页面
    reset() {
      this.$confirm('此操作将丢失本地缓存的文本和自定义样式，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--success',
        cancelButtonClass: 'el-button--success is-plain',
        type: 'warning',
        center: true
      }).then(() => {
        localStorage.clear()
        this.editor.setValue(DEFAULT_CONTENT);
        this.cssEditor.setValue(DEFAULT_CSS_CONTENT);
        this.editor.focus();
        this.cssChanged()
      }).catch(() => {
        this.editor.focus();
      });
    },
    // 插入表格
    insertTable() {
      const cursor = this.editor.getCursor();
      const rows = parseInt(this.form.rows);
      const cols = parseInt(this.form.cols);
      if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
        this.$message({
          showClose: true,
          message: '输入的行/列数无效，请重新输入',
          type: 'error'
        });
        return;
      }

      let table = '';
      for (let i = 0; i < rows + 2; ++i) {
        for (let j = 0; j < cols + 1; ++j) {
          table += (j === 0 ? '|' : (i !== 1 ? '     |' : ' --- |'));
        }
        table += '\n';
      }

      this.editor.replaceSelection(`\n${table}\n`, cursor);
      this.dialogFormVisible = false
      this.refresh();
    },
    statusChanged() {
      this.refresh();
    },
    // 将编辑器内容保存到 LocalStorage
    saveEditorContent(editor, name) {
      const content = editor.getValue(0);
      if (content) {
        localStorage.setItem(name, content);
      } else {
        localStorage.removeItem(name);
      }
    },
    loadLocalStorage(editor, name, content) {
      if (localStorage.getItem(name)) {
        editor.setValue(localStorage.getItem(name));
      } else {
        editor.setValue(content);
      }
    },
    // 下载编辑器内容到本地
    downloadEditorContent() {
      let downLink = document.createElement('a');
      downLink.download = 'content.md';
      downLink.style.display = 'none';
      let blob = new Blob([this.editor.getValue(0)]);
      downLink.href = URL.createObjectURL(blob);
      document.body.appendChild(downLink);
      downLink.click();
      document.body.removeChild(downLink);
    },
    // 自定义CSS样式
    async customStyle() {
      this.showBox = !this.showBox;
      let flag = await localStorage.getItem('__css_content')
      if (!flag) {
        this.cssEditor.setValue(DEFAULT_CSS_CONTENT);
      }
    },
    // 复制渲染后的内容到剪贴板
    copy() {
      let clipboardDiv = document.getElementById('output');
      clipboardDiv.focus();
      window.getSelection().removeAllRanges();
      let range = document.createRange();
      range.setStartBefore(clipboardDiv.firstChild);
      range.setEndAfter(clipboardDiv.lastChild);
      window.getSelection().addRange(range);
      document.execCommand('copy')
      // 输出提示
      this.$notify({
        showClose: true,
        message: '已复制渲染后的文章到剪贴板，可直接到公众号后台粘贴',
        offset: 80,
        duration: 1600,
        type: 'success'
      });
    }
  },
  updated() {
    this.$nextTick(() => {
      prettyPrint();
    })
  }
});
