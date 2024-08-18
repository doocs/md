<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'

import { useStore } from '@/stores'

const store = useStore()

function handleTabsEdit(targetName, action) {
  if (action === `add`) {
    ElMessageBox.prompt(`请输入方案名称`, `新建自定义 CSS`, {
      confirmButtonText: `确认`,
      cancelButtonText: `取消`,
      inputErrorMessage: `不能与现有方案重名`,
      inputValidator: store.validatorTabName,
    })
      .then(({ value }) => {
        store.addCssContentTab(value)
        ElMessage.success(`新建成功~`)
      })
  }
  else if (action === `remove`) {
    const tabs = store.cssContentConfig.tabs
    let activeName = store.cssContentConfig.active
    if (activeName === targetName) {
      tabs.forEach((tab, index) => {
        if (tab.name === targetName) {
          const nextTab = tabs[index + 1] || tabs[index - 1]
          if (nextTab) {
            activeName = nextTab.name
          }
        }
      })
    }

    store.cssContentConfig.active = activeName
    store.cssContentConfig.tabs = tabs.filter(tab => tab.name !== targetName)
  }
}
</script>

<template>
  <transition enter-active-class="bounceInRight">
    <el-col v-show="store.isShowCssEditor" :span="8" class="cssEditor-wrapper h-full flex flex-col">
      <el-tabs
        v-model="store.cssContentConfig.active"
        type="card"
        editable
        class="demo-tabs"
        @edit="handleTabsEdit"
        @tab-change="store.tabChanged"
      >
        <el-tab-pane
          v-for="item in store.cssContentConfig.tabs"
          :key="item.name"
          :label="item.title"
          :name="item.name"
        />
      </el-tabs>
      <textarea
        id="cssEditor"
        type="textarea"
        placeholder="Your custom css here."
      />
    </el-col>
  </transition>
</template>

<style lang="less" scoped>
.bounceInRight {
  animation-name: bounceInRight;
  animation-duration: 1s;
  animation-fill-mode: both;
}

@keyframes bounceInRight {
  0%,
  60%,
  75%,
  90%,
  100% {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  0% {
    opacity: 0;
    transform: translate3d(3000px, 0, 0);
  }

  60% {
    opacity: 1;
    transform: translate3d(-25px, 0, 0);
  }

  75% {
    transform: translate3d(10px, 0, 0);
  }

  90% {
    transform: translate3d(-5px, 0, 0);
  }

  100% {
    transform: none;
  }
}

:deep(.el-tabs__header) {
  margin: 0;
}
</style>
