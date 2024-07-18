<script>
export default {
  name: `StyleOptionMenu`,
  props: {
    label: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    current: {
      type: String,
      required: true,
    },
    charge: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    // 暂时以别名形式使用，后续需要修改
    const title = props.label
    return {
      title,
    }
  },
}
</script>

<template>
  <el-dropdown placement="right" class="style-option-menu" style="margin: 0;">
    <div class="el-dropdown-link leading-8 flex items-center">
      <el-icon class="opacity-0">
        <ElIconCheck />
      </el-icon>
      {{ title }}
      <el-icon class="ml-auto">
        <ElIconArrowRight />
      </el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu style="width: 200px">
        <el-dropdown-item
          v-for="{ value, label, desc } in options"
          :key="value"
          :label="label"
          :model-value="value"
          class="leading-8"
          @click="charge(value)"
        >
          <el-icon :style="{ opacity: +(current === value) }">
            <ElIconCheck />
          </el-icon>
          {{ label }}
          <span v-if="title === '字体'" class="ml-auto" :style="{ fontFamily: value }">
            {{ desc }}
          </span>
          <span v-else-if="title === '字号'" class="ml-auto" :style="{ fontSize: value }">
            {{ desc }}
          </span>
          <span v-else-if="title === '颜色'" class="ml-auto" :style="{ color: value }">
            {{ desc }}
          </span>
          <span v-else class="ml-auto">
            {{ desc }}
          </span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="less" scoped>
.style-option-menu {
  margin: 0;
  width: 180px;

  .el-dropdown-link {
    width: 100%;
  }
}

.select-item-right {
  float: right;
  color: #8492a6;
  font-size: 13px;
}
</style>
