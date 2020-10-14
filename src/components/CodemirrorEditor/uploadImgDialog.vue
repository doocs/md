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
                        <el-input v-model.trim="formGitHub.repo" placeholder="如：github.com/yanglbme/resource"></el-input>
                    </el-form-item>
                    <el-form-item label="分支">
                        <el-input v-model.trim="formGitHub.branch" placeholder="如：release，可不填，默认 master"></el-input>
                    </el-form-item>
                    <el-form-item label="Token" :required="true">
                        <el-input v-model.trim="formGitHub.accessToken" show-password
                            placeholder="如：cc1d0c1426d0fd0902bd2d7184b14da61b8abc46"></el-input>
                        <el-link type="primary"
                            href="https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token"
                            target="_blank">如何获取 GitHub Token？</el-link>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="saveGitHubConfiguration">保存配置</el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
             <el-tab-pane class="github-panel" label="阿里云 OSS" name="aliOSS">
                <el-form class="setting-form" ref="form" :model="formAliOSS" label-position="right" label-width="140px">
                    <el-form-item label="AccessKey ID" :required="true">
                        <el-input v-model.trim="formAliOSS.accessKeyId" placeholder="如：LTAI4GdoocsmdoxUf13ylbaNHk"></el-input>
                    </el-form-item>
                    <el-form-item label="AccessKey Secret" :required="true">
                        <el-input v-model.trim="formAliOSS.accessKeySecret" show-password
                            placeholder="如：cc1d0c142doocs0902bd2d7md4b14da6ylbabc46"></el-input>
                    </el-form-item>
                    <el-form-item label="Bucket" :required="true">
                        <el-input v-model.trim="formAliOSS.bucket"
                            placeholder="如：doocs"></el-input>
                    </el-form-item>
                    <el-form-item label="Bucket 所在区域" :required="true">
                        <el-input v-model.trim="formAliOSS.region"
                            placeholder="如：oss-cn-shenzhen"></el-input>
                    </el-form-item>
                    <el-form-item label="自定义CDN域名" :required="false">
                        <el-input v-model.trim="formAliOSS.cdnHost"
                            placeholder="如：https://imagecdn.alidaodao.com"></el-input>
                    </el-form-item>
                     <el-form-item label="存储路径">
                        <el-input v-model.trim="formAliOSS.path"
                            placeholder="如：img，可不填，默认为根目录"></el-input>
                        <el-link type="primary"
                            href="https://help.aliyun.com/document_detail/31883.html"
                            target="_blank">如何使用阿里云 OSS？</el-link>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="saveAliOSSConfiguration">保存配置</el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane class="github-panel" label="腾讯云 COS" name="txCOS">
                <el-form class="setting-form" ref="form" :model="formTxCOS" label-position="right" label-width="140px">
                    <el-form-item label="SecretId" :required="true">
                        <el-input v-model.trim="formTxCOS.secretId" placeholder="如：AKIDnQp1w3DOOCSs8F5MDp9tdoocsmdUPonW3"></el-input>
                    </el-form-item>
                    <el-form-item label="SecretKey" :required="true">
                        <el-input v-model.trim="formTxCOS.secretKey" show-password
                            placeholder="如：ukLmdtEJ9271f3DOocsMDsCXdS3YlbW0"></el-input>
                    </el-form-item>
                    <el-form-item label="Bucket" :required="true">
                        <el-input v-model.trim="formTxCOS.bucket"
                            placeholder="如：doocs-3212520134"></el-input>
                    </el-form-item>
                    <el-form-item label="Bucket 所在区域" :required="true">
                        <el-input v-model.trim="formTxCOS.region"
                            placeholder="如：ap-guangzhou"></el-input>
                    </el-form-item>
                    <el-form-item label="自定义CDN域名" :required="false">
                        <el-input v-model.trim="formTxCOS.cdnHost"
                            placeholder="如：https://imagecdn.alidaodao.com"></el-input>
                    </el-form-item>
                     <el-form-item label="存储路径">
                        <el-input v-model.trim="formTxCOS.path"
                            placeholder="如：img，可不填，默认根目录"></el-input>
                        <el-link type="primary"
                            href="https://cloud.tencent.com/document/product/436/38484"
                            target="_blank">如何使用腾讯云 COS？</el-link>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="saveTxCOSConfiguration">保存配置</el-button>
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
                branch: "",
                accessToken: "",
            },
            formAliOSS: {
                accessKeyId: "",
                accessKeySecret: "",
                bucket: "",
                region: "",
                path: "",
                cdnHost:""
            },
            formTxCOS: {
                secretId: "",
                secretKey: "",
                bucket: "",
                region: "",
                path: "",
                cdnHost:""
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
                },
                {
                    value: "txCOS",
                    label: "腾讯云"
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
        if (localStorage.getItem("txCOSConfig")) {
            this.formTxCOS = JSON.parse(localStorage.getItem("txCOSConfig"));
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

        saveTxCOSConfiguration() {
            if (!(this.formTxCOS.secretId && this.formTxCOS.secretKey && this.formTxCOS.bucket && this.formTxCOS.region)) {
                this.$message({
                    showClose: true,
                    message: `腾讯云 COS 参数配置不全`,
                    type: "error",
                });
                return;
            }
            localStorage.setItem("txCOSConfig", JSON.stringify(this.formTxCOS));
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
            let checkRes = true, errMessage = '';

            switch (localStorage.getItem('imgHost')) {
                case 'github':
                    checkRes = this.formGitHub.repo && this.formGitHub.accessToken;
                    errMessage = checkRes ? '' : '请先配置 GitHub 图床参数';
                    break;
                case 'aliOSS':
                    checkRes = this.formAliOSS.accessKeyId && this.formAliOSS.accessKeySecret && this.formAliOSS.bucket && this.formAliOSS.region;
                    errMessage = checkRes ? '' : '请先配置阿里云 OSS 参数';
                    break;
                case 'txCOS':
                    checkRes = this.formTxCOS.secretId && this.formTxCOS.secretKey && this.formTxCOS.bucket && this.formTxCOS.region;
                    errMessage = checkRes ? '' : '请先配置腾讯云 COS 参数';
                    break;
            }
            errMessage && this.$message.error(errMessage);
            return checkRes;
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
