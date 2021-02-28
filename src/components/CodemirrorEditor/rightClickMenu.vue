<template>
  <ul
    v-show="value"
    id="menu"
    class="menu"
    :style="`left: ${left}px;top: ${top}px;`"
  >
    <div class="menu__group" v-for="(menuItem, index) in menu" :key="index">
      <li
        v-for="item of menuItem"
        :key="item.key"
        class="menu_item"
        @mousedown="onMouseDown(item.key)"
      >
        <span>{{ item.text }}</span>
      </li>
    </div>
  </ul>
</template>

<script>
export default {
  props: {
    value: {
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
            text: "上传图片",
            key: "insertPic",
          },
          {
            text: "插入表格",
            key: "insertTable",
          },
          {
            text: "页面重置",
            key: "pageReset",
          },
        ],
        [
          {
            text: "下载 Markdown 文档",
            key: "download",
          },
          {
            text: "格式化 Markdown 文档",
            key: "formatMarkdown",
          },
        ],
      ],
    };
  },
  methods: {
    closeCB() {
      this.$emit("input", false);
    },
    onMouseDown(key) {
      this.$emit("menuTick", key);
      this.$emit("closeMenu", false);
    },
  },
};
</script>

<style lang="less" scoped>
.menu {
  position: absolute;
  border-radius: 4px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  z-index: 9999;
}

.menu_item {
  margin-top: 10px;
  min-width: 200px;
  font-size: 12px;
  line-height: 20px;
  color: #333333;
  cursor: pointer;
  &:first-of-type {
    margin-top: 0;
  }
  &:hover {
    background: #f0f0f0;
  }
  span,
  .btn-upload {
    display: inline-block;
    padding: 4px 0;
    padding-left: 24px;
    width: 100%;
  }
  .btn-upload {
    margin: 0;
    border: none;
    outline: none;
    background: transparent;
  }
  .btn-upload:hover {
    background: #aaaaaa;
  }
  ::v-deep .el-upload {
    width: 100%;
  }
}

.menu__group {
  padding-top: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eeeeee;
  &:last-of-type {
    border-bottom: none;
  }
}

li:hover {
  background-color: #1790ff;
}

li {
  font-size: 15px;
  list-style: none;
}
</style>
