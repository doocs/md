<script setup>
import { nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'

import StyleOptionMenu from './StyleOptionMenu.vue'

import { codeBlockThemeOptions, colorOptions, fontFamilyOptions, fontSizeOptions, githubConfig, legendOptions } from '@/config'
import { useStore } from '@/stores'

const store = useStore()

const {
  fontFamily,
  fontSize,
  fontColor,
  codeBlockTheme,
  legend,
  isMacCodeBlock,
  cssEditor,
} = storeToRefs(store)

const {
  resetStyleConfirm,
  fontChanged,
  sizeChanged,
  colorChanged,
  codeBlockThemeChanged,
  legendChanged,
  macCodeBlockChanged,
  toggleShowCssEditor,
} = store

const colorPicker = ref(null)

function showPicker() {
  colorPicker.value.show()
}

// 自定义CSS样式
function customStyle() {
  toggleShowCssEditor()
  nextTick(() => {
    if (!cssEditor.value) {
      cssEditor.value.refresh()
    }
  })
  setTimeout(() => {
    cssEditor.value.refresh()
  }, 50)
}
</script>

<template>
  <el-dropdown>
    <span class="el-dropdown-link">
      样式<el-icon class="ml-2">
        <ElIconArrowDown />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item class="leading-8">
          <StyleOptionMenu title="字体" :options="fontFamilyOptions" :current="fontFamily" :change="fontChanged" />
        </el-dropdown-item>
        <el-dropdown-item class="leading-8">
          <StyleOptionMenu title="字号" :options="fontSizeOptions" :current="fontSize" :change="sizeChanged" />
        </el-dropdown-item>
        <el-dropdown-item class="leading-8">
          <StyleOptionMenu
            title="颜色"
            :options="colorOptions"
            :current="fontColor"
            :change="colorChanged"
          />
        </el-dropdown-item>
        <el-dropdown-item class="leading-8">
          <StyleOptionMenu
            title="代码主题"
            :options="codeBlockThemeOptions"
            :current="codeBlockTheme"
            :change="codeBlockThemeChanged"
          />
        </el-dropdown-item>
        <el-dropdown-item class="leading-8">
          <StyleOptionMenu title="图注格式" :options="legendOptions" :current="legend" :change="legendChanged" />
        </el-dropdown-item>
        <el-dropdown-item divided class="leading-8" @click="showPicker()">
          <el-tooltip placement="right" effect="light">
            <template #content>
              <el-color-picker
                ref="colorPicker"
                v-model="fontColor"
                :teleported="false"
                show-alpha
                class="ml-auto"
                style="height: 2em"
                @change="colorChanged"
              />
            </template>
            <div class="w-full flex">
              <el-icon class="opacity-0">
                <ElIconCheck />
              </el-icon>
              自定义颜色
            </div>
          </el-tooltip>
        </el-dropdown-item>
        <el-dropdown-item class="leading-8" @click="customStyle">
          <el-icon class="opacity-0">
            <ElIconCheck />
          </el-icon>
          自定义 CSS
        </el-dropdown-item>
        <el-dropdown-item divided class="leading-8" @click="macCodeBlockChanged">
          <el-icon :class="{ 'opacity-0': !isMacCodeBlock }">
            <ElIconCheck />
          </el-icon>
          Mac 代码块
        </el-dropdown-item>
        <el-dropdown-item divided class="leading-8" @click="resetStyleConfirm">
          <el-icon class="opacity-0">
            <ElIconCheck />
          </el-icon>
          重置
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="less" scoped>
.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
