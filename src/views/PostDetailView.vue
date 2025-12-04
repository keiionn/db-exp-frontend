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

      <div class="comments-section">
        <h2>全部评论 ({{ comments.length }})</h2>

        <div v-if="comments.length === 0" class="no-comments">
          <p>还没有评论，快来发表你的看法吧！</p>
        </div>

        <div v-else class="comments-list">
          <CommentItem 
            v-for="comment in comments" 
            :key="comment.id" 
            :comment="comment"
            :is-root="true"
          />
        </div>
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
// 假设帖子详情 API 在 communityApi 中
// import communityApi from '@/api/community'; 
import CommentItem from '@/components/CommentItem.vue'; // 引入新增的评论组件

export default {
  name: 'PostDetailView',
  components: {
    CommentItem
  },
  data() {
    return {
      post: null,
      comments: [], // 新增：用于存储当前帖子的评论
      isLoading: true,
      
      // 帖子模拟数据
      allPosts: [ 
        { id: 101, communityName: 'vue', title: 'Vue 3.5 新功能展望', content: '期待 Composition API 的进一步优化...', upvotes: 450, comments: 20, authorId: 1 },
        { id: 102, communityName: 'tech', title: 'AI 伦理的未来挑战', content: '我们该如何规范大模型的使用？', upvotes: 800, comments: 55, authorId: 2 },
        { id: 103, communityName: 'vue', title: '如何优化 Vue 组件渲染性能？', content: '分享一个 useMemo 替代方案。', upvotes: 320, comments: 12, authorId: 1 },
      ],

      // 评论模拟数据 (针对帖子 id=102)
      commentsList: [
        {
          id: 1,
          author: 'UserA',
          content: '非常赞同！目前社区对 AI 伦理的讨论太少了。',
          upvotes: 45,
          timestamp: '2025-11-27',
          replies: [ // 子评论
            {
              id: 11,
              author: 'UserB',
              content: '是的，特别是关于数据隐私的问题，亟待解决。',
              upvotes: 12,
              timestamp: '2025-11-28',
              replies: [] 
            },
            {
              id: 12,
              author: 'UserD',
              content: '可以参考欧盟的AI法案。',
              upvotes: 5,
              timestamp: '2025-11-28',
              replies: [
                 {
                    id: 121,
                    author: 'UserA',
                    content: '好主意，我去查查！',
                    upvotes: 2,
                    timestamp: '2025-11-29',
                    replies: []
                 }
              ]
            }
          ]
        },
        {
          id: 2,
          author: 'UserC',
          content: '希望未来的模型能有更好的可解释性。',
          upvotes: 20,
          timestamp: '2025-11-28',
          replies: []
        }
      ]
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

      // 模拟 API 调用: 查找本地模拟数据
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟
      const foundPost = this.allPosts.find(p => p.id === postId);

      this.post = foundPost;

      if (this.post) {
          // 无论帖子 ID 是多少，都使用模拟评论数据进行展示和测试
          this.comments = this.commentsList; 
      } else {
          this.comments = [];
      }
      // ----------------------------------------------------

      this.isLoading = false;
    },
  },
};
</script>

<style scoped>
.post-detail-container {
  width: 80%;
  max-width: 900px;
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
    padding: 50px;
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
  margin-bottom: 30px; /* 调整与评论区的间距 */
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

/* 新增评论区样式 */
.comments-section {
  margin-top: 40px;
  padding-top: 20px;
}

.comments-section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 5px;
  margin-bottom: 25px;
}

.no-comments {
  text-align: center;
  padding: 30px;
  color: #7f8c8d;
  background: #f8f8f8;
  border-radius: 8px;
}
</style>