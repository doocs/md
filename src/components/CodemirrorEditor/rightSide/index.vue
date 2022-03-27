<template>
  <div class="right-side">
    <el-tooltip
      class="item"
      :effect="effect"
      content="自定义CSS样式"
      placement="left"
    >
      <el-button
        :type="btnType"
        plain
        size="medium"
        icon="el-icon-setting"
        @click="customStyle"
      ></el-button>
    </el-tooltip>
    <el-button
      :type="btnType"
      plain
      size="medium"
      @click="copy"
      placement="bottom-start"
      >复制</el-button
    >
    <el-button
      :type="btnType"
      plain
      size="medium"
      @click="prePost"
      placement="bottom-start"
      >发布</el-button
    >
    <el-button
      :type="btnType"
      plain
      size="medium"
      class="about"
      @click="aboutDialogVisible = true"
      >关于</el-button
    >
    <!--右侧灯泡 -->
    <el-tooltip :content="btnContent" :effect="effect" placement="bottom-start">
      <div
        class="mode__switch mode__switch_black"
        v-if="nightMode"
        @click="themeChanged"
      ></div>
      <div class="mode__switch" v-else @click="themeChanged"></div>
    </el-tooltip>
    <!--发布弹窗-->
    <el-dialog title="发布" :visible.sync="form.dialogVisible">
      <div class="postInfo">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="封面">
            <el-input
              v-model="form.thumb"
              placeholder="自动提取第一张图"
            ></el-input>
          </el-form-item>
          <el-form-item label="标题">
            <el-input
              v-model="form.title"
              placeholder="自动提取第一个标题"
            ></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              type="textarea"
              :rows="4"
              v-model="form.desc"
              placeholder="自动提取第一个段落"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <div class="info">
              注：此功能由第三方浏览器插件支持，本平台不保证安全性。
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="form.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="post">确 定</el-button>
      </span>
    </el-dialog>
    <!--    关于弹窗-->
    <about-dialog v-model="aboutDialogVisible"></about-dialog>
  </div>
</template>

<script>
import { solveHtml, solveWeChatImage } from '@/assets/scripts/converter'
import DEFAULT_CSS_CONTENT from '@/assets/example/theme-css.txt'
import { mapMutations, mapState } from 'vuex'
import AboutDialog from '@/components/CodemirrorEditor/rightSide/aboutDialog'

export default {
  name: `rightSide`,
  data() {
    return {
      form: {
        dialogVisible: false,
        title: ``,
        desc: ``,
        thumb: ``,
        content: ``,
      },
      aboutDialogVisible: false,
    }
  },
  components: { AboutDialog },
  computed: {
    effect() {
      return this.nightMode ? `dark` : `light`
    },
    btnContent() {
      return this.nightMode ? `浅色模式` : `暗黑模式`
    },
    btnType() {
      return this.nightMode ? `default` : `primary`
    },
    ...mapState({
      output: (state) => state.output,
      cssEditor: (state) => state.cssEditor,
      nightMode: (state) => state.nightMode,
    }),
  },
  methods: {
    // 发布
    post() {
      this.form.dialogVisible = false
      // 使用 window.$syncer 可以检测是否安装插件
      window.syncPost({
        title: this.form.title || this.form.auto.title,
        desc: this.form.desc || this.form.auto.desc,
        content: this.form.content || this.form.auto.content,
        thumb: this.form.thumb || this.form.auto.thumb,
      })
    },
    // 复制到微信公众号
    copy(e) {
      this.$emit(`startCopy`)
      setTimeout(() => {
        let clipboardDiv = document.getElementById(`output`)
        solveWeChatImage()
        solveHtml()
        clipboardDiv.focus()
        window.getSelection().removeAllRanges()
        let range = document.createRange()

        range.setStartBefore(clipboardDiv.firstChild)
        range.setEndAfter(clipboardDiv.lastChild)
        window.getSelection().addRange(range)
        document.execCommand(`copy`)
        window.getSelection().removeAllRanges()
        clipboardDiv.innerHTML = this.output
        // 输出提示
        this.$notify({
          showClose: true,
          message: `已复制渲染后的文章到剪贴板，可直接到公众号后台粘贴`,
          offset: 80,
          duration: 1600,
          type: `success`,
        })
        this.$emit(`refresh`)
        this.$emit(`endCopy`)
      }, 350)
    },
    // 自定义CSS样式
    async customStyle() {
      this.$emit(`showCssEditor`)
      this.$nextTick(() => {
        if (!this.cssEditor) {
          this.cssEditor.refresh()
        }
      })
      setTimeout(() => {
        this.cssEditor.refresh()
      }, 50)

      let flag = localStorage.getItem(`__css_content`)
      if (!flag) {
        this.setCssEditorValue(DEFAULT_CSS_CONTENT)
      }
    },
    prePost() {
      let auto = {}
      try {
        auto = {
          thumb: document.querySelector(`#output img`).src,
          title: [1, 2, 3, 4, 5, 6]
            .map((h) => document.querySelector(`#output h${h}`))
            .filter((h) => h)[0].innerText,
          desc: document.querySelector(`#output p`).innerText,
          content: this.output,
        }
      } catch (error) {
        console.log(`error`, error)
      }
      this.form = {
        dialogVisible: true,
        ...auto,
        auto,
      }
    },
    // 重置样式
    ...mapMutations([`themeChanged`, `setCssEditorValue`]),
  },
}
</script>

<style lang="less" scoped>
.right-side {
  display: flex;
  align-items: center;
}

.mode__switch {
  margin-left: 24px;
  margin-right: 24px;
  width: 24px;
  height: 24px;
  background: url('../../../assets/images/night.png') no-repeat;
  background-size: cover;
  transition: all 0.3s;
}

.mode__switch_black {
  background: url('../../../assets/images/light.png') no-repeat;
  background-size: cover;
}
</style>
