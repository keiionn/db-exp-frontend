<template>
  <div class="community-detail-container">
    <div v-if="isLoading" class="loading-state">
      正在加载社区信息...
    </div>

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

    <div v-else-if="community" class="community-content">
      <div class="community-header">
        <h1>社区: {{ community.name }}</h1>
        <p class="community-description">{{ community.description }}</p>

        <div class="header-actions">
          <button v-if="currentUserId === community.ownerId" class="edit-description-btn"
            @click="openEditDescriptionModal">
            ✏️ 修改描述
          </button>

          <button class="create-post-btn" @click="showPostForm = true">
            创建帖子
          </button>
          <router-link to="/home" class="back-home-btn">
            返回首页
          </router-link>
        </div>
      </div>

      <div v-if="showPostForm" class="post-form-modal" @click.self="showPostForm = false">
        <div class="modal-content">
          <h2>创建新帖子到 {{ community.name }}</h2>
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="post-title">标题</label>
              <input type="text" id="post-title" v-model="newPost.title" placeholder="输入帖子标题" required />
            </div>
            <div class="form-group">
              <label for="post-content">内容</label>
              <textarea id="post-content" v-model="newPost.content" placeholder="输入帖子内容" rows="5" required></textarea>
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

      <div v-if="showEditDescriptionModal" class="post-form-modal" @click.self="closeEditDescriptionModal">
        <div class="modal-content">
          <h2>修改 {{ community.name }} 社区描述</h2>
          <form @submit.prevent="submitEditDescription">
            <div class="form-group">
              <label for="new-description">新描述</label>
              <textarea id="new-description" v-model="newDescriptionContent" rows="5" required></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeEditDescriptionModal">
                取消
              </button>
              <button type="submit" class="submit-btn">
                保存修改
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="showEditPostModal" class="post-form-modal" @click.self="closeEditPostModal">
        <div class="modal-content">
          <h2>修改帖子</h2>
          <form @submit.prevent="submitEditPost">
            <div class="form-group">
              <label for="edit-post-title">新标题</label>
              <input type="text" id="edit-post-title" v-model="editingPost.title" placeholder="输入帖子新标题" required />
            </div>
            <div class="form-group">
              <label for="edit-post-content">新内容</label>
              <textarea id="edit-post-content" v-model="editingPost.content" placeholder="输入帖子新内容" rows="5"
                required></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeEditPostModal">
                取消
              </button>
              <button type="submit" class="submit-btn">
                保存修改
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
          <post-list-item v-for="post in posts" :key="post.postId" :post="post" :currentUserId="currentUserId"
            @goToPost="goToPost" @deletePost="handleDeletePost" @editPost="openEditPostModal" />
        </div>
      </div>
    </div>

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
import { communitiesAPI, postsAPI, usersAPI } from "@/api/index";
import { mapGetters } from 'vuex';
import PostListItem from '@/components/PostListItem.vue';

export default {
  name: "CommunityDetailView",
  components: {
    PostListItem
  },
  data() {
    return {
      isLoading: true,
      error: false,
      community: null,
      posts: [],
      showPostForm: false,
      newPost: {
        title: '',
        content: ''
      },
      showEditDescriptionModal: false,
      newDescriptionContent: '',
      // 帖子编辑状态
      showEditPostModal: false,
      editingPost: {
        postId: null,
        title: '',
        content: '',
        originalTitle: '',
        originalContent: '',
      },
    };
  },
  computed: {
    ...mapGetters(['getUserId']),
    currentUserId() {
      const id = this.getUserId;
      return id ? parseInt(id, 10) : null;
    }
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
  methods: {
    async fetchCommunityData() {
      this.isLoading = true;
      this.error = false;
      this.community = null;
      this.posts = [];

      try {
        const communityId = this.$route.params.id;

        // --- 1. 获取社区详情 ---
        const communityResponse = await api.get(`communities/${communityId}`);
        this.community = {
          ...communityResponse.data,
          ownerId: communityResponse.data.ownerId || null
        };

        // --- 2. 获取社区帖子列表 ---
        const postsResponse = await api.get(`communities/${communityId}/posts`);
        const postsData = postsResponse.data;

        // --- 3. 批量获取作者用户名 ---
        const userIds = new Set(postsData.map(p => p.userId).filter(id => id !== undefined && id !== null));

        const userPromises = Array.from(userIds).map(id =>
          usersAPI.getUser(id)
            .then(res => ({ userId: id, username: res.data.username || '未知用户' }))
            .catch(() => ({ userId: id, username: '未知用户' }))
        );
        const users = await Promise.all(userPromises);
        const userMap = new Map(users.map(u => [u.userId, u.username]));

        // 4. 映射帖子数据并添加作者姓名
        this.posts = postsData.map(p => ({
          postId: p.postId,
          userId: p.userId,
          communityId: p.communityId,
          title: p.postTitle,
          description: p.postContent,
          createdAt: p.createdAt,
          authorName: userMap.get(p.userId) || '未知用户'
        }));

        this.newDescriptionContent = this.community.description;

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

    // --- 创建帖子逻辑 ---
    async createNewPost() {
      try {
        const communityId = parseInt(this.$route.params.id);
        const response = await postsAPI.createPost({
          communityId: communityId,
          postTitle: this.newPost.title,
          postContent: this.newPost.content,
        });

        this.showPostForm = false;
        this.newPost = { title: '', content: '' };

        if (response.data && response.data.postId) {
          alert(`帖子创建成功!`);
          await this.fetchCommunityData();
          this.$router.push(`/posts/${response.data.postId}`);
        } else {
          alert(`帖子创建成功，但未能获取新帖子ID。`);
          await this.fetchCommunityData();
        }
      } catch (error) {
        console.error('创建帖子失败:', error);
        let errorMessage = '创建帖子失败，请检查是否登录或输入是否符合要求。';
        if (error.response?.status === 401) {
          errorMessage = '创建帖子需要登录。请先登录您的账户！';
        } else if (error.response?.data?.message) {
          errorMessage = `创建帖子失败: ${error.response.data.message}`;
        }
        alert(errorMessage);
      }
    },
    handleSubmit() {
      this.createNewPost();
    },

    // --- 删除帖子逻辑 ---
    handleDeletePost(postId, postTitle) {
      if (confirm(`确定要删除帖子 "${postTitle}" 吗？此操作不可逆！`)) {
        this.deletePost(postId);
      }
    },
    async deletePost(postId) {
      try {
        await postsAPI.deletePost(postId);
        alert("帖子删除成功!");
        await this.fetchCommunityData();
      } catch (error) {
        console.error('删除帖子失败:', error);
        let errorMessage = '删除帖子失败，请检查是否是帖子作者或拥有管理员权限。';
        if (error.response?.status === 401) {
          errorMessage = '删除帖子需要登录。';
        } else if (error.response?.status === 403) {
          errorMessage = '您没有权限删除此帖子。';
        }
        alert(errorMessage);
      }
    },

    // --- 修改社区描述逻辑 ---
    openEditDescriptionModal() {
      this.newDescriptionContent = this.community.description;
      this.showEditDescriptionModal = true;
    },
    closeEditDescriptionModal() {
      this.showEditDescriptionModal = false;
    },
    async submitEditDescription() {
      const communityId = parseInt(this.$route.params.id);
      const newDescription = this.newDescriptionContent.trim();

      if (newDescription === this.community.description) {
        return alert("描述内容没有变化。");
      }

      try {
        await communitiesAPI.updateDescription(communityId, newDescription);
        alert("社区描述修改成功!");
        this.closeEditDescriptionModal();
        await this.fetchCommunityData();
      } catch (error) {
        console.error('修改描述失败:', error);
        let errorMessage = '修改描述失败，请检查是否是社区创建者或拥有管理员权限。';
        if (error.response?.status === 401) {
          errorMessage = '修改描述需要登录。';
        } else if (error.response?.status === 403) {
          errorMessage = '您没有权限修改此社区描述。';
        }
        alert(errorMessage);
      }
    },

    // --- 修改帖子逻辑 ---
    openEditPostModal(post) {
      this.editingPost.postId = post.postId;
      this.editingPost.title = post.title;
      this.editingPost.content = post.description;
      this.editingPost.originalTitle = post.title;
      this.editingPost.originalContent = post.description;
      this.showEditPostModal = true;
    },

    closeEditPostModal() {
      this.showEditPostModal = false;
      this.editingPost = { postId: null, title: '', content: '', originalTitle: '', originalContent: '' };
    },

    async submitEditPost() {
      const postId = this.editingPost.postId;
      const newTitle = this.editingPost.title.trim();
      const newContent = this.editingPost.content.trim();

      if (!newTitle || !newContent || !postId) return alert("标题或内容不能为空。");

      if (newTitle === this.editingPost.originalTitle && newContent === this.editingPost.originalContent) {
        return alert("帖子标题和内容没有发生变化。");
      }

      try {
        await postsAPI.updatePost(postId, {
          postTitle: newTitle,
          postContent: newContent,
        });

        alert("帖子修改成功！");
        this.closeEditPostModal();

        // 刷新数据并跳转到帖子详情页查看修改结果 (可选)
        await this.fetchCommunityData();
        this.$router.push(`/posts/${postId}`);

      } catch (error) {
        console.error('修改帖子失败:', error);
        let errorMessage = '修改帖子失败，请检查是否是帖子作者。';
        if (error.response?.status === 401) {
          errorMessage = '修改操作需要登录。';
        } else if (error.response?.status === 403) {
          errorMessage = '您没有权限修改此帖子。';
        }
        alert(errorMessage);
      }
    },
  },
};
</script>

<style scoped>
/* ===== 错误/加载状态 ===== */
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

/* ===== 社区头部 ===== */
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

/* 修改描述按钮样式 */
.edit-description-btn {
  background: #f39c12;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
  border: none;
  cursor: pointer;
}

.edit-description-btn:hover {
  background: #d35400;
}

.create-post-btn {
  background: #2ecc71;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
  border: none;
  cursor: pointer;
}

.create-post-btn:hover {
  background: #27ae60;
}


/* ===== 帖子列表容器 ===== */
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


/* ===== 弹窗 (创建 & 修改) 样式 ===== */
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
</style>