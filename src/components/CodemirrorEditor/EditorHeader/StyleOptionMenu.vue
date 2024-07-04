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
}
</script>

<template>
  <el-dropdown placement="right" class="style-option-menu">
    <div class="el-dropdown-link">
      {{ label }}
      <el-icon><ElIconArrowRight /></el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu style="width: 200px">
        <el-dropdown-item
          v-for="{ value, label, desc } in options"
          :key="value"
          :label="label"
          :model-value="value"
          @click="charge(value)"
        >
          <el-icon :style="{ opacity: +(current === value) }">
            <ElIconCheck />
          </el-icon>
          {{ label }}
          <span class="select-item-right" :style="{ fontFamily: value }">{{
            desc
          }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="less" scoped>
.style-option-menu.el-dropdown {
  margin: 0;
  width: 150px;

  .el-dropdown-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.select-item-right {
  float: right;
  color: #8492a6;
  font-size: 13px;
}
</style>
