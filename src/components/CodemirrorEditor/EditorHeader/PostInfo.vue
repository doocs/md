<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStore } from '@/stores'
import { storeToRefs } from 'pinia'

import { ref } from 'vue'

const store = useStore()
const { output } = storeToRefs(store)

const dialogVisible = ref(false)

const form = ref<any>({
  title: ``,
  desc: ``,
  thumb: ``,
  content: ``,
  auto: {},
})

function prePost() {
  let auto = {}
  try {
    auto = {
      thumb: document.querySelector<HTMLImageElement>(`#output img`)?.src,
      title: [1, 2, 3, 4, 5, 6]
        .map(h => document.querySelector(`#output h${h}`)!)
        .filter(h => h)[0]
        .textContent,
      desc: document.querySelector(`#output p`)!.textContent,
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

declare global {
  interface Window {
    syncPost: (data: { thumb: string, title: string, desc: string, content: string }) => void
  }
}

function post() {
  dialogVisible.value = false;
  // 使用 window.$syncer 可以检测是否安装插件
  (window.syncPost)({
    thumb: form.value.thumb || form.value.auto.thumb,
    title: form.value.title || form.value.auto.title,
    desc: form.value.desc || form.value.auto.desc,
    content: form.value.content || form.value.auto.content,
  })
}

function onUpdate(val: boolean) {
  if (!val) {
    dialogVisible.value = false
  }
}
</script>

<template>
  <Button variant="outline" @click="prePost">
    发布
  </Button>

  <Dialog :open="dialogVisible" @update:open="onUpdate">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>发布</DialogTitle>
      </DialogHeader>

      <el-alert
        class="mb-4"
        title="注：此功能由第三方浏览器插件支持，本平台不保证安全性。"
        type="info"
        show-icon
      />
      <el-form class="postInfo" label-width="50" :model="form">
        <el-form-item label="封面">
          <el-input v-model="form.thumb" placeholder="自动提取第一张图" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="自动提取第一个标题" />
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

      <DialogFooter>
        <Button variant="outline" @click="dialogVisible = false">
          取 消
        </Button>
        <Button @click="post">
          确 定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
