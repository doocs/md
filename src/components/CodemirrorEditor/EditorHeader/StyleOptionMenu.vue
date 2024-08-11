<script setup>
const props = defineProps({
  title: {
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
  change: {
    type: Function,
    required: true,
  },
})

function setStyle(title, value) {
  switch (title) {
    case `字体`:
      return { fontFamily: value }
    case `字号`:
      return { fontSize: value }
    case `颜色`:
      return { color: value }
    default:
      return {}
  }
}
</script>

<template>
  <el-dropdown placement="right" class="style-option-menu">
    <div class="el-dropdown-link leading-8 flex items-center">
      <el-icon class="opacity-0">
        <ElIconCheck />
      </el-icon>
      {{ props.title }}
      <el-icon class="ml-auto">
        <ElIconArrowRight />
      </el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu style="width: 200px">
        <el-dropdown-item
          v-for="{ label, value, desc } in options"
          :key="value"
          :label="label"
          :model-value="value"
          class="leading-8"
          @click="change(value)"
        >
          <el-icon :style="{ opacity: +(current === value) }">
            <ElIconCheck />
          </el-icon>
          {{ label }}
          <span class="ml-auto" :style="setStyle(title, value)">
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
</style>
