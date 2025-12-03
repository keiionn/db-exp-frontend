import { createStore } from 'vuex'

// --- 辅助函数：在应用启动时从本地存储加载用户数据 ---
function loadUserFromStorage() {
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            // 尝试解析JSON字符串为用户对象
            return JSON.parse(userString);
        } catch (e) {
            console.error("无法解析本地存储的用户数据:", e);
            localStorage.removeItem('user'); // 清除损坏的数据
            return null;
        }
    }
    return null;
}
// ----------------------------------------------------


export default createStore({
    state: {
        // ⚠️ 启动时尝试从 localStorage 恢复用户状态
        user: loadUserFromStorage()
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
            
            // ⚠️ 关键改进：同步本地存储
            if (user) {
                // 登录或更新成功时，存储用户对象
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                // 登出时，清除存储
                localStorage.removeItem('user');
            }
        }
    },
    actions: {
        // 1. 登录 Action (用于 LoginView)
        // 假设这里会调用 API，然后将返回的用户对象传入 commit
        async login({ commit }, credentials) {
            // ⚠️ 真实代码中应在此处调用 API，并处理 try...catch
            
            // 模拟成功逻辑：
            const mockUser = { 
                id: 1, 
                name: credentials.username || '用户A', 
                email: 'test@example.com' 
            };
            
            commit('setUser', mockUser);
            // 在 LoginView 中，您可以 await 这个 action，然后跳转路由
            return mockUser; 
        },

        // 2. 登出 Action (用于 DashboardView)
        logout({ commit }) {
            // ⚠️ 真实代码中应在此处调用 API 使服务器 session 失效
            commit('setUser', null); // 清除状态和本地存储
        },

        // 3. ✅ 新增：更新用户信息 Action (用于 DashboardView 的修改操作)
        updateUser({ commit }, newUserInfo) {
            // 当修改用户名/邮箱的 API 成功返回新的用户对象时，调用此 action
            commit('setUser', newUserInfo);
        }
    },
    getters: {
        isAuthenticated: state => !!state.user,
        // 方便获取用户名的 Getter
        userName: state => state.user ? state.user.name : '访客'
    }
})