<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
// 不需要额外的导入，因为使用了 <router-view>
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  display: flex;
  flex-direction: column;
}
</style>