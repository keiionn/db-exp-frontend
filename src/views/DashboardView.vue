<template>
  <div class="dashboard-container">
    <h1>我的主页</h1>

    <!-- 显示当前用户（从 Vuex 获取） -->
    <div class="user-info">
      <p><strong>用户名：</strong> {{ user.username }}</p>
    </div>
    <div class="submit-post">
      <h2>帖子管理</h2>
      <button class="btn" @click="submitPost">发布帖子</button>
    </div>

    <!-- 账户管理功能 -->
    <div class="user-management">
      <h2>账户管理</h2>

      <button class="btn" @click="changePassword">更改密码</button>
    </div>

    <!-- ✨ 我发布的帖子 -->
    <div class="my-posts-section">
      <h2>我发布的帖子</h2>

      <div v-if="userPosts.length > 0">
        <div
          class="post-card"
          v-for="post in userPosts"
          :key="post.id"
          @click="goToPost(post)"
        >
          <h3>{{ post.title }}</h3>
          <p>{{ post.content.substring(0, 100) }}...</p>
          <div class="post-meta">
            <span>👍 {{ post.upvotes }}</span>
            <span>💬 {{ post.comments }}</span>
            <span class="community-tag">r/{{ post.communityName }}</span>
          </div>
        </div>
      </div>

      <p v-else class="empty">暂无帖子</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardView",

  computed: {
    // 从 Vuex 读取当前登录用户
    user() {
      return this.$store.state.user;
    },

    // 用户发布的帖子
    userPosts() {
      return this.allPosts.filter(p => p.authorId === this.user.id);
    }
  },

  data() {
    return {
      // 帖子数据（你之后可从 API 加载）
      allPosts: [
        { id: 101, communityName: "vue", title: "Vue 3.5 新功能展望", content: "期待 Composition API...", upvotes: 450, comments: 20, authorId: 1 },
        { id: 102, communityName: "tech", title: "AI 伦理的未来挑战", content: "我们该如何规范...", upvotes: 800, comments: 55, authorId: 2 },
        { id: 103, communityName: "vue", title: "如何优化 Vue 组件渲染性能？", content: "分享 useMemo 替代...", upvotes: 320, comments: 12, authorId: 1 },
        { id: 104, communityName: "tech", title: "量子计算的最新突破", content: "研究人员宣称...", upvotes: 95, comments: 8, authorId: 3 }
      ]
    };
  },

  methods: {
    goToPost(post) {
      this.$router.push(`/community/${post.communityName}/post/${post.id}`);
    },

    changePassword() {
      this.$router.push(`/community/${post.communityName}/post/${post.id}`);
    },

    submitPost() {
      this.$router.push(`/submitpost`);
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.user-info {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  margin-bottom: 20px;
}

.user-management {
  margin-bottom: 30px;
}

.btn {
  padding: 10px 14px;
  margin-right: 10px;
  background: #4a8fff;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}
.btn:hover {
  opacity: 0.9;
}
.btn.danger {
  background: #e74c3c;
}

.my-posts-section {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.post-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  margin-bottom: 15px;
  cursor: pointer;
  transition: 0.25s;
}

.post-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.post-meta {
  display: flex;
  gap: 20px;
  color: #888;
  margin-top: 10px;
}

.community-tag {
  background: #eef3f7;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #007bff;
}

.empty {
  color: #777;
  margin-top: 10px;
}
</style>
