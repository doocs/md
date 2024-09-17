<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'

import { useStore } from '@/stores'

const store = useStore()

function editTabName() {
  ElMessageBox.prompt(`请输入新的方案名称`, `编辑方案名称`, {
    confirmButtonText: `确认`,
    cancelButtonText: `取消`,
    inputValue: store.cssContentConfig.active,
    inputErrorMessage: `不能与现有方案重名`,
    inputValidator: store.validatorTabName,
  })
    .then(({ value }) => {
      if (!(`${value}`).trim()) {
        ElMessage.error(`修改失败，方案名不可为空`)
        return
      }
      store.renameTab(value)
      ElMessage.success(`修改成功~`)
    })
}

function handleTabsEdit(targetName: string, action: string) {
  if (action === `add`) {
    ElMessageBox.prompt(`请输入方案名称`, `新建自定义 CSS`, {
      confirmButtonText: `确认`,
      cancelButtonText: `取消`,
      inputValue: `方案${store.cssContentConfig.tabs.length + 1}`,
      inputErrorMessage: `不能与现有方案重名`,
      inputValidator: store.validatorTabName,
    })
      .then(({ value }) => {
        if (!(`${value}`).trim()) {
          ElMessage.error(`新建失败，方案名不可为空`)
          return
        }
        store.addCssContentTab(value)
        ElMessage.success(`新建成功~`)
      })
  }
  else if (action === `remove`) {
    const tabs = store.cssContentConfig.tabs
    if (tabs.length === 1) {
      ElMessage.warning(`至少保留一个方案`)
      return
    }
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

    store.tabChanged(activeName)
    store.cssContentConfig.tabs = tabs.filter(tab => tab.name !== targetName)
  }
}
</script>

<template>
  <transition enter-active-class="bounceInRight">
    <el-col v-show="store.isShowCssEditor" :span="8" class="cssEditor-wrapper order-1 h-full flex flex-col border-l-1">
      <el-tabs
        v-model="store.cssContentConfig.active"
        type="border-card"
        stretch
        editable
        @edit="handleTabsEdit"
        @tab-change="store.tabChanged"
      >
        <el-tab-pane
          v-for="item in store.cssContentConfig.tabs"
          :key="item.name"
          :name="item.name"
        >
          <template #label>
            {{ item.title }}
            <el-icon
              v-if="store.cssContentConfig.active === item.name"
              class="ml-1"
              @click="editTabName()"
            >
              <ElIconEditPen />
            </el-icon>
          </template>
        </el-tab-pane>
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

:deep(.el-tabs__content) {
  padding: 0;
}

// 当 tab 为激活状态时，隐藏关闭按钮
:deep(.el-tabs__item.is-active) {
  .is-icon-close {
    display: none;
  }
}

:deep(.el-tabs__new-tab) {
  margin-right: 1em;
}
</style>
