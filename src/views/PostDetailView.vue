<template>
  <div class="post-detail-container">
    <button class="back-home-btn" @click="goHome">返回首页</button>

    <div v-if="isLoading" class="loading-state">
      正在加载帖子信息...
    </div>

    <div v-else-if="post" class="post-content-card">

      <p class="community-link">
        <router-link :to="`/community/${post.community}`">
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
          <div
            v-for="comment in comments"
            :key="comment.commentId"
            class="comment-item"
          >
            <div class="comment-header">
              <p class="comment-author">
                {{ comment.authorName || "匿名用户" }}
              </p>
              <small class="comment-time">时间：{{ comment.time }}</small>
            </div>
            

            <p class="comment-text">{{ comment.content }}</p>

            <div class="comment-actions">
              <button @click="likeComment(comment.commentId)">
                👍 点赞 {{ comment.upvote || 0 }}
              </button>
              <button @click="openReplyModal('comment', comment.commentId, comment.authorName)">
                💬 回复
              </button>
            </div>

            <hr />
          </div>
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
                <textarea 
                    id="reply-content"
                    v-model="replyContent"
                    rows="5" 
                    placeholder="请输入您的回复..."
                ></textarea>
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

export default {
  name: "PostDetailView",

  data() {
    return {
      post: null,
      comments: [],
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

    // ... (fetchPostDetail 保持不变) ...
    async fetchPostDetail() {
      this.isLoading = true;
      const id = this.$route.params.id;
      try {
        const res = await api.get(`/api/posts/${id}`);
        this.post = res.data.post;
        // 确保 comments 字段存在且是数组
        this.comments = res.data.comments || []; 
      } catch (error) {
        console.error("加载失败:", error);
        this.post = null;
        this.comments = [];
      }
      this.isLoading = false;
    },


    // --- 弹窗逻辑 ---
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

    // --- 提交回复逻辑 ---
    async submitReply() {
      const content = this.replyContent.trim();
      if (!content) return alert("回复内容不能为空");

      this.isSubmitting = true;

      // 准备发送到后端的数据
      let payload = {
        content: content,
        authorId: 'CURRENT_USER_ID', // 替换为真实的当前用户ID
        postId: this.post.postId,
      };

      if (this.targetType === 'comment') {
        // 如果是回复评论，需要传入被回复的评论ID
        payload.parentCommentId = this.targetId;
      }

      try {
        // 根据目标类型选择 API 接口 (假设你的后端是这样设计的)
        const endpoint = this.targetType === 'post' 
                         ? '/api/comments/add' 
                         : '/api/comments/reply'; 
                         
        await api.post(endpoint, payload);
        
        alert("回复成功！");
        this.closeReplyModal();
        
        // 刷新评论列表 (简单粗暴，生产环境建议局部更新)
        await this.fetchPostDetail(); 

      } catch (error) {
        alert("回复失败：" + (error.response?.data?.message || '网络错误'));
      } finally {
        this.isSubmitting = false;
      }
    },
    
    // --- 其他操作保持不变 ---
    likeComment(commentId) {
      // 实际应调用 API 更新点赞数
      alert("点赞评论：" + commentId);
    }
  },
};
</script>



<style scoped>
.back-home-btn {
  margin-bottom: 15px;
  background: #3498db;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

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
.back-home-btn {
  margin-bottom: 15px;
  background: #3498db;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.reply-btn {
  background: #2ecc71;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.reply-btn:hover {
  opacity: 0.9;
}

.comment-item {
  margin-bottom: 20px;
}

.comment-actions button {
  margin-right: 10px;
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #f0f0f0;
}

.comment-actions button:hover {
  background: #e2e2e2;
}


/* 优化：社区返回链接 */
.community-link a {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9em;
  margin-bottom: 20px;
  display: inline-block;
}
.community-link i {
  margin-right: 5px;
}

/* 优化：主贴作者加粗 */
.post-meta-top span:first-child {
    font-weight: bold;
    color: #34495e;
}

/* 优化：回复按钮颜色 */
.reply-btn {
  background: #3498db; /* 使用蓝色更协调 */
  border: none;
  color: white;
  padding: 8px 15px; /* 稍微大一点 */
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.reply-btn:hover {
  background: #2980b9;
}

/* 优化：评论头部样式 */
.comment-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 5px;
}

.comment-author {
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.comment-time {
  color: #95a5a6;
  font-size: 0.8em;
}

.comment-text {
  line-height: 1.5;
  margin: 8px 0;
}

.comment-actions button {
  /* 优化按钮风格 */
  background: #f0f3f7;
  color: #555;
  border: 1px solid #e0e0e0;
}

.comment-actions button:hover {
  background: #e2e2e2;
}

/* ================= 新增 CSS：回复弹窗样式 ================= */

/* 遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5); 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 弹窗主体 */
.modal-content {
  background: white;
  padding: 25px;
  border-radius: 10px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

/* 表单组 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 0.9em;
  color: #555;
}

/* 文本域样式 */
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box; 
  outline: none;
  font-size: 1.0em;
  resize: vertical; /* 允许垂直拖动大小 */
}

/* 底部按钮区域 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn.primary-btn {
  background: #3498db;
  color: white;
  padding: 10px 15px;
}
.btn.primary-btn:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
}

.btn.cancel {
  background: #ecf0f1;
  color: #34495e;
  border: 1px solid #ccc;
  padding: 10px 15px;
}

</style>