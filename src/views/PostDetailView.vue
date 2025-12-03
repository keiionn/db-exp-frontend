<template>
  <div class="post-detail-container">
    <div v-if="isLoading" class="loading-state">
      正在加载帖子信息...
    </div>

    <div v-else-if="post" class="post-content-card">
      <p class="community-link">
        <router-link :to="`/community/${$route.params.name}`">
          返回 r/{{ $route.params.name }}
        </router-link>
      </p>
      
      <h1>{{ post.title }}</h1>
      <div class="post-meta-top">
        <span>作者: {{ post.authorId === user?.id ? '我' : post.authorId }}</span>
        <span>•</span>
        <span>发布于: 2025-11-27 (Mock)</span>
      </div>

      <div class="post-body">
        <p>{{ post.content }}</p>
        </div>
      
      <div class="post-footer">
        <div class="votes">
          <i class="fas fa-arrow-up upvote"></i>
          <span>{{ post.upvotes }}</span>
          <i class="fas fa-arrow-down downvote"></i>
        </div>
        <span class="comments">💬 {{ post.comments }} 评论</span>
      </div>
    </div>
    
    <div v-else class="error-state">
      <p>帖子未找到或加载失败。</p>
      <router-link to="/home">返回主页</router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

// ⚠️ 假设帖子详情 API 在 communityApi 中
import communityApi from '@/api/community'; 

export default {
  name: 'PostDetailView',
  data() {
    return {
      post: null,
      isLoading: true,
      allPosts: [ // ⚠️ 从 communityApi 复制模拟数据
        { id: 101, communityName: 'vue', title: 'Vue 3.5 新功能展望', content: '期待 Composition API 的进一步优化...', upvotes: 450, comments: 20, authorId: 1 },
        { id: 102, communityName: 'tech', title: 'AI 伦理的未来挑战', content: '我们该如何规范大模型的使用？', upvotes: 800, comments: 55, authorId: 2 },
        { id: 103, communityName: 'vue', title: '如何优化 Vue 组件渲染性能？', content: '分享一个 useMemo 替代方案。', upvotes: 320, comments: 12, authorId: 1 },
      ],
    };
  },
  computed: {
    ...mapState(['user']),
  },
  created() {
    this.fetchPostDetail();
  },
  methods: {
    async fetchPostDetail() {
      this.isLoading = true;
      const postId = parseInt(this.$route.params.id);
      
      // ⚠️ 真实 API 调用: const response = await communityApi.getPostDetail(postId);
      
      // 模拟 API 调用: 查找本地模拟数据
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟
      const foundPost = this.allPosts.find(p => p.id === postId);

      this.post = foundPost;
      this.isLoading = false;
    },
  },
};
</script>

<style scoped>
.post-detail-container {
  max-width: 900px;
  margin: 30px auto;
  padding: 0 20px;
}

.post-content-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.community-link a {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9em;
  margin-bottom: 20px;
  display: inline-block;
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.post-meta-top {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 25px;
  display: flex;
  gap: 15px;
}

.post-body p {
  line-height: 1.8;
  color: #34495e;
  font-size: 1.1rem;
  margin-bottom: 40px;
}

.post-footer {
  display: flex;
  align-items: center;
  gap: 25px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.votes {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #7f8c8d;
}

.votes i {
  cursor: pointer;
  padding: 5px;
}

.upvote:hover {
  color: #e74c3c; /* 红色 */
}

.downvote:hover {
  color: #3498db; /* 蓝色 */
}
.comments {
    color: #3498db;
    font-weight: 600;
}
</style>