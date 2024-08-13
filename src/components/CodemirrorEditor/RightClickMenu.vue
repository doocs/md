<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  top: {
    type: Number,
    default: 0,
  },
  left: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits([`menuTick`, `closeMenu`])

const menu = [
  [
    {
      text: `上传图片`,
      key: `insertPic`,
    },
    {
      text: `插入表格`,
      key: `insertTable`,
    },
    {
      text: `恢复默认样式`,
      key: `resetStyle`,
    },
  ],
  [
    {
      text: `导入 .md 文档`,
      key: `importMarkdown`,
    },
    {
      text: `导出 .md 文档`,
      key: `exportMarkdown`,
    },
    {
      text: `导出 .html`,
      key: `exportHtml`,
    },
    {
      text: `格式化`,
      key: `formatMarkdown`,
    },
  ],
]

function onMouseDown(key) {
  emit(`menuTick`, key)
  emit(`closeMenu`)
}
</script>

<template>
  <div
    v-show="props.visible"
    id="menu"
    class="menu"
    :style="{
      left: `${props.left}px`,
      top: `${props.top}px`,
    }"
  >
    <ul v-for="(menuItem, index) in menu" :key="index" class="menu__group">
      <li
        v-for="{ key, text } in menuItem"
        :key="key"
        class="menu_item"
        @mousedown="onMouseDown(key)"
      >
        {{ text }}
      </li>
    </ul>
  </div>
</template>

<style lang="less" scoped>
.menu {
  position: absolute;
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-bg-color);
  box-shadow: var(--el-box-shadow);
  z-index: 9999;
}

.menu__group {
  padding: 6px 0;
  margin: 0;
  border-bottom: 1px solid var(--el-border-color);

  &:last-of-type {
    border-bottom: none;
  }
}

.menu_item {
  list-style: none;
  box-sizing: border-box;
  padding: 4px 0 4px 24px;
  margin-top: 10px;
  min-width: 200px;
  line-height: 20px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  cursor: pointer;

  &:first-of-type {
    margin-top: 0;
  }

  &:hover {
    background: var(--el-bg-color-page);
  }

  :deep(.el-upload) {
    width: 100%;
  }
}
</style>
