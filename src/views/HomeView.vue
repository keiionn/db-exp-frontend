<template>
  <div class="home-view">
    <h1>欢迎来到社区</h1>
    <p>这是您的主页，类似Reddit的社区界面</p>
    
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索帖子..."
        @keyup.enter="searchPosts"
      />
      <button @click="searchPosts" class="search-btn">搜索</button>
    </div>
    
    <div class="actions">
      <router-link to="/dashboard" class="action-btn" v-if="user">仪表盘</router-link>
      <router-link to="/login" class="action-btn" v-else>登录 / 注册</router-link>
    </div>
    
    <div class="user-posts-section" v-if="user">
      <h2>👤 我发布的帖子</h2>
      <div v-if="userPosts.length === 0" class="no-posts">
        <p>您还没有发布任何帖子</p>
        <router-link to="/community/vue/submit" class="create-post-btn">去发布帖子</router-link>
      </div>
      <div v-else>
        <div class="post-card my-post" v-for="post in userPosts" :key="post.id" @click="goToPost(post)">
          <h3>{{ post.title }}</h3>
          <p>{{ post.content.substring(0, 100) }}...</p>
          <div class="post-meta">
            <span>👍 {{ post.upvotes }}</span>
            <span>💬 {{ post.comments }}</span>
            <span class="community-tag">r/{{ post.communityName }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="posts">
      <h2>所有帖子</h2>
      <div 
        class="post" 
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
          <span v-if="post.authorId === user?.id">👤 我的帖子</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'HomeView',
  data() {
    return {
      // 整合了社区名和更完整的模拟数据
      allPosts: [
        { id: 101, communityName: 'vue', title: 'Vue 3.5 新功能展望', content: '期待 Composition API 的进一步优化，让开发体验更上一层楼。', upvotes: 450, comments: 20, authorId: 1 },
        { id: 102, communityName: 'tech', title: 'AI 伦理的未来挑战', content: '我们该如何规范大模型的使用，以避免潜在的社会风险？', upvotes: 800, comments: 55, authorId: 2 },
        { id: 103, communityName: 'vue', title: '如何优化 Vue 组件渲染性能？', content: '分享一个 useMemo 替代方案，适用于大量数据的场景。', upvotes: 320, comments: 12, authorId: 1 },
        { id: 104, communityName: 'tech', title: '量子计算的最新突破', content: '研究人员宣称在室温下实现了量子纠缠。', upvotes: 95, comments: 8, authorId: 3 }
      ],
      searchQuery: ''
    }
  },
  computed: {
    ...mapState(['user']),
    
    // 过滤用户发布的帖子
    userPosts() {
      if (!this.user) return [];
      // 确保 posts 中 authorId 的类型与 this.user.id 匹配 (这里假设都是数字)
      return this.allPosts.filter(post => post.authorId === this.user.id);
    },
    
    // 过滤所有帖子 (包含搜索逻辑)
    filteredPosts() {
      let postsToFilter = this.allPosts;
      
      if (!this.searchQuery) return postsToFilter;
      
      const query = this.searchQuery.toLowerCase();
      return postsToFilter.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
      );
    }
  },
  methods: {
    searchPosts() {
      // 搜索逻辑已在computed属性 filteredPosts 中实现
      console.log(`执行搜索: ${this.searchQuery}`);
    },
    
    // ✅ 新增：点击帖子跳转逻辑
    goToPost(post) {
      // 路由跳转到 /community/:name/post/:id
      this.$router.push(`/community/${post.communityName}/post/${post.id}`);
    }
  }
}
</script>

<style scoped>
.home-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-bar input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.search-btn, .create-post-btn {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;  
  text-decoration: none; /* 确保 router-link 样式正确 */
}

.search-btn:hover, .create-post-btn:hover {
  background: #27ae60;
}

.actions {
  display: flex;
  gap: 15px;
  margin: 20px 0;
  justify-content: center;
}

.action-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  text-decoration: none;
  transition: background 0.3s;
}

.action-btn:hover {
  background: #2980b9;
}

/* 帖子通用样式 */
.posts {
  margin-top: 30px;
}
.posts h2, .user-posts-section h2 {
    font-size: 1.8rem;
    color: #34495e;
    margin-bottom: 20px;
}

/* 帖子卡片 */
.post, .post-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
  cursor: pointer; /* 启用点击效果 */
  transition: transform 0.2s, box-shadow 0.2s;
}

.post:hover, .post-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.post h3, .post-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.post p, .post-card p {
  color: #34495e;
  margin-bottom: 15px;
}

.post-meta {
  display: flex;
  gap: 20px;
  color: #7f8c8d;
  font-size: 14px;
}

.community-tag {
    background: #ecf0f1;
    color: #3498db;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.8em;
}

/* ✅ 用户帖子区域样式 */
.user-posts-section {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
}
.no-posts {
    background-color: #f7f7f7;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
}
</style>