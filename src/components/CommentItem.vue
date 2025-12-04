<template>
  <div :class="['comment-item', { 'is-root': isRoot }]">
    <div class="comment-header">
      <span class="comment-author">{{ comment.author }}</span>
      <span class="comment-time">{{ comment.timestamp }}</span>
    </div>

    <div class="comment-body">
      <p>{{ comment.content }}</p>
    </div>

    <div class="comment-actions">
      <div class="votes">
        <i class="fas fa-arrow-up vote-icon upvote-btn"></i>
        <span>{{ comment.upvotes }}</span>
        <i class="fas fa-arrow-down vote-icon downvote-btn"></i>
      </div>
      <button class="reply-btn">回复</button>
    </div>

    <div v-if="comment.replies && comment.replies.length" class="comment-replies">
      <CommentItem 
        v-for="reply in comment.replies" 
        :key="reply.id" 
        :comment="reply"
        :is-root="false" 
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentItem', // 必须有 name 属性才能实现递归
  props: {
    comment: {
      type: Object,
      required: true
    },
    isRoot: {
      type: Boolean,
      default: false
    }
  },
  // Vue 2/3 Options API 中，只要模板中引用了自身组件名，即可实现递归。
};
</script>

<style scoped>
.comment-item {
  border-left: 3px solid #eee;
  padding: 15px 0 15px 20px;
  margin-top: 10px;
  transition: border-left-color 0.3s;
}

.comment-item:hover {
  border-left-color: #3498db;
}

.comment-item.is-root {
  border-left: none; /* 根评论不需要左侧竖线 */
  padding-left: 0;
  margin-bottom: 25px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: bold;
  color: #3498db;
  margin-right: 10px;
  font-size: 0.95rem;
}

.comment-time {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.comment-body p {
  margin: 5px 0;
  line-height: 1.5;
  color: #34495e;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-top: 5px;
}

.votes {
  display: flex;
  align-items: center;
  gap: 5px;
}

.vote-icon {
  cursor: pointer;
}

.upvote-btn:hover {
  color: #e74c3c;
}

.downvote-btn:hover {
  color: #3498db;
}

.reply-btn {
  background: none;
  border: none;
  color: #2ecc71;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

/* 嵌套回复的缩进 */
.comment-replies {
  margin-left: 30px; 
  margin-top: 5px;
  border-radius: 4px;
}
</style>