<template>
  <div>
    <div class="comment-item" :style="{ marginLeft: depth * 30 + 'px' }">
      <div class="comment-header">
        <p class="comment-author">
          {{ comment.authorName || "匿名用户" }}
        </p>
        <small class="comment-time">时间：{{ comment.time }}</small>
      </div>
      
      <p class="comment-text">{{ comment.content }}</p>

      <div class="comment-actions">
        <button @click="$emit('like', comment.commentId)">
          👍 点赞 {{ comment.upvote || 0 }}
        </button>
        <button @click="$emit('reply', 'comment', comment.commentId, comment.authorName)">
          💬 回复
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
        @like="$emit('like', $event)"
        @reply="$emit('reply', $event)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentItem',
  props: {
    comment: Object,
    depth: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>
.comment-item {
  margin-bottom: 20px;
}

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
  margin-right: 10px;
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #f0f3f7;
  color: #555;
  border: 1px solid #e0e0e0;
}

.comment-actions button:hover {
  background: #e2e2e2;
}
</style>