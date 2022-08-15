<template>
  <el-dropdown placement="right" class="style-option-menu">
    <div class="el-dropdown-link">
      {{ label }}
      <i class="el-icon-arrow-right el-icon--right"></i>
    </div>
    <el-dropdown-menu slot="dropdown" style="width: 200px">
      <el-dropdown-item
        v-for="{ value, label, desc } in options"
        :key="value"
        :label="label"
        :value="value"
        @click.native="charge(value)"
      >
        <i
          class="el-icon-check"
          :style="{ opacity: current === value ? 1 : 0 }"
        ></i>
        {{ label }}
        <span class="select-item-right">{{ desc }}</span>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

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
