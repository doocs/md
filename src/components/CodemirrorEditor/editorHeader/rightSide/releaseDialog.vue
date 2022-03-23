<template>
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
</template>

<script>
// TODO 等待完成
export default {
  name: `releaseDialog`,
}
</script>

<style scoped></style>
