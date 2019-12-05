let app = new Vue({
  el: '#app',
  data: function () {
    let d = {
      aboutOutput: '',
      output: '',
      source: '',
      editorThemes: [
        { label: '淡雅', value: 'xq-light' },
        { label: '精致', value: 'eclipse' },
        { label: '暗绿', value: 'oceanic-next' }
      ],
      editor: null,
      builtinFonts: [
        {
          label: '无衬线',
          value: "-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif"
        },
        {
          label: '衬线',
          value: "Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif"
        }
      ],
      sizeOption: [
        { label: '13px', value: '13px', desc: '稍小' },
        { label: '14px', value: '14px', desc: '推荐' },
        { label: '15px', value: '15px', desc: '稍大' }
      ],
      colorOption: [
        { label: '经典蓝', value: 'rgba(15, 76, 129, 0.9)', hex: '最新流行色' },
        { label: '翡翠绿', value: 'rgba(0, 152, 116, 0.9)', hex: '清新且优雅' },
        { label: '辣椒红', value: 'rgba(155, 35, 53, 0.9)', hex: '自信且迷人' }
      ],
      aboutDialogVisible: false
    };
    d.currentEditorTheme = d.editorThemes[0].value;
    d.currentFont = d.builtinFonts[0].value;
    d.currentSize = d.sizeOption[1].value;
    d.currentColor = d.colorOption[0].value;
    return d;
  },
  mounted() {
    this.editor = CodeMirror.fromTextArea(
      document.getElementById('editor'),
      {
        lineNumbers: false,
        lineWrapping: true,
        styleActiveLine: true,
        theme: this.currentEditorTheme,
        mode: 'text/x-markdown'
      }
    );
    this.editor.on("change", (cm, change) => {
      this.refresh();
      this.saveEditorContent();
    });

    this.wxRenderer = new WxRenderer({
      theme: setColor(this.currentColor),
      fonts: this.currentFont,
      size: this.currentSize
    });
    // 如果有编辑内容被保存则读取，否则加载默认文档
    if (localStorage.getItem("__editor_content")) {
      this.editor.setValue(localStorage.getItem("__editor_content"));
    } else {
      axios({
        method: 'get',
        url: './assets/default-content.md'
      }).then(resp => {
        this.editor.setValue(resp.data);
      })
    }
  },
  methods: {
    renderWeChat(source) {
      let output = marked(source, { renderer: this.wxRenderer.getRenderer() });
      if (this.wxRenderer.hasFootnotes()) {
        // 去除第一行的 margin-top
        output = output.replace(/(style=".*?)"/, '$1;margin-top: 0"');
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
      let theme = setColor(color)
      this.wxRenderer.setOptions({
        theme: theme
      });
      this.refresh();
    },

    // 图片上传结束
    uploaded(response, file, fileList) {
      if (response.success) {
        // 上传成功，获取光标
        const cursor = this.editor.getCursor();
        const imageUrl = response.data.url
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
    failed(error, file, fileList) {
      console.log(error)
    },
    uploading(event, file, fileList) {
      this.$message({
        showClose: true,
        message: '图片上传中...',
        type: 'info'
      });
    },
    // 刷新右侧预览
    refresh() {
      this.output = this.renderWeChat(this.editor.getValue(0));
    },
    // 将左侧编辑器内容保存到 LocalStorage
    saveEditorContent() {
      let content = this.editor.getValue(0);
      if (content) {
        localStorage.setItem("__editor_content", content);
      } else {
        localStorage.removeItem("__editor_content");
      }
    },
    copy() {
      let clipboardDiv = document.getElementById('output');
      clipboardDiv.focus();
      window.getSelection().removeAllRanges();
      let range = document.createRange();
      range.setStartBefore(clipboardDiv.firstChild);
      range.setEndAfter(clipboardDiv.lastChild);
      window.getSelection().addRange(range);
      this.refresh()
      try {
        if (document.execCommand('copy')) {
          this.$notify({
            showClose: true,
            message: '已复制文章到剪贴板，可直接到公众号后台粘贴',
            offset: 80,
            duration: 1600,
            type: 'success'
          });
        } else {
          this.$notify({
            showClose: true,
            message: '未能复制文章到剪贴板，请全选后右键复制',
            offset: 80,
            duration: 1600,
            type: 'warning'
          });
        }
      } catch (err) {
        this.$notify({
          showClose: true,
          message: '未能复制文章到剪贴板，请全选后右键复制',
          offset: 80,
          duration: 1600,
          type: 'warning'
        });
      }
    },
    visit(url) {
      window.open(url);
    }
  },
  updated() {
    this.$nextTick(() => {
      prettyPrint();
    })
  }
});
