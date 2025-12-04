import { createStore } from 'vuex'

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
    }
  },

  actions: {
    async login({ commit }, { username, password }) {
      try {
        const response = await axios.post(
          "http://localhost:8081/api/auth/login",
          { username, password },
          {
            withCredentials: true,   // ⭐ 必须：让浏览器保存 JSESSIONID
          }
        );

        // 如果成功，response.status = 200
        const data = response.data;

        const userData = {
          userId: data.userId,
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

    logout({ commit }) {
      commit("setUser", null)
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
    isAuthenticated: state => !!state.user
  }
})
