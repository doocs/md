<template>
  <div class="loading" id="loading">
    <div class="loading-wrapper">
      <div class="loading-anim"></div>
      <div class="loading-text">致力于让 Markdown 编辑更简单</div>
    </div>
  </div>
</template>

<script></script>

<style lang="less" scoped>
.loading-wrapper {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
}
.loading {
  text-align: center;
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 99999;
  background-color: #f2f2f2;
}

.loading_night {
  background-color: #303133;
}

.loading-text {
  font-size: 18px;
  font-weight: bold;
  margin-top: 26px;
  color: #303133;
}

.loading-anim {
  display: inline-block;
  width: 100px;
  height: 100px;
  background: url('../assets/images/favicon.png') no-repeat;
  background-size: cover;
}
</style>
