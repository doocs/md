<template>
  <el-dialog title="发布" :visible.sync="form.dialogVisible">
    <el-alert
      style="margin-bottom: 1em"
      title="注：此功能由第三方浏览器插件支持，本平台不保证安全性。"
      type="info"
      show-icon
    >
    </el-alert>
    <el-form
      class="postInfo"
      label-position="right"
      label-width="50px"
      :model="form"
    >
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
    </el-form>

    <template slot="footer" class="dialog-footer">
      <el-button @click="$emit('close')">取 消</el-button>
      <el-button type="primary" @click="$emit('post')">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: `PostInfoDialog`,
  props: {
    form: {
      type: Object,
    },
  },
}
</script>

<style scoped></style>
