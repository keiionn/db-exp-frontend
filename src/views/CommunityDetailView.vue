<template>
  <div class="community-detail-container">
    <!-- 加载中 -->
    <div v-if="isLoading" class="loading-state">
      正在加载社区信息...
    </div>

    <!-- 加载失败 -->
    <div v-else-if="error" class="error-state fade-in">
      <div class="error-box">
        <i class="fas fa-exclamation-circle error-icon"></i>
        <h2>加载失败</h2>
        <p>无法获取社区数据，可能是服务器未启动或网络问题。</p>
        <div class="error-actions">
          <button class="retry-btn" @click="retryFetch">重试</button>
          <router-link to="/home" class="back-home-btn">返回首页</router-link>
        </div>
      </div>
    </div>

    <!-- 加载成功 -->
    <div v-else-if="community" class="community-content">
      <div class="community-header">
        <h1>{{ community.communityName }}</h1>
        <p class="community-title">{{ community.title }}</p>
        <p class="community-description">{{ community.description }}</p>
        <p>创建者: {{ community.authorName }}</p>

        <div class="header-actions">
          <button class="create-post-btn" @click="showPostForm = true">
            创建帖子
          </button>
          <router-link to="/home" class="back-home-btn">
            返回首页
          </router-link>
        </div>
      </div>

      <!-- 创建帖子表单弹窗 -->
      <div v-if="showPostForm" class="post-form-modal">
        <div class="modal-content">
          <h2>创建新帖子</h2>
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="post-title">标题</label>
              <input
                type="text"
                id="post-title"
                v-model="newPost.title"
                placeholder="输入帖子标题"
                required
              />
            </div>
            <div class="form-group">
              <label for="post-description">内容</label>
              <textarea
                id="post-description"
                v-model="newPost.description"
                placeholder="输入帖子内容"
                rows="5"
                required
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="showPostForm = false">
                取消
              </button>
              <button type="submit" class="submit-btn">
                提交
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="posts-list">
        <h2>最新帖子</h2>

        <div v-if="posts.length === 0" class="no-posts">
          <p>社区还没有帖子，快来创建第一个吧！</p>
        </div>

        <div v-else>
          <div class="post-card" v-for="post in posts" :key="post.postId" @click="goToPost(post.postId)">
            <div class="votes">
              <i class="fas fa-arrow-up"></i>
              <span>{{ post.upvotes }}</span>
            </div>
            <div class="post-info">
              <h3>{{ post.title }}</h3>
              <p>{{ post.description.substring(0, 100) }}...</p>
              <div class="post-meta">
                <span>💬 {{ post.comments }} 评论</span>
                <span>作者: {{ post.authorName }}</span>
                <span>查看详情</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 未找到 -->
    <div v-else class="error-state fade-in">
      <div class="error-box">
        <i class="fas fa-times-circle error-icon"></i>
        <h2>社区未找到</h2>
        <p>你访问的社区不存在。</p>
        <router-link to="/home" class="back-home-btn">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";

export default {
  name: "CommunityDetailView",
  data() {
    return {
      isLoading: true,
      error: false,
      community: null,
      posts: [],
      showPostForm: false,
      newPost: {
        title: '',
        description: ''
      },
    };
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.fetchCommunityData();
        }
      }
    }
  },
  computed: {
    getUserInfo() {
      return this.$store.state.user || {};
    }
  },
  methods: {
    async fetchCommunityData() {
      this.isLoading = true;
      this.error = false;
      this.community = null;
      this.posts = [];

      try {
        const communityId = this.$route.params.id;
        const response = await api.get(`/api/communities/${communityId}`);
        
        this.community = response.data.community;
        this.posts = response.data.posts;
      } catch (err) {
        console.error("获取社区数据失败:", err);
        this.error = true;
      } finally {
        this.isLoading = false;
      }
    },
    retryFetch() {
      this.fetchCommunityData();
    },
    goToPost(postId) {
      this.$router.push(`/posts/${postId}`);
    },
    async createNewPost() {
      try {
        const response = await api.post('/api/posts/createNewPost', {
          title: this.newPost.title,
          description: this.newPost.description,
          communityId: this.community.communityId,
          authorId: this.getUserInfo.userId
        });
        
        console.log('帖子创建成功:', response.data);
        this.showPostForm = false;
        this.newPost = { title: '', description: '' };
        
        // 刷新帖子列表
        this.fetchCommunityData();
        
        // 跳转到新创建的帖子
        this.$router.push(`/posts/${response.data.postId}`);
      } catch (error) {
        console.error('创建帖子失败:', error);
        alert('创建帖子失败，请重试');
      }
    },
    handleSubmit() {
      this.createNewPost();
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  },
};
</script>

<style scoped>
/* ===== 样式保持原来的代码 ===== */
.community-detail-container {
  width: 80%;
  margin: 30px auto;
  padding: 0 20px;
}

.loading-state {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
}

.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-box {
  background: #fefefe;
  border: 1px solid #ebebeb;
  border-radius: 10px;
  padding: 40px;
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.error-icon {
  font-size: 3rem;
  color: #e74c3c;
  margin-bottom: 10px;
}

.error-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.retry-btn {
  background: #3498db;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s ease;
}

.retry-btn:hover {
  background: #2980b9;
}

.back-home-btn {
  background: #95a5a6;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  transition: 0.2s ease;
}

.back-home-btn:hover {
  background: #7f8c8d;
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.community-header {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.community-header h1 {
  font-size: 2.5rem;
  color: #3498db;
  margin-bottom: 5px;
}

.community-title {
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: bold;
  margin-bottom: 10px;
}

.community-description {
  color: #7f8c8d;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: flex-start;
}

.create-post-btn {
  background: #2ecc71;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}

.create-post-btn:hover {
  background: #27ae60;
}

.posts-list h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 5px;
  margin-bottom: 20px;
}

.no-posts {
  padding: 20px;
  text-align: center;
  font-size: 1rem;
  color: #7f8c8d;
}

.post-card {
  display: flex;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  padding: 15px;
  margin-bottom: 15px;
  transition: transform 0.2s;
  cursor: pointer;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 帖子表单弹窗样式 */
.post-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

.submit-btn {
  background: #2ecc71;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #27ae60;
}

.votes {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 15px;
  color: #7f8c8d;
  font-weight: bold;
}

.post-info h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 5px;
}

.post-meta {
  display: flex;
  gap: 15px;
  color: #7f8c8d;
  font-size: 0.85rem;
  margin-top: 10px;
  flex-wrap: wrap;
}
</style>
