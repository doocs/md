<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useStore } from '@/stores'

defineEmits([`close`, `post`])

const store = useStore()
const { output } = storeToRefs(store)

const dialogVisible = ref(false)

const form = ref({
  title: ``,
  desc: ``,
  thumb: ``,
  content: ``,
})

function prePost() {
  let auto = {}
  try {
    auto = {
      thumb: document.querySelector(`#output img`)?.src,
      title: [1, 2, 3, 4, 5, 6]
        .map(h => document.querySelector(`#output h${h}`))
        .filter(h => h)[0].textContent,
      desc: document.querySelector(`#output p`).textContent,
      content: output.value,
    }
  }
  catch (error) {
    console.log(`error`, error)
  }
  form.value = {
    ...auto,
    auto,
  }
  dialogVisible.value = true
}

function post() {
  dialogVisible.value = false
  // 使用 window.$syncer 可以检测是否安装插件
  window.syncPost({
    thumb: form.value.thumb || form.value.auto.thumb,
    title: form.value.title || form.value.auto.title,
    desc: form.value.desc || form.value.auto.desc,
    content: form.value.content || form.value.auto.content,
  })
}
</script>

<template>
  <el-button plain type="primary" @click="prePost">
    发布
  </el-button>

  <el-dialog
    title="发布"
    :model-value="dialogVisible"
    @close="dialogVisible = false"
  >
    <el-alert
      class="mb-4"
      title="注：此功能由第三方浏览器插件支持，本平台不保证安全性。"
      type="info"
      show-icon
    />
    <el-form
      class="postInfo"
      label-width="50"
      :model="form"
    >
      <el-form-item label="封面">
        <el-input
          v-model="form.thumb"
          placeholder="自动提取第一张图"
        />
      </el-form-item>
      <el-form-item label="标题">
        <el-input
          v-model="form.title"
          placeholder="自动提取第一个标题"
        />
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="form.desc"
          type="textarea"
          :rows="4"
          placeholder="自动提取第一个段落"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">
        取 消
      </el-button>
      <el-button type="primary" @click="post">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>
