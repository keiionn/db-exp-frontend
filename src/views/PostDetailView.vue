<template>
  <div class="post-detail-container">
    <button class="back-home-btn" @click="goHome">返回首页</button>

    <div v-if="isLoading" class="loading-state">
      正在加载帖子信息...
    </div>

    <div v-else-if="post" class="post-content-card">

      <p class="community-link">
        <router-link :to="`/communities/${post.communityId}`">
          <i class="fas fa-chevron-left"></i> 返回社区
        </router-link>
      </p>

      <h1>{{ post.title }}</h1>

      <div class="post-meta-top">
        <span>作者: {{ post.authorName }}</span>
        <span>•</span>
        <span>发布于: Mock 时间</span>
      </div>

      <div class="post-body">
        <p>{{ post.description }}</p>
      </div>

      <div class="post-footer">
        <div class="votes">
          <i class="fas fa-arrow-up upvote"></i>
          <span>{{ post.upvokes }}</span>
          <i class="fas fa-arrow-down downvote"></i>
        </div>

        <button class="reply-btn" @click="openReplyModal('post', post.postId)">
          💬 回复帖子
        </button>

        <span class="comments">💬 {{ comments.length }} 评论</span>
      </div>

      <div class="comments-section">
        <h2>全部评论 ({{ comments.length }})</h2>

        <div v-if="comments.length === 0" class="no-comments">
          <p>还没有评论，快来发表你的看法吧！</p>
        </div>

        <div v-else class="comments-list">
          <comment-item
            v-for="comment in commentTree"
            :key="comment.commentId"
            :comment="comment"
            :depth="0"
            @like="likeComment"
            @reply="openReplyModal"
          />
        </div>
      </div>
    </div>

    <div v-else class="error-state">
      <p>帖子未找到或加载失败。</p>
      <router-link to="/home">返回主页</router-link>
    </div>

    <div v-if="showReplyModal" class="modal-overlay" @click.self="closeReplyModal">
      <div class="modal-content">
        <h3>{{ replyModalTitle }}</h3>

        <div class="form-group">
          <label for="reply-content">回复内容</label>
          <textarea id="reply-content" v-model="replyContent" rows="5" placeholder="请输入您的回复..."></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn cancel" @click="closeReplyModal">取消</button>
          <button class="btn primary-btn" @click="submitReply" :disabled="!replyContent.trim()">
            {{ isSubmitting ? '发送中...' : '确认回复' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import CommentItem from '@/components/CommentItem.vue';

export default {
  name: "PostDetailView",

  components: {
    CommentItem
  },

  data() {
    return {
      post: null,
      comments: [],
      commentTree: [], // 树形结构的评论
      isLoading: true,
      
      // --- 新增：回复弹窗状态 ---
      showReplyModal: false,
      isSubmitting: false,
      
      // 回复目标信息
      targetType: '',       // 'post' 或 'comment'
      targetId: null,       // 帖子ID 或 评论ID
      targetAuthor: '',     // 被回复的作者名称（用于显示在标题中）
      
      // 回复内容
      replyContent: ''
    };
  },

  created() {
    this.fetchPostDetail();
  },

  computed: {
    replyModalTitle() {
      if (this.targetType === 'post') {
        return `回复帖子：${this.post.title.substring(0, 15)}...`;
      } else if (this.targetType === 'comment') {
        return `回复评论：给 ${this.targetAuthor}`;
      }
      return '发表回复';
    }
  },

  methods: {
    goHome() {
      this.$router.push("/home");
    },

    async fetchPostDetail() {
      this.isLoading = true;
      const id = this.$route.params.id;
      try {
        const res = await api.get(`/api/posts/${id}`);
        this.post = res.data.post;
        this.comments = res.data.comments || [];

        // 为每个评论获取点赞数
        const upvotePromises = this.comments.map(comment => 
          api.get(`/api/upvokes/count/${comment.commentId}`)
            .then(res => {
              comment.upvote = res.data.count; // 将点赞数赋值给评论的upvote属性
            })
            .catch(error => {
              console.error(`获取评论${comment.commentId}点赞数失败:`, error);
              comment.upvote = 0; // 失败时设为0
            })
        );

        await Promise.all(upvotePromises);

        // 构建评论树
        this.buildCommentTree();

      } catch (error) {
        console.error("加载失败:", error);
        this.post = null;
        this.comments = [];
        this.commentTree = [];
      }
      this.isLoading = false;
    },

    buildCommentTree() {
      // 创建评论映射
      const commentMap = {};
      this.comments.forEach(comment => {
        commentMap[comment.commentId] = { ...comment, replies: [] };
      });

      // 构建树
      const tree = [];
      this.comments.forEach(comment => {
        if (comment.fatherId === 0) {
          tree.push(commentMap[comment.commentId]);
        } else {
          const parent = commentMap[comment.fatherId];
          if (parent) {
            parent.replies.push(commentMap[comment.commentId]);
          } else {
            // 如果父评论不存在，则作为顶级评论
            tree.push(commentMap[comment.commentId]);
          }
        }
      });

      this.commentTree = tree;
    },

    openReplyModal(type, id, authorName = '') {
      // 1. 设置目标
      this.targetType = type;
      this.targetId = id;
      this.targetAuthor = authorName;

      // 2. 重置内容并显示弹窗
      this.replyContent = '';
      this.showReplyModal = true;
    },

    closeReplyModal() {
      this.showReplyModal = false;
    },

    async submitReply() {
  const content = this.replyContent.trim();
  if (!content) return alert("回复内容不能为空");

  this.isSubmitting = true;

  const user = this.$store.state.user;
  if (!user || !user.userId) {
    alert("请先登录");
    this.isSubmitting = false;
    return;
  }

  const authorId = user.userId;

  let payload;
  let endpoint;

  if (this.targetType === "post") {
    // 回复帖子
    endpoint = "/api/comments/createNewCommentOnPost";
    payload = {
      postId: this.post.postId,
      content,
      authorId
    };
  } else if (this.targetType === "comment") {
    // 回复评论
    endpoint = "/api/comments/createNewCommentOnComment";
    payload = {
      fatherId: this.targetId,
      postId: this.post.postId,
      content,
      authorId
    };
  }

  try {
    await api.post(endpoint, payload);

    alert("回复成功！");
    this.closeReplyModal();

    // 刷新评论
    await this.fetchPostDetail();
  } catch (error) {
    console.error("回复失败:", error);
    alert("回复失败：" + (error.response?.data?.message || "网络错误"));
  } finally {
    this.isSubmitting = false;
  }
},

    async likeComment(commentId) {
      try {
        const user = this.$store.state.user;

        if (!user || !user.userId) {
          alert("请先登录");
          return;
        }

        const userId = user.userId;   // ⭐ 正确字段

        const response = await api.post('/api/upvokes/upvoke', {
          commentId,
          userId
        });

        if (response.data.success) {
          const comment = this.comments.find(c => c.commentId === commentId);
          if (comment) {
            comment.upvote = (comment.upvote || 0) + 1;
          }
        } else {
          alert(response.data.detail || "点赞失败");
        }
      } catch (error) {
        console.error("点赞失败:", error);
        alert(error.response?.data?.detail || "点赞失败，请重试");
      }
    }
  },
};
</script>

<style scoped>
.post-detail-container {
  width: 80%;
  margin: 30px auto;
  padding: 0 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.back-home-btn {
  background: #95a5a6;
  color: white;
  padding: 8px 16px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: 0.2s ease;
  margin-bottom: 20px;
}

.back-home-btn:hover {
  background: #7f8c8d;
}

/* 加载状态 & 错误状态保持一致 */
.loading-state,
.error-state {
  text-align: center;
  padding: 50px;
  font-size: 1.1rem;
  color: #7f8c8d;
}

/* ===== 详情卡片 ===== */
.post-content-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
  animation: fadeIn 0.4s ease-out;
}

.community-link {
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.community-link a {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
}
.community-link a:hover {
  text-decoration: underline;
}

.post-content-card h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.post-meta-top {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

/* ===== 正文内容 ===== */
.post-body {
  font-size: 1rem;
  line-height: 1.7;
  color: #2c3e50;
  margin-bottom: 25px;
}

/* ===== 底部：点赞 / 评论按钮 ===== */
.post-footer {
  display: flex;
  align-items: center;
  gap: 25px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.votes {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #7f8c8d;
  font-weight: bold;
  cursor: pointer;
}

.upvote,
.downvote {
  font-size: 1.3rem;
  cursor: pointer;
}
.upvote:hover {
  color: #e67e22;
}
.downvote:hover {
  color: #3498db;
}

.reply-btn {
  background: #2ecc71;
  color: white;
  padding: 8px 16px;
  border-radius: 5px;
  border: none;
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.2s ease;
}

.reply-btn:hover {
  background: #27ae60;
}

.comments {
  margin-left: auto;
  color: #7f8c8d;
  font-size: 0.95rem;
}

/* ===== 评论区 ===== */
.comments-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.no-comments {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
}

/* ===== 评论弹窗（与发帖弹窗保持相同风格） ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.4s ease-out;
}

.modal-content h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.form-group {
  margin-top: 15px;
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

textarea {
  width: 100%;
  padding: 12px;
  border-radius: 5px;
  border: 1px solid #ddd;
  resize: vertical;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.btn.cancel {
  background: #95a5a6;
  color: white;
}
.btn.cancel:hover {
  background: #7f8c8d;
}

.primary-btn {
  background: #3498db;
  color: white;
}
.primary-btn:hover {
  background: #2980b9;
}

/* ===== 动画 ===== */
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
</style>