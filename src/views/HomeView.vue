<template>
  <div class="home-container">

    <!-- 搜索栏 -->
    <input
      v-model="searchQuery"
      type="text"
      placeholder="搜索帖子..."
      class="search-input"
    />

    <!-- 顶部按钮 -->
    <div class="top-bar">
      <button class="dashboard-btn" @click="goToDashboard">我的主页</button>
      <button class="dashboard-btn" @click="logout">退出登录</button>
    </div>

    <!-- 社区列表 -->
    <div class="posts-section">
      <h2>全部社区</h2>

      <!-- 动画列表 -->
      <transition-group name="fade" tag="div" class="posts-list">
        <div
          class="post-card"
          v-for="community in filteredCommunities"
          :key="community.communityId"
          @click="goToCommunity(community.communityId)"
        >
          <h3>{{ community.title }}</h3>
          <p>{{ community.description.substring(0, 100) }}...</p>
          <p class="community-author">创建者: {{ community.authorName }}</p>
        </div>
      </transition-group>

      <!-- 空状态 -->
      <div v-if="filteredCommunities.length === 0" class="empty-state">
        没有找到相关社区
      </div>
    </div>

  </div>
</template>




<script>
import api from "@/api";

export default {
  name: "HomeView",

  data() {
    return {
      searchQuery: "",
      allCommunities: [],
    };
  },

  computed: {
    filteredCommunities() {
      const q = this.searchQuery.trim().toLowerCase();
      if (!q) return this.allCommunities;

      return this.allCommunities.filter((community) =>
        community.name.toLowerCase().includes(q) ||
        community.description.toLowerCase().includes(q)
      );
    },
  },

  mounted() {
    this.fetchCommunities();
  },

  methods: {

    async fetchCommunities() {
      try {
        const res = await api.get("/api/communities/getAllCommunities");
        this.allCommunities = res.data;
      } catch (err) {
        console.error("获取社区失败:", err);
      }
    },

    goToCommunity(communityId) {
      if (communityId) {
        this.$router.push(`/communities/${communityId}`);
      } else {
        console.error("无效的 communityId:", communityId);
      }
    },

    goToDashboard() {
      this.$router.push("/dashboard");
    },

    logout() {
      this.$store.dispatch("logout");
      this.$router.push("/login");
    },
  },
};
</script>




<style scoped>
.home-container {
  padding: 20px;
}

/* 搜索框 */
.search-input {
  width: 100%;
  padding: 12px 15px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.posts-section h2 {
  margin-bottom: 15px;
  font-size: 22px;
  font-weight: bold;
}

/* 帖子卡片 */
.post-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 15px;
  cursor: pointer;
  transition: 0.25s;
}

.post-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.post-meta {
  display: flex;
  gap: 20px;
  color: #888;
  margin-top: 10px;
}

.community-author {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #777;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.dashboard-btn {
  padding: 10px 16px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: 0.25s ease;
  margin-left: 10px;
}

.dashboard-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
</style>
