<template>
  <div class="submit-post-view">
    <h1 class="title">在 r/{{ $route.params.name }} 发布帖子</h1>

    <p class="desc">发布新内容需要登录，请填写下面的表单。</p>

    <!-- 示例：返回按钮 -->
    <router-link to="/dashboard" class="back-btn">
      返回主页
    </router-link>

    <!-- 未来这里填发帖表单 -->
    <div class="placeholder-box">
      <p>发帖表单将在这里显示</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SubmitPostView'
}
</script>

<style scoped>
.submit-post-view {
  max-width: 650px;
  margin: 50px auto;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

/* 标题 */
.title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

/* 描述文字 */
.desc {
  font-size: 15px;
  color: #666;
  margin-bottom: 20px;
}

/* 返回主页按钮（与 dashboard-btn 风格保持一致） */
.back-btn {
  display: inline-block;
  padding: 10px 16px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  transition: 0.25s ease;
}

.back-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* 发帖区域占位 */
.placeholder-box {
  margin-top: 15px;
  padding: 40px;
  border: 2px dashed #bbb;
  border-radius: 10px;
  text-align: center;
  color: #888;
  background: #fafafa;
}
</style>
