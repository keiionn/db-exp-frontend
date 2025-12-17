<template>
  <div class="home-container">

    <input
      v-model="searchQuery"
      type="text"
      placeholder="输入社区 ID 或名称后按回车搜索..."
      class="search-input"
      @keyup.enter="handleSearch"
    />

    <div class="top-bar">
      <button class="dashboard-btn" @click="goToDashboard">我的主页</button>
      <button class="dashboard-btn" @click="logout">退出登录</button>
    </div>

    <div class="posts-section">
      <h2>最新社区列表</h2>

      <div v-if="isLoading" class="loading-state">
        正在加载社区列表...
      </div>
      
      <div v-else-if="latestCommunities.length === 0" class="empty-state">
        <p>未找到任何社区。</p>
        <p>请在上方输入框中输入社区 ID 或精确名称进行搜索。</p>
      </div>
      
      <div v-else class="communities-list">
        <div 
          class="community-card"
          v-for="community in latestCommunities"
          :key="community.communityId"
          @click="goToCommunity(community.communityId)"
        >
          <div class="community-info">
            <h3>{{ community.name }}</h3>
            <p>{{ community.description.substring(0, 100) }}{{ community.description.length > 100 ? '...' : '' }}</p>
            <div class="community-meta">
              <span>ID: {{ community.communityId }}</span>
              <span>•</span>
              <span>创建时间: {{ formatDate(community.creationTime) }}</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
// 导入 api 实例以访问未封装的 /communities/latest 接口
import api, { authAPI, communitiesAPI } from "@/api/index"; 

export default {
  name: "HomeView",

  data() {
    return {
      searchQuery: "",
      latestCommunities: [], // 新增：存储最新社区列表
      isLoading: false,      // 新增：加载状态
    };
  },

  created() {
    // 组件创建时加载最新社区列表
    this.fetchLatestCommunities();
  },

  computed: {
    // 保持为空，不再需要
    filteredCommunities() {
      return []; 
    },
  },

  methods: {
    // 新增方法：获取最新社区列表
    async fetchLatestCommunities() {
      this.isLoading = true;
      try {
        // 使用您提供的 API 路径：GET /api/communities/latest
        const response = await api.get('/communities/latest'); 
        this.latestCommunities = response.data || [];
      } catch (err) {
        console.error("获取最新社区列表失败:", err);
        // 如果失败，显示空列表并给出提示
        this.latestCommunities = [];
        alert("无法加载最新社区列表，请检查网络或后端服务。");
      } finally {
        this.isLoading = false;
      }
    },
    
    // 辅助函数：检查输入是否为纯数字 (保持不变)
    isNumeric(value) {
      return /^\d+$/.test(value);
    },

    // handleSearch (保持不变)
    async handleSearch() {
      const query = this.searchQuery.trim();
      if (!query) {
        alert("请输入社区 ID 或名称。");
        return;
      }

      const isId = this.isNumeric(query);
      
      try {
        let response;
        if (isId) {
          // 1. 尝试按 ID 查询 (GET /api/communities/{id})
          const id = parseInt(query, 10);
          response = await communitiesAPI.getCommunity(id); 
        } else {
          // 2. 尝试按名称查询 (GET /api/communities/name/{name})
          response = await communitiesAPI.getCommunityByName(query);
        }

        if (response.data && response.data.communityId) {
          this.goToCommunity(response.data.communityId);
        } else {
          alert(`未找到社区: ${query}`);
        }
      } catch (err) {
        console.error("搜索社区失败:", err);
        
        let errorMessage = "搜索失败，未找到该社区。";
        if (err.response && err.response.status === 404) {
              errorMessage = `社区 "${query}" 不存在。`;
        } else if (err.response && err.response.data && err.response.data.message) {
              errorMessage = `搜索失败: ${err.response.data.message}`;
        }
        alert(errorMessage);
      }
    },

    goToCommunity(communityId) {
      if (communityId) {
        this.$router.push(`/communities/${communityId}`); 
      }
    },

    goToDashboard() {
      this.$router.push("/dashboard");
    },

    async logout() {
      try {
        await authAPI.logout(); 
        this.$store.dispatch("logout");
        this.$router.push("/login");
      } catch (err) {
        console.error("退出登录失败:", err);
        alert("退出登录 API 调用失败，但将尝试清除本地状态。");
        this.$store.dispatch("logout");
        this.$router.push("/login");
      }
    },

    // 新增：格式化时间戳
    formatDate(timestamp) {
        if (!timestamp) return '未知时间';
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
  },
};
</script>

<style scoped>
/* 样式保持不变 */
.home-container {
  padding: 20px;
}

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

.empty-state {
  text-align: center;
  padding: 30px;
  color: #777;
  border: 1px dashed #ddd;
  border-radius: 8px;
  margin-top: 20px;
}

.empty-state p {
    margin: 5px 0;
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

.communities-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.community-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  border-left: 5px solid #3498db;
}

.community-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.community-info h3 {
  font-size: 1.4rem;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 10px;
}

.community-info p {
  color: #7f8c8d;
  font-size: 0.95rem;
  margin-bottom: 15px;
  min-height: 40px; /* 保持描述区域稳定 */
}

.community-meta {
  font-size: 0.8rem;
  color: #95a5a6;
  display: flex;
  gap: 10px;
}

.loading-state {
  text-align: center;
  padding: 50px;
  font-size: 1.1rem;
  color: #7f8c8d;
}
</style>