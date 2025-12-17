<template>
  <div>
    <div class="comment-item" :style="{ marginLeft: depth * 30 + 'px' }">
      <div class="comment-header">
        <p class="comment-author">
          {{ comment.authorName || "匿名用户" }}
        </p>
        <small class="comment-time" v-if="comment.createdAt">
          时间：{{ formatDate(comment.createdAt) }}
        </small>
      </div>

      <p class="comment-text">{{ comment.content }}</p>

      <div class="comment-actions">
        <button @click="$emit('reply', 'comment', comment.commentId, comment.authorName)">
          💬 回复
        </button>
        
        <button v-if="currentUserId === comment.userId" class="edit-btn"
          @click.stop="$emit('edit', comment.commentId, comment.content)">
          ✏️ 修改
        </button>
        
        <button v-if="currentUserId === comment.userId" class="delete-btn"
          @click.stop="$emit('delete', comment.commentId)">
          🗑️ 删除
        </button>
      </div>

      <hr />
    </div>

    <div v-if="comment.replies && comment.replies.length">
      <comment-item 
        v-for="reply in comment.replies" 
        :key="reply.commentId" 
        :comment="reply" 
        :depth="depth + 1"
        :currentUserId="currentUserId" 
        
        @reply="onRecursiveReply" 
        @edit="onRecursiveEdit"
        @delete="onRecursiveDelete" 
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentItem',
  // 显式声明 emits，便于维护和 Vue3 警告消除
  emits: ['reply', 'delete', 'edit'],
  props: {
    comment: Object,
    depth: {
      type: Number,
      default: 0
    },
    currentUserId: {
      type: [Number, String, null],
      default: null
    }
  },
  methods: {
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    // --- 核心修复：递归事件中转方法 ---
    
    // 接收子组件传上来的 (type, id, name)，完整地继续向上抛
    onRecursiveReply(type, id, name) {
      this.$emit('reply', type, id, name);
    },
    
    // 接收子组件传上来的 (id, content)
    onRecursiveEdit(id, content) {
      this.$emit('edit', id, content);
    },

    // 接收子组件传上来的 (id)
    onRecursiveDelete(id) {
      this.$emit('delete', id);
    }
  }
}
</script>

<style scoped>
/* 保持你的原有样式不变 */
.comment-actions .edit-btn {
  background: #f39c12;
  color: white;
  border: 1px solid #d35400;
}

.comment-actions .edit-btn:hover {
  background: #d35400;
}

.comment-item {
  margin-top: 15px;
  padding: 10px;
  border-left: 3px solid #eee;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.comment-author {
  font-weight: bold;
  color: #3498db;
  margin: 0;
  font-size: 0.9rem;
}

.comment-time {
  color: #95a5a6;
  font-size: 0.8rem;
}

.comment-text {
  margin: 5px 0 10px 0;
  font-size: 1rem;
  line-height: 1.5;
}

.comment-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
}

.comment-actions button {
  background: #f1f1f1;
  color: #7f8c8d;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  transition: 0.2s;
}

.comment-actions button:hover {
  background: #e0e0e0;
}

hr {
  border: none;
  border-top: 1px dashed #eee;
  margin-top: 10px;
}

.comment-actions .delete-btn {
  background: #e74c3c;
  color: white;
  border: 1px solid #c0392b;
}

.comment-actions .delete-btn:hover {
  background: #c0392b;
}
</style>