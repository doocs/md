<template>
    <el-dialog title="本地上传" class="upload__dialog" :visible="value" @close="$emit('close')">
        <el-tabs type="card" :value="'upload'">
            <el-tab-pane class="upload-panel" label="选择上传" name="upload">
                <el-select v-model="imgHost" @change="changeImgHost" placeholder="请选择" size="small">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
                <el-upload drag action :headers="{'Content-Type': 'multipart/form-data'}" :show-file-list="false"
                    :multiple="true" accept=".jpg, .jpeg, .png, .gif" name="file" :before-upload="beforeUpload"
                    v-loading="uploadingImg">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">
                        将图片拖到此处，或
                        <em>点击上传</em>
                    </div>
                </el-upload>
            </el-tab-pane>
            <el-tab-pane class="github-panel" label="GitHub 图床" name="github">
                <el-form class="setting-form" ref="form" :model="formGitHub" label-position="right" label-width="140px">
                    <el-form-item label="GitHub 仓库" :required="true">
                        <el-input v-model="formGitHub.repo" placeholder="如：github.com/yanglbme/resource"></el-input>
                    </el-form-item>
                    <el-form-item label="token" :required="true">
                        <el-input v-model="formGitHub.accessToken" show-password
                            placeholder="如：cc1d0c1426d0fd0902bd2d7184b14da61b8abc46"></el-input>
                        <el-link type="primary"
                            href="https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token"
                            target="_blank">如何获取 GitHub token？</el-link>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="saveGitHubConfiguration">保存配置</el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
             <el-tab-pane class="github-panel" label="阿里云 OSS" name="aliOSS">
                <el-form class="setting-form" ref="form" :model="formAliOSS" label-position="right" label-width="140px">
                    <el-form-item label="AccessKey ID" :required="true">
                        <el-input v-model="formAliOSS.accessKeyId" placeholder="如：LTAI4GdoocsmdoxUf13ylbaNHk"></el-input>
                    </el-form-item>
                    <el-form-item label="AccessKey Secret" :required="true">
                        <el-input v-model="formAliOSS.accessKeySecret" show-password
                            placeholder="如：cc1d0c142doocs0902bd2d7md4b14da6ylbabc46"></el-input>
                    </el-form-item>
                    <el-form-item label="Bucket" :required="true">
                        <el-input v-model="formAliOSS.bucket"
                            placeholder="如：doocs"></el-input>
                    </el-form-item>
                    <el-form-item label="Bucket 所在区域" :required="true">
                        <el-input v-model="formAliOSS.region"
                            placeholder="如：oss-cn-shenzhen"></el-input>
                    </el-form-item>
                     <el-form-item label="存储路径">
                        <el-input v-model="formAliOSS.path"
                            placeholder="如：img"></el-input>
                        <el-link type="primary"
                            href="https://help.aliyun.com/document_detail/31883.html"
                            target="_blank">如何使用阿里云 OSS？</el-link>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="saveAliOSSConfiguration">保存配置</el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
        </el-tabs>
    </el-dialog>
</template>

<script>
import {
    uploadImgFile
} from "../../assets/scripts/uploadImageFile";

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
                repo: "",
                accessToken: "",
            },
            formAliOSS: {
                accessKeyId: "",
                accessKeySecret: "",
                bucket: "",
                region: "",
                path: ""
            },
            options: [{
                    value: "default",
                    label: "默认图床",
                },
                {
                    value: "github",
                    label: "GitHub",
                },
                {
                    value: "aliOSS",
                    label: "阿里云"
                }
            ],
            imgHost: "default",
            uploadingImg: false,
        };
    },
    created() {
        if (localStorage.getItem("githubConfig")) {
            this.formGitHub = JSON.parse(localStorage.getItem("githubConfig"));
        }
        if (localStorage.getItem("aliOSSConfig")) {
            this.formAliOSS = JSON.parse(localStorage.getItem("aliOSSConfig"));
        }
        if (localStorage.getItem("imgHost")) {
            this.imgHost = localStorage.getItem("imgHost");
        }
    },
    methods: {
        changeImgHost() {
            localStorage.setItem("imgHost", this.imgHost);
            this.$message({
                showClose: true,
                message: '已成功切换图床',
                type: "success",
            });
        },
        saveGitHubConfiguration() {
            if (!(this.formGitHub.repo && this.formGitHub.accessToken)) {
                const blankElement = this.formGitHub.repo ? "token" : "GitHub 仓库"
                this.$message({
                    showClose: true,
                    message: `参数「​${blankElement}」不能为空`,
                    type: "error",
                });
                return;
            }
            localStorage.setItem("githubConfig", JSON.stringify(this.formGitHub));
            this.$message({
                message: "保存成功",
                type: "success",
            });
        },
        saveAliOSSConfiguration() {
            if (!(this.formAliOSS.accessKeyId && this.formAliOSS.accessKeySecret && this.formAliOSS.bucket && this.formAliOSS.region)) {
                this.$message({
                    showClose: true,
                    message: `阿里云 OSS 参数配置不全`,
                    type: "error",
                });
                return;
            }
            localStorage.setItem("aliOSSConfig", JSON.stringify(this.formAliOSS));
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
                .then(res => {
                    this.$emit("uploaded", res);
                    this.uploadingImg = false;
                })
                .catch(err => {
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
            switch (localStorage.getItem('imgHost')) {
                case "github":
                    const {
                        repo, accessToken
                    } = this.formGitHub;
                    
                    if (!repo || !accessToken) {
                        this.$message.error("请先配置 GitHub 图床参数");
                        return false;
                    }
                    break;
                case 'aliOSS':
                    const {
                        accessKeyId, accessKeySecret, bucket, region, path
                    } = this.formAliOSS;

                    if (!(accessKeyId && accessKeySecret && bucket && region)) {
                        this.$message.error("请先配置阿里云 OSS 参数");
                        return false;
                    }
            }
            return true;
        },
    },
};
</script>

<style lang="less" scoped>
/deep/ .el-dialog {
    width: 40%;
}
/deep/ .el-upload-dragger {
    width: 335px;
}
/deep/ .el-dialog__body {
    padding-bottom: 50px;
}
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
    width: 100%;

    .el-form-item {
        margin: 15px;
    }

    .el-form-item:last-child {
        text-align: right;
    }
}

</style>
