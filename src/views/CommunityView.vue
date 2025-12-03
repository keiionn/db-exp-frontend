<template>
  <div class="community-view-container">
    <div v-if="isLoading" class="loading-state">
      正在加载社区信息...
    </div>

    <div v-else-if="community" class="community-content">
      <div class="community-header">
        <h1>r/{{ community.name }}</h1>
        <p class="community-title">{{ community.title }}</p>
        <p class="community-description">{{ community.description }}</p>

        <div class="header-actions">
          <SubscriptionButton
            :communityName="community.name"
            :initialIsSubscribed="community.isSubscribed"
            :initialSubscriberCount="community.subscribers"
          />
          <router-link :to="`/community/${community.name}/submit`" class="create-post-btn">
            创建帖子
          </router-link>
        </div>
      </div>

      <div class="posts-list">
        <h2>最新帖子</h2>
        <div v-if="posts.length === 0" class="no-posts">
          <p>社区还没有帖子，快来创建第一个吧！</p>
        </div>
        <div v-else>
          <div class="post-card" v-for="post in posts" :key="post.id">
            <div class="votes">
              <i class="fas fa-arrow-up"></i>
              <span>{{ post.upvotes }}</span>
            </div>
            <div class="post-info">
              <h3>{{ post.title }}</h3>
              <p>{{ post.content.substring(0, 100) }}...</p>
              <div class="post-meta">
                <span>💬 {{ post.comments }} 评论</span>
                <router-link :to="`/community/${community.name}/post/${post.id}`">查看详情</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="error-state">
        <p>社区未找到或加载失败。</p>
        <router-link to="/home">返回首页</router-link>
    </div>
  </div>
</template>

<script>
import communityApi from '@/api/community';
import SubscriptionButton from '@/components/SubscriptionButton.vue';

export default {
  name: 'CommunityView',
  components: {
    SubscriptionButton
  },
  data() {
    return {
      community: null,
      posts: [],
      isLoading: true
    };
  },
  computed: {
    communityName() {
      // 从路由参数中获取社区名称
      return this.$route.params.name;
    }
  },
  watch: {
    // 监听路由参数变化，如果社区名改变，重新加载数据
    communityName: {
      immediate: true, // 立即执行一次
      handler() {
        this.fetchCommunityData();
      }
    }
  },
  methods: {
    async fetchCommunityData() {
      this.isLoading = true;
      this.community = null;
      this.posts = [];

      try {
        const response = await communityApi.getCommunityDetails(this.communityName);
        this.community = response.community;
        this.posts = response.posts;
      } catch (error) {
        console.error('获取社区数据失败:', error);
        // 如果失败，可以设置一个标志或保持 community 为 null
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.community-view-container {
  max-width: 900px;
  margin: 30px auto;
  padding: 0 20px;
}

.loading-state, .error-state {
  text-align: center;
  padding: 50px;
}

/* 头部样式 */
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

/* 帖子列表样式 */
.posts-list h2 {
    font-size: 1.5rem;
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 5px;
    margin-bottom: 20px;
}

.post-card {
  display: flex;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  padding: 15px;
  margin-bottom: 15px;
  transition: transform 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.votes {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 15px;
  color: #7f8c8d;
  font-weight: bold;
}

.votes i {
  cursor: pointer;
  padding: 5px;
}

.votes i:hover {
  color: #3498db;
}

.post-info {
  flex-grow: 1;
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
  font-size: 0.9rem;
  margin-top: 10px;
}

.post-meta a {
    color: #3498db;
    text-decoration: none;
}
</style>