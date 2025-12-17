<template>
  <div class="post-card">
    <div class="votes" @click.stop>
      <i class="fas fa-arrow-up"></i>
      <span>0</span>
    </div>
    
    <div class="post-info" @click="$emit('goToPost', post.postId)">
      <h3>{{ post.title }}</h3>
      <p>{{ post.description.substring(0, 100) }}...</p>
      <div class="post-meta">
        <span>作者: {{ post.authorName || post.userId }}</span>
        <span>查看详情</span>
      </div>
    </div>
    
    <div class="post-actions" @click.stop>
      <button 
        v-if="currentUserId === post.userId"
        class="edit-post-btn" 
        @click="$emit('editPost', post)"
      >
        ✏️ 修改
      </button>
      
      <button 
        v-if="currentUserId === post.userId"
        class="delete-post-btn" 
        @click="$emit('deletePost', post.postId, post.title)"
      >
        🗑️ 删除
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "PostListItem",
  props: {
    post: {
      type: Object,
      required: true,
      // 必须包含 postId, title, description, userId, authorName
    },
    currentUserId: {
      type: Number,
      default: null,
    },
  },
  emits: ['goToPost', 'editPost', 'deletePost'],
};
</script>

<style scoped>
/* 样式将从 CommunityDetailView.vue 中剪切过来 */
.post-card {
  display: flex;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  padding: 15px;
  margin-bottom: 15px;
  transition: transform 0.2s;
  cursor: pointer;
  justify-content: space-between; 
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

.post-info {
  flex-grow: 1; 
  cursor: pointer; 
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

.post-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; 
  margin-left: 15px;
}

.edit-post-btn {
    background: #3498db;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
    white-space: nowrap; 
}

.edit-post-btn:hover {
    background: #2980b9;
}

.delete-post-btn {
  background: #e74c3c;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
  white-space: nowrap; 
}

.delete-post-btn:hover {
  background: #c0392b;
}
</style>