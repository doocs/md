<template>
  <div
    id="menu"
    class="menu"
    v-show="visible"
    :style="`left: ${left}px;top: ${top}px;`"
  >
    <ul class="menu__group" v-for="(menuItem, index) in menu" :key="index">
      <li
        class="menu_item"
        v-for="{ key, text } in menuItem"
        :key="key"
        @mousedown="onMouseDown(key)"
      >
        {{ text }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
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
  },
  data() {
    return {
      menu: [
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
            key: `download`,
          },
          {
            text: `导出 .html`,
            key: `export`,
          },
          {
            text: `格式化`,
            key: `formatMarkdown`,
          },
        ],
      ],
    }
  },
  methods: {
    onMouseDown(key) {
      this.$emit(`menuTick`, key)
      this.$emit(`closeMenu`)
    },
  },
}
</script>

<style lang="less" scoped>
.menu {
  position: absolute;
  border-radius: 4px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  z-index: 9999;
}

.menu__group {
  margin: 0;
  padding: 6px 0;
  border-bottom: 1px solid #eeeeee;

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
  color: #333333;
  cursor: pointer;

  &:first-of-type {
    margin-top: 0;
  }

  &:hover {
    background: #f0f0f0;
  }

  ::v-deep .el-upload {
    width: 100%;
  }
}
</style>
