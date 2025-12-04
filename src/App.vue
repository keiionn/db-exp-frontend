<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();

// ⭐ 页面加载时自动尝试登录（自动带上 JSESSIONID）
onMounted(async () => {
  await store.dispatch("autoLogin");
});
</script>

<style>
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
