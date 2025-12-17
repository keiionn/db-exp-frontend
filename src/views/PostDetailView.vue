<template>
  <div class="post-detail-container">
    <button class="back-home-btn" @click="goHome">返回首页</button>

    <div v-if="isLoading" class="loading-state">正在加载帖子信息...</div>

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
        <span>发布于: {{ formatDate(post.createdAt) }}</span>
      </div>
      <div class="post-body">
        <p>{{ post.description }}</p>
      </div>

      <div class="post-footer">
        <div class="votes">
          <i class="fas fa-arrow-up upvote"></i>
          <span>0</span>
          <i class="fas fa-arrow-down downvote"></i>
        </div>

        <button class="reply-btn" @click="openReplyModal('post', post.postId, post.authorName)">
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
            :currentUserId="currentUserId"
            @reply="openReplyModal"
            @delete="handleDeleteComment"
            @edit="handleEditComment"
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
          <button class="btn primary-btn" @click="submitReply" :disabled="!replyContent.trim() || isSubmitting">
            {{ isSubmitting ? '发送中...' : '确认回复' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content">
            <h3>修改评论</h3>
            <div class="form-group">
                <label for="edit-content">新内容</label>
                <textarea id="edit-content" v-model="editContent" rows="5" placeholder="请输入修改后的评论内容..."></textarea>
            </div>
            <div class="modal-actions">
                <button class="btn cancel" @click="closeEditModal">取消</button>
                <button class="btn primary-btn" @click="submitEdit" :disabled="!editContent.trim() || isSubmitting">
                    {{ isSubmitting ? '保存中...' : '确认修改' }}
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import api, { postsAPI, commentsAPI, usersAPI } from "@/api/index"; 
import CommentItem from '@/components/CommentItem.vue';
import { mapGetters } from 'vuex'; 

const COMMENTS_BY_POST_API = '/comments/post';

export default {
  name: "PostDetailView",

  components: {
    CommentItem
  },

  data() {
    return {
      post: null,
      comments: [],
      commentTree: [], 
      isLoading: true,
      isSubmitting: false,
      
      // 回复状态
      showReplyModal: false,
      targetType: '',       // 'post' 或 'comment'
      targetId: null,       // 帖子ID 或 评论ID
      targetAuthor: '',     // 被回复的作者名称
      replyContent: '',

      // 编辑状态
      showEditModal: false,
      editContent: '',
      editingCommentId: null, // 当前正在编辑的评论 ID
    };
  },

  created() {
    this.fetchPostDetail();
  },

  computed: {
    ...mapGetters(['getUserId']), 
    currentUserId() {
        // 确保从 Store 获取的 ID 是数字类型，用于严格比较
        const id = this.getUserId;
        return id ? parseInt(id, 10) : null; 
    },
    
    replyModalTitle() {
      if (!this.post) return '发表回复';
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
      const postId = this.$route.params.id;
      
      try {
        // 1. 获取帖子详情
        const postResponse = await postsAPI.getPost(postId);
        const postData = postResponse.data;

        // 2. 获取评论列表
        const commentsResponse = await api.get(`${COMMENTS_BY_POST_API}/${postId}`);
        let commentsData = commentsResponse.data || [];
        
        // 3. 批量获取作者用户名 (简化处理)
        const userIds = new Set([postData.userId, ...commentsData.map(c => c.userId)].filter(id => id !== undefined && id !== null));

        const userPromises = Array.from(userIds).map(id => 
            usersAPI.getUser(id) 
               .then(res => ({ userId: id, username: res.data.username || '未知用户' }))
               .catch(() => ({ userId: id, username: '未知用户' }))
        );
        const users = await Promise.all(userPromises);
        const userMap = new Map(users.map(u => [u.userId, u.username]));

        // 4. 映射帖子数据
        this.post = {
            postId: postData.postId,
            communityId: postData.communityId,
            title: postData.postTitle, 
            description: postData.postContent, 
            createdAt: postData.createdAt,
            authorName: userMap.get(postData.userId) || '未知用户',
            userId: postData.userId, // 关键：帖子作者 ID
        };

        // 5. 映射评论数据
        this.comments = commentsData.map(c => ({
            commentId: c.commentId,
            content: c.content,
            userId: c.userId, // 关键：评论作者 ID
            postId: c.postId,
            parentCommentId: c.parentCommentId, 
            createdAt: c.createdAt,
            authorName: userMap.get(c.userId) || '未知用户',
        }));

        this.buildCommentTree();

      } catch (error) {
        console.error("加载失败:", error);
        this.post = null;
        this.comments = [];
        this.commentTree = [];
      } finally {
        this.isLoading = false;
      }
    },

    buildCommentTree() {
      const commentMap = {};
      this.comments.forEach(comment => {
        commentMap[comment.commentId] = { ...comment, replies: [] };
      });

      const tree = [];
      this.comments.forEach(comment => {
        if (comment.parentCommentId === null || comment.parentCommentId === 0) {
          tree.push(commentMap[comment.commentId]);
        } else {
          const parent = commentMap[comment.parentCommentId];
          if (parent) {
            parent.replies.push(commentMap[comment.commentId]);
          } else {
            tree.push(commentMap[comment.commentId]);
          }
        }
      });

      this.commentTree = tree;
    },

    // --- 回复逻辑 ---
    openReplyModal(type, id, authorName = '') {
      this.targetType = type;
      this.targetId = id;
      this.targetAuthor = authorName;
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

      let payload = {
        postId: this.post.postId,
        content: content,
        // 回复帖子时 parentCommentId 为 null
        parentCommentId: this.targetType === "comment" ? this.targetId : null
      };
      
      try {
        await commentsAPI.createComment(payload);
        alert("回复成功！");
        this.closeReplyModal();
        await this.fetchPostDetail();
      } catch (error) {
        console.error("回复失败:", error);
        let errorMessage = "回复失败：请检查是否登录或输入是否符合要求。";
        if (error.response?.status === 401) {
              errorMessage = '回复需要登录。请先登录您的账户！';
        } else if (error.response?.data?.message) {
              errorMessage = `回复失败: ${error.response.data.message}`;
        }
        alert(errorMessage);
      } finally {
        this.isSubmitting = false;
      }
    },
    
    // --- 删除逻辑 ---
    handleDeleteComment(commentId) {
      if (confirm(`确定要删除此评论 (ID: ${commentId}) 及其所有回复吗？此操作不可逆！`)) {
        this.deleteComment(commentId);
      }
    },

    async deleteComment(commentId) {
      try {
        await commentsAPI.deleteComment(commentId);
        alert("评论删除成功！");
        await this.fetchPostDetail();
      } catch (error) {
        console.error("删除评论失败:", error);
        let errorMessage = "删除评论失败：请检查您是否拥有权限或评论是否已被删除。";
        if (error.response?.status === 401) {
             errorMessage = '删除操作需要登录。请先登录您的账户！';
        } else if (error.response?.status === 403) {
             errorMessage = '您没有权限删除此评论（非作者或管理员）。';
        } else if (error.response?.data?.message) {
             errorMessage = `删除失败: ${error.response.data.message}`;
        }
        alert(errorMessage);
      }
    },

    // --- 修改逻辑 ---
    handleEditComment(commentId, content) {
      this.editingCommentId = commentId;
      this.editContent = content; // 填充当前内容
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.editContent = '';
      this.editingCommentId = null;
    },
    
    async submitEdit() {
      const content = this.editContent.trim();
      const commentId = this.editingCommentId;
      
      if (!content || !commentId) return alert("评论内容或ID无效。");
      
      // 简单检查内容是否修改，如果找到原评论
      const originalComment = this.comments.find(c => c.commentId === commentId);
      if (originalComment && content === originalComment.content) {
          return alert("评论内容没有改变。");
      }

      this.isSubmitting = true;

      try {
        // 调用修改 API
        await commentsAPI.updateComment(commentId, content);

        alert("评论修改成功！");
        this.closeEditModal();
        await this.fetchPostDetail();
      } catch (error) {
        console.error("修改评论失败:", error);
        let errorMessage = "修改评论失败：请检查是否登录或权限。";
        if (error.response?.status === 401) {
              errorMessage = '修改操作需要登录。请先登录您的账户！';
        } else if (error.response?.status === 403) {
             errorMessage = '您没有权限修改此评论（非作者）。';
        } else if (error.response?.data?.message) {
              errorMessage = `修改失败: ${error.response.data.message}`;
        }
        alert(errorMessage);
      } finally {
        this.isSubmitting = false;
      }
    },

    formatDate(timestamp) {
        if (!timestamp) return '未知时间';
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
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

.loading-state,
.error-state {
  text-align: center;
  padding: 50px;
  font-size: 1.1rem;
  color: #7f8c8d;
}

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

.post-body {
  font-size: 1rem;
  line-height: 1.7;
  color: #2c3e50;
  margin-bottom: 25px;
}

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

/* ===== 弹窗 (回复 & 编辑) ===== */
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

.modal-content h3 {
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