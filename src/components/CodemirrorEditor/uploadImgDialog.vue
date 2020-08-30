<template>
  <el-dialog title="插入图片" class="dialog" :visible="value" @close="$emit('close')">
    <el-tabs type="card" :value="'upload'">
      <el-tab-pane class="upload-panel" label="选择上传" name="upload">
        <el-select v-model="imgHost" @change="changeImgHost" placeholder="请选择" size="small">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
        <el-upload
          drag
          action
          :headers="{'Content-Type': 'multipart/form-data'}"
          :show-file-list="false"
          :multiple="true"
          accept=".jpg, .jpeg, .png, .gif"
          name="file"
          :before-upload="beforeUpload"
          v-loading="uploadingImg"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <!-- <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div> -->
        </el-upload>
      </el-tab-pane>
      <el-tab-pane class="github-panel" label="Github图床" name="github">
        <el-form
          class="setting-form"
          ref="form"
          :model="formGitHub"
          label-position="right"
          label-width="100px"
        >
          <el-form-item label="用户名:">
            <el-input v-model="formGitHub.username"></el-input>
          </el-form-item>
          <el-form-item label="仓库名:">
            <el-input v-model="formGitHub.repo"></el-input>
          </el-form-item>
          <el-form-item label="token:">
            <el-input v-model="formGitHub.accessToken"></el-input>
          </el-form-item>
          <!-- <el-form-item label="jsDelivr CDN:">
            <el-checkbox v-model="formGitHub.useCDN"></el-checkbox>
          </el-form-item>-->
          <el-form-item>
            <el-button type="primary" @click="onSubmit">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
import { uploadImgFile } from "../../assets/scripts/uploadImageFile";

export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formGitHub: {
        username: "",
        repo: "",
        accessToken: "",
        // useCDN: true,
      },
      options: [
        {
          value: "default",
          label: "默认图床",
        },
        {
          value: "github",
          label: "GitHub",
        },
      ],
      imgHost: "default",
      uploadingImg: false,
    };
  },
  created() {
    if (localStorage.getItem("GitHubConfig")) {
      this.formGitHub = JSON.parse(localStorage.getItem("GitHubConfig"));
    }
    if (localStorage.getItem("ImgHost")) {
      this.imgHost = localStorage.getItem("ImgHost");
    }
  },
  methods: {
    changeImgHost() {
      console.log("select img host:", this.imgHost);
      localStorage.setItem("ImgHost", this.imgHost);
    },
    onSubmit() {
      console.log("submit github params:", this.formGitHub);
      localStorage.setItem("GitHubConfig", JSON.stringify(this.formGitHub));
      this.$message({
        message: "保存成功",
        type: "success",
      });
    },
    // 图片上传前的处理
    beforeUpload(file) {
      if (!this.validateConfig()) {
        return;
      }

      this.uploadingImg = true;
      uploadImgFile(file)
        .then((res) => {
          this.$emit("uploaded", res);
          this.uploadingImg = false;
        })
        .catch((err) => {
          this.uploadingImg = false;
          this.$message({
            showClose: true,
            message: err,
            type: "error",
          });
        });
      return false;
    },
    validateConfig() {
      switch (this.imgHost) {
        case "github":
          const { username, repo, accessToken } = this.formGitHub;
          if (!username || !repo || !accessToken) {
            this.$message.error("未配置GitHub参数");
            return false;
          }
      }
      return true;
    },
  },
};
</script>

<style lang="less" scoped>
.upload-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  .el-select {
    align-self: flex-end;
    margin: 0 67.75px 20px;
    width: 100px;
  }
}
.github-panel {
  display: flex;
  justify-content: center;
}
.setting-form {
  width: 70%;
  .el-form-item {
    margin: 15px;
  }
  .el-form-item:last-child {
    text-align: right;
  }
}
</style>