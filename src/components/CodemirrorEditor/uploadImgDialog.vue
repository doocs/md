<template>
    <el-dialog
        title="本地上传"
        class="upload__dialog"
        :visible="value"
        @close="$emit('close')"
    >
        <el-tabs type="activeName" :value="'upload'">
            <el-tab-pane class="upload-panel" label="选择上传" name="upload">
                <el-select
                    v-model="imgHost"
                    @change="changeImgHost"
                    placeholder="请选择"
                    size="small"
                >
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    >
                    </el-option>
                </el-select>
                <el-upload
                    drag
                    action
                    :headers="{ 'Content-Type': 'multipart/form-data' }"
                    :show-file-list="false"
                    :multiple="true"
                    accept=".jpg, .jpeg, .png, .gif"
                    name="file"
                    :before-upload="beforeImageUpload"
                    :http-request="uploadImage"
                    v-loading="uploadingImg"
                >
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">
                        将图片拖到此处，或
                        <em>点击上传</em>
                    </div>
                </el-upload>
            </el-tab-pane>
            <el-tab-pane class="github-panel" label="Gitee 图床" name="gitee">
                <el-form
                    class="setting-form"
                    :model="formGitee"
                    label-position="right"
                    label-width="140px"
                >
                    <el-form-item label="Gitee 仓库" :required="true">
                        <el-input
                            v-model.trim="formGitee.repo"
                            placeholder="如：gitee.com/yanglbme/resource"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="分支">
                        <el-input
                            v-model.trim="formGitee.branch"
                            placeholder="如：release，可不填，默认 master"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="私人令牌" :required="true">
                        <el-input
                            v-model.trim="formGitee.accessToken"
                            show-password
                            placeholder="如：cc1d0c1426d0fd0902bd2d7184b14da61b8abc46"
                        ></el-input>
                        <el-link
                            type="primary"
                            href="https://gitee.com/profile/personal_access_tokens"
                            target="_blank"
                            >请在
                            Gitee「设置->安全设置->私人令牌」中生成</el-link
                        >
                    </el-form-item>
                    <el-form-item>
                        <el-button
                            type="primary"
                            @click="saveGiteeConfiguration"
                            >保存配置</el-button
                        >
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane class="github-panel" label="GitHub 图床" name="github">
                <el-form
                    class="setting-form"
                    :model="formGitHub"
                    label-position="right"
                    label-width="140px"
                >
                    <el-form-item label="GitHub 仓库" :required="true">
                        <el-input
                            v-model.trim="formGitHub.repo"
                            placeholder="如：github.com/yanglbme/resource"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="分支">
                        <el-input
                            v-model.trim="formGitHub.branch"
                            placeholder="如：release，可不填，默认 master"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="Token" :required="true">
                        <el-input
                            v-model.trim="formGitHub.accessToken"
                            show-password
                            placeholder="如：cc1d0c1426d0fd0902bd2d7184b14da61b8abc46"
                        ></el-input>
                        <el-link
                            type="primary"
                            href="https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token"
                            target="_blank"
                            >如何获取 GitHub Token？</el-link
                        >
                    </el-form-item>
                    <el-form-item>
                        <el-button
                            type="primary"
                            @click="saveGitHubConfiguration"
                            >保存配置</el-button
                        >
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane class="github-panel" label="阿里云 OSS" name="aliOSS">
                <el-form
                    class="setting-form"
                    :model="formAliOSS"
                    label-position="right"
                    label-width="140px"
                >
                    <el-form-item label="AccessKey ID" :required="true">
                        <el-input
                            v-model.trim="formAliOSS.accessKeyId"
                            placeholder="如：LTAI4GdoocsmdoxUf13ylbaNHk"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="AccessKey Secret" :required="true">
                        <el-input
                            v-model.trim="formAliOSS.accessKeySecret"
                            show-password
                            placeholder="如：cc1d0c142doocs0902bd2d7md4b14da6ylbabc46"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="Bucket" :required="true">
                        <el-input
                            v-model.trim="formAliOSS.bucket"
                            placeholder="如：doocs"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="Bucket 所在区域" :required="true">
                        <el-input
                            v-model.trim="formAliOSS.region"
                            placeholder="如：oss-cn-shenzhen"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="自定义 CDN 域名" :required="false">
                        <el-input
                            v-model.trim="formAliOSS.cdnHost"
                            placeholder="如：https://imagecdn.alidaodao.com，可不填"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="存储路径">
                        <el-input
                            v-model.trim="formAliOSS.path"
                            placeholder="如：img，可不填，默认为根目录"
                        ></el-input>
                        <el-link
                            type="primary"
                            href="https://help.aliyun.com/document_detail/31883.html"
                            target="_blank"
                            >如何使用阿里云 OSS？</el-link
                        >
                    </el-form-item>
                    <el-form-item>
                        <el-button
                            type="primary"
                            @click="saveAliOSSConfiguration"
                            >保存配置</el-button
                        >
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane class="github-panel" label="腾讯云 COS" name="txCOS">
                <el-form
                    class="setting-form"
                    :model="formTxCOS"
                    label-position="right"
                    label-width="140px"
                >
                    <el-form-item label="SecretId" :required="true">
                        <el-input
                            v-model.trim="formTxCOS.secretId"
                            placeholder="如：AKIDnQp1w3DOOCSs8F5MDp9tdoocsmdUPonW3"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="SecretKey" :required="true">
                        <el-input
                            v-model.trim="formTxCOS.secretKey"
                            show-password
                            placeholder="如：ukLmdtEJ9271f3DOocsMDsCXdS3YlbW0"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="Bucket" :required="true">
                        <el-input
                            v-model.trim="formTxCOS.bucket"
                            placeholder="如：doocs-3212520134"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="Bucket 所在区域" :required="true">
                        <el-input
                            v-model.trim="formTxCOS.region"
                            placeholder="如：ap-guangzhou"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="自定义 CDN 域名" :required="false">
                        <el-input
                            v-model.trim="formTxCOS.cdnHost"
                            placeholder="如：https://imagecdn.alidaodao.com，可不填"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="存储路径">
                        <el-input
                            v-model.trim="formTxCOS.path"
                            placeholder="如：img，可不填，默认根目录"
                        ></el-input>
                        <el-link
                            type="primary"
                            href="https://cloud.tencent.com/document/product/436/38484"
                            target="_blank"
                            >如何使用腾讯云 COS？</el-link
                        >
                    </el-form-item>
                    <el-form-item>
                        <el-button
                            type="primary"
                            @click="saveTxCOSConfiguration"
                            >保存配置</el-button
                        >
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane class="github-panel" label="七牛云 Kodo" name="qiniu">
                <el-form
                    class="setting-form"
                    :model="formQiniu"
                    label-position="right"
                    label-width="140px"
                >
                    <el-form-item label="AccessKey" :required="true">
                        <el-input
                            v-model.trim="formQiniu.accessKey"
                            placeholder="如：6DD3VaLJ_SQgOdoocsyTV_YWaDmdnL2n8EGx7kG"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="SecretKey" :required="true">
                        <el-input
                            v-model.trim="formQiniu.secretKey"
                            show-password
                            placeholder="如：qgZa5qrvDOOcsmdKStD1oCjZ9nB7MDvJUs_34SIm"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="Bucket" :required="true">
                        <el-input
                            v-model.trim="formQiniu.bucket"
                            placeholder="如：md"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="Bucket 对应域名" :required="true">
                        <el-input
                            v-model.trim="formQiniu.domain"
                            placeholder="如：https://images.123ylb.cn"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="存储区域" :required="true">
                        <el-input
                            v-model.trim="formQiniu.region"
                            placeholder="如：z2"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="存储路径" :required="false">
                        <el-input
                            v-model.trim="formQiniu.path"
                            placeholder="如：img，可不填，默认为根目录"
                        ></el-input>
                        <el-link
                            type="primary"
                            href="https://developer.qiniu.com/kodo"
                            target="_blank"
                            >如何使用七牛云 Kodo？</el-link
                        >
                    </el-form-item>
                    <el-form-item>
                        <el-button
                            type="primary"
                            @click="saveQiniuConfiguration"
                            >保存配置</el-button
                        >
                    </el-form-item>
                </el-form>
            </el-tab-pane>
        </el-tabs>
    </el-dialog>
</template>

<script>
import { uploadImgFile } from "../../assets/scripts/uploadImageFile";
import { toBase64 } from "../../assets/scripts/util";
import fileApi from "../../api/file";

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
            formGitee: {
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
                cdnHost: "",
            },
            formTxCOS: {
                secretId: "",
                secretKey: "",
                bucket: "",
                region: "",
                path: "",
                cdnHost: "",
            },
            formQiniu: {
                accessKey: "",
                secretKey: "",
                bucket: "",
                domain: "",
                region: "",
            },
            options: [
                {
                    value: "default",
                    label: "默认",
                },
                {
                    value: "gitee",
                    label: "Gitee",
                },
                {
                    value: "github",
                    label: "GitHub",
                },
                {
                    value: "aliOSS",
                    label: "阿里云",
                },
                {
                    value: "txCOS",
                    label: "腾讯云",
                },
                {
                    value: "qiniu",
                    label: "七牛云",
                },
            ],
            imgHost: "default",
            uploadingImg: false,
        };
    },
    created() {
        if (localStorage.getItem("githubConfig")) {
            this.formGitHub = JSON.parse(localStorage.getItem("githubConfig"));
        }
        if (localStorage.getItem("giteeConfig")) {
            this.formGitee = JSON.parse(localStorage.getItem("giteeConfig"));
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
                message: "已成功切换图床",
                type: "success",
            });
        },
        saveGitHubConfiguration() {
            if (!(this.formGitHub.repo && this.formGitHub.accessToken)) {
                const blankElement = this.formGitHub.repo
                    ? "token"
                    : "GitHub 仓库";
                this.$message({
                    showClose: true,
                    message: `参数「​${blankElement}」不能为空`,
                    type: "error",
                });
                return;
            }
            localStorage.setItem(
                "githubConfig",
                JSON.stringify(this.formGitHub)
            );
            this.$message({
                message: "保存成功",
                type: "success",
            });
        },
        saveGiteeConfiguration() {
            if (!(this.formGitee.repo && this.formGitee.accessToken)) {
                const blankElement = this.formGitee.repo
                    ? "私人令牌"
                    : "Gitee 仓库";
                this.$message({
                    showClose: true,
                    message: `参数「​${blankElement}」不能为空`,
                    type: "error",
                });
                return;
            }
            localStorage.setItem("giteeConfig", JSON.stringify(this.formGitee));
            this.$message({
                message: "保存成功",
                type: "success",
            });
        },
        saveAliOSSConfiguration() {
            if (
                !(
                    this.formAliOSS.accessKeyId &&
                    this.formAliOSS.accessKeySecret &&
                    this.formAliOSS.bucket &&
                    this.formAliOSS.region
                )
            ) {
                this.$message({
                    showClose: true,
                    message: `阿里云 OSS 参数配置不全`,
                    type: "error",
                });
                return;
            }
            localStorage.setItem(
                "aliOSSConfig",
                JSON.stringify(this.formAliOSS)
            );
            this.$message({
                message: "保存成功",
                type: "success",
            });
        },

        saveTxCOSConfiguration() {
            if (
                !(
                    this.formTxCOS.secretId &&
                    this.formTxCOS.secretKey &&
                    this.formTxCOS.bucket &&
                    this.formTxCOS.region
                )
            ) {
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

        saveQiniuConfiguration() {
            if (
                !(
                    this.formQiniu.accessKey &&
                    this.formQiniu.secretKey &&
                    this.formQiniu.bucket &&
                    this.formQiniu.domain &&
                    this.formQiniu.region
                )
            ) {
                this.$message({
                    showClose: true,
                    message: `七牛云 Kodo 参数配置不全`,
                    type: "error",
                });
                return;
            }
            localStorage.setItem("qiniuConfig", JSON.stringify(this.formQiniu));
            this.$message({
                message: "保存成功",
                type: "success",
            });
        },

        beforeImageUpload(file) {
            let imgHost = localStorage.getItem("imgHost");
            imgHost = !imgHost ? "default" : imgHost;

            const config = localStorage.getItem(`${imgHost}Config`);
            const maxSize = 5;

            const isValidSuffix = /\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(
                file.name
            );
            const isLt5M = file.size / 1024 / 1024 <= maxSize;
            const isValidHost = imgHost == "default" || config;

            if (!isValidSuffix) {
                this.$message.error("请上传 JPG/PNG/GIF 格式的图片");
            }
            if (!isLt5M) {
                this.$message.error(
                    `由于公众号限制，图片大小不能超过 ${maxSize}M`
                );
            }
            if (!isValidHost) {
                this.$message.error(`请先配置 ${imgHost} 图床参数`);
            }
            return isValidSuffix && isLt5M && isValidHost;
        },
        uploadImage(params) {
            this.uploadingImg = true;
            uploadImgFile(params.file)
                .then((res) => {
                    this.$emit("uploaded", res);
                })
                .catch((err) => {
                    this.$message.error(err);
                });
            this.uploadingImg = false;
        },
    },
};
</script>

<style lang="less" scoped>
/deep/ .el-dialog {
    width: 55%;
    min-height: 615px;
    min-width: 640px;
}
/deep/ .el-upload-dragger {
    display: flex;
    flex-flow: column;
    justify-content: center;
    width: 500px;
    height: 360px;
    .el-icon-upload {
        margin-top: 0;
    }
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
