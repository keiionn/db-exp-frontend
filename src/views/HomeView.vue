<template>
  <div class="home-container">
    <!-- 搜索栏 -->
    <input
      v-model="searchQuery"
      type="text"
      placeholder="搜索帖子..."
      class="search-input"
    />
    <div class="top-bar">
      <button class="dashboard-btn" @click="goToDashboard">
        我的主页
      </button>
      <button class="dashboard-btn" @click="logout">退出登录</button>
    </div>
    <!-- 帖子列表 -->
    <div class="posts-section">
      <h2>全部帖子</h2>
      <transition-group name="fade" tag="div" class="posts-list">
        <div
          class="post-card"
          v-for="post in filteredPosts"
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
      </transition-group>

      <!-- 空状态 -->
      <div v-if="filteredPosts.length === 0" class="empty-state">
        没有找到相关帖子
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomeView",

  data() {
    return {
      searchQuery: "",

      // 🔥 模拟所有帖子（与 Dashboard 共用，可后续放 Vuex）
      allPosts: [
        { id: 101, communityName: "vue", title: "Vue 3.5 新功能展望", content: "期待 Composition API...", upvotes: 450, comments: 20, authorId: 1 },
        { id: 102, communityName: "tech", title: "AI 伦理的未来挑战", content: "我们该如何规范...", upvotes: 800, comments: 55, authorId: 2 },
        { id: 103, communityName: "vue", title: "如何优化 Vue 组件渲染性能？", content: "分享 useMemo 替代...", upvotes: 320, comments: 12, authorId: 1 },
        { id: 104, communityName: "tech", title: "量子计算的最新突破", content: "研究人员宣称...", upvotes: 95, comments: 8, authorId: 3 }
      ]
    };
  },

  computed: {
    filteredPosts() {
      if (!this.searchQuery) return this.allPosts;

      const q = this.searchQuery.toLowerCase();

      return this.allPosts.filter(
        post =>
          post.title.toLowerCase().includes(q) ||
          post.content.toLowerCase().includes(q) ||
          post.communityName.toLowerCase().includes(q)
      );
    }
  },

  methods: {
    goToPost(post) {
      this.$router.push(`/community/${post.communityName}/post/${post.id}`);
    },
    goToDashboard() {
      this.$router.push('/dashboard');
    },
    logout() {
      this.$store.dispatch("logout"); // 使用dispatch调用action
      this.$router.push("/login");
    }
  }
};
</script>

<style scoped>
.home-container {
  padding: 20px;
}

/* 搜索框 */
.search-input {
  width: 100%;
  padding: 12px 15px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.posts-section h2 {
  margin-bottom: 15px;
  font-size: 22px;
  font-weight: bold;
}

/* 帖子卡片 */
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

/* 淡入动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #777;
}
.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.dashboard-btn {
  padding: 10px 16px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: 0.25s ease;
}

.dashboard-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
</style>
