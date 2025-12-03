<template>
  <div class="not-found">
    <h1>404</h1>
    <h2>页面未找到</h2>
    <p>您访问的页面不存在，请检查 URL 是否正确。</p>
    <router-link to="/home">返回主页</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 100px;
  color: #34495e;
}

.not-found h1 {
  font-size: 6rem;
  color: #e74c3c;
}

.not-found h2 {
  margin-top: 10px;
  font-size: 2rem;
}

.not-found a {
  margin-top: 20px;
  display: inline-block;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}
</style>