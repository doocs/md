<template>
    <ul v-show="value"  id="menu" class="menu" :style="`left: ${left}px;top: ${top}px;`">
        <li v-for="item of list" :key="item.key" class="menu_item">
            <el-upload v-if="item.key === 'insertPic'" action="" class="li__upload"
                :show-file-list="false" :multiple="true" accept=".jpg,.jpeg,.png,.gif" name="file"
                :before-upload="beforeUpload">
                <span>{{item.text}}</span>
            </el-upload>
            <span v-else @click="$emit('menuTick', item.key)">{{item.text}}</span>
        </li>
    </ul>
</template>

<script>
import {
    uploadImgFile,
} from '../../assets/scripts/uploadImageFile';
export default {
    props: {
        value: {
            type: Boolean,
            default: false
        },
        top: {
            type: Number,
            default: 0
        },
        left: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            list: [
                {
                    text: '上传图片',
                    key: 'insertPic'
                },
                {
                    text: '插入表格',
                    key: 'insertTable'
                },
                {
                    text: '页面重置',
                    key: 'pageReset'
                },
                {
                    text: '下载MD文档',
                    key: 'downLoad'
                }
            ]
        }
    },
    methods: {
        closeCB() {
            this.$emit('input', false);
        },
        // 空函数，阻断el-upload上传
        // 图片上传前的处理
        beforeUpload(file) {
            uploadImgFile(file).then(res=> {
                this.$emit('menuTick', 'insertPic', res)
            }).catch(err=> {
                this.$message({
                    showClose: true,
                    message: err,
                    type: 'error'
                });
            });
            return false;
        },
    },
}
</script>

<style lang="less" scoped>
.menu {
    position: absolute;
    padding: 6px 0;
    border-radius: 4px;
    border: 1px solid #aaaaaa;
    background-color: #ffffff;
    z-index: 9999;
}

.menu_item {
    margin-top: 10px;
    min-width: 125px;
    font-size: 14px;
    line-height: 20px;
    color: #303133;
    cursor: pointer;
    &:first-of-type {
        margin-top: 0;
    }
    &:hover {
        color: white;
        background: rgb(139, 146, 148);
    }
    span {
        text-align: center;
        display: inline-block;
        padding: 4px 0;
        width: 100%;
    }
    /deep/ .el-upload {
        width: 100%;
    }
}


li:hover {
    background-color: #1790ff;
    color: white;
}

li {
    font-size: 15px;
    list-style: none;
}

</style>
