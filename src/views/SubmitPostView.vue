<template>
  <div class="submit-post-view">
    <h1>在 r/{{ $route.params.name }} 发布帖子</h1>
    <p>这里将是发帖表单 (需要用户登录)</p>
    <router-link :to="`/community/${$route.params.name}`">返回社区</router-link>
  </div>
</template>

<script>
export default {
  name: 'SubmitPostView'
}
</script>

<style scoped>
.submit-post-view {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>