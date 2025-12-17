import { createStore } from 'vuex'
import { authAPI } from '@/api/index'; // 确保 axios 也在文件顶部被导入，虽然您的代码中使用了 axios.post
import axios from 'axios'; //

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem("user")) || null
  },

  mutations: {
    setUser(state, user) {
      state.user = user
      if (user) {
        localStorage.setItem("user", JSON.stringify(user))
      } else {
        localStorage.removeItem("user")
      }
    },
    UPDATE_USER_EMAIL(state, newEmail) {
      // 确保在更新前 user 对象存在
      if (state.user) {
         state.user.email = newEmail;
      }
    }
  },

  actions: {
    async login({ commit }, { username, password }) {
      try {
        // 注意: 您的 base URL 和端口与 /api/index.js 中不同 (8081 vs 8080)
        // 建议使用封装的 api 实例，或确保这里的 URL 正确
        const response = await axios.post(
          "http://localhost:8080/api/auth/login", // 假设使用 8080 端口以匹配其他 API
          { username, password },
          {
            withCredentials: true,
          }
        );

        // 如果成功，response.status = 200
        const data = response.data;

        const userData = {
          userId: data.userId, // 关键：这个 ID 必须存在
          username: data.username,
          email: data.email,
          message: data.message
        };

        commit("setUser", userData);

      } catch (error) {
        if (error.response && error.response.status === 401) {
          throw new Error("账号或密码错误");
        }
        throw new Error("服务器连接失败，请稍后再试");
      }
    },

    async logout({ commit }) {
      try {
        await authAPI.logout();
        commit("setUser", null);
      } catch (error) {
        console.error("登出失败:", error);
      }
    },
    async autoLogin({ commit }) {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          // 模拟token验证过程
          await new Promise(resolve => setTimeout(resolve, 500));
          commit("setUser", JSON.parse(user));
        } catch (error) {
          console.error("自动登录失败:", error);
          localStorage.removeItem("user");
        }
      }
    }
  },

  getters: {
    getUserId: state => {
      // 安全返回 userId，如果用户不存在则返回 null
      const id = state.user ? state.user.userId : null;
      // 确保返回的 ID 是数字类型（如果 API 返回的是数字）
      return id ? parseInt(id, 10) : null; 
    },
    
    isAuthenticated: state => !!state.user
  }
})