<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <h1>欢迎回来, {{ user?.name || '用户' }}!</h1>
      <p>这是您的仪表盘页面，您可以在此管理您的账户设置。</p>

      <div class="dashboard-actions">
        <router-link to="/home" class="home-btn">返回首页</router-link>
      </div>

      <div class="user-management">
        <h2>账户管理</h2>

        <div class="management-section">
          <h3>修改用户名</h3>
          <div class="input-group">
            <input
              type="text"
              v-model="newUsername"
              placeholder="新用户名"
              :disabled="isUpdatingUsername"
            >
            <button 
              @click="changeUsername" 
              class="action-btn"
              :disabled="isUpdatingUsername || newUsername.length < 3"
            >
              {{ isUpdatingUsername ? '更新中...' : '更新' }}
            </button>
          </div>
        </div>

        <div class="management-section">
          <h3>修改邮箱</h3>
          <div class="input-group">
            <input
              type="email"
              v-model="newEmail"
              placeholder="新邮箱"
              :disabled="isUpdatingEmail"
            >
            <button 
              @click="changeEmail" 
              class="action-btn"
              :disabled="isUpdatingEmail || !newEmail.includes('@')"
            >
              {{ isUpdatingEmail ? '更新中...' : '更新' }}
            </button>
          </div>
        </div>
        
        <div class="management-section">
          <h3>修改密码</h3>
          <div class="input-group">
            <input
              type="password"
              v-model="currentPassword"
              placeholder="当前密码"
              :disabled="isUpdatingPassword"
            >
          </div>
          <div class="input-group">
            <input
              type="password"
              v-model="newPassword"
              placeholder="新密码 (至少6位)"
              :disabled="isUpdatingPassword"
            >
          </div>
          <div class="input-group">
            <input
              type="password"
              v-model="confirmPassword"
              placeholder="确认新密码"
              :disabled="isUpdatingPassword"
            >
          </div>
          <button 
            @click="changePassword" 
            class="action-btn full-width"
            :disabled="isUpdatingPassword || newPassword !== confirmPassword || newPassword.length < 6"
          >
            {{ isUpdatingPassword ? '更新中...' : '更新密码' }}
          </button>
        </div>

        <div class="management-section">
          <h3>危险操作</h3>
          <button @click="deleteAccount" class="danger-btn">删除账户</button>
        </div>
      </div>
      
      <div class="actions">
        <button @click="logout" class="logout-btn">退出登录</button>
        </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 导入我们创建的 Mock API 服务
import userApi from '@/api/user'; 

export default {
  name: 'DashboardView',
  data() {
    return {
      // 账户管理所需的 data 属性
      newUsername: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      newEmail: '',
      
      // 状态管理：用于禁用按钮和显示加载状态
      isUpdatingUsername: false,
      isUpdatingEmail: false,
      isUpdatingPassword: false,
      
      // 帖子数据已移除
    }
  },
  computed: {
    ...mapState(['user']),
    // userPosts computed 属性已移除
  },
  methods: {
    // ------------------------------------------------------------------
    // 核心功能方法 (集成 Mock API)
    // ------------------------------------------------------------------

    // 1. 修改用户名
    async changeUsername() {
      if (this.newUsername.length < 3) {
        alert('用户名至少需要3个字符');
        return;
      }
      this.isUpdatingUsername = true;
      try {
        const newUser = await userApi.changeUsername(this.newUsername);
        
        // 成功后调用 Vuex Action 更新状态和本地存储
        this.$store.dispatch('updateUser', newUser);
        alert(`用户名已成功更新为 ${newUser.name}!`);
        this.newUsername = ''; 
        
      } catch (error) {
        alert(`更新失败: ${error.message}`);
      } finally {
        this.isUpdatingUsername = false;
      }
    },

    // 2. 修改邮箱
    async changeEmail() {
        if (!this.newEmail.includes('@')) {
            alert('请输入有效的邮箱地址');
            return;
        }
        this.isUpdatingEmail = true;
        try {
            const newUser = await userApi.changeEmail(this.newEmail);

            // 成功后调用 Vuex Action 更新状态和本地存储
            this.$store.dispatch('updateUser', newUser);
            alert(`邮箱已成功更新为 ${newUser.email}!`);
            this.newEmail = ''; 
            
        } catch (error) {
            alert(`更新失败: ${error.message}`);
        } finally {
            this.isUpdatingEmail = false;
        }
    },

    // 3. 修改密码
    async changePassword() {
      if (this.newPassword !== this.confirmPassword) {
         alert('新密码和确认密码不一致');
         return;
      }
      if (this.newPassword.length < 6) {
        alert('新密码至少需要6个字符');
        return;
      }

      this.isUpdatingPassword = true;
      try {
          // ⚠️ 注意：后端通常需要旧密码来验证身份
          await userApi.changePassword(this.currentPassword, this.newPassword);
          
          alert('密码更新成功！出于安全考虑，您可能需要重新登录。');
          
          // 清空表单
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
          
      } catch (error) {
          alert(`更新失败: ${error.message}`);
      } finally {
          this.isUpdatingPassword = false;
      }
    },

    // 4. 删除账户
    async deleteAccount() {
      if (!confirm('⚠️ 确定要永久删除您的账户吗？此操作不可逆！')) {
        return;
      }
      
      try {
        await userApi.deleteAccount();
        
        // 成功后执行退出登录和跳转
        this.$store.dispatch('logout');
        alert('您的账户已成功删除。');
        this.$router.push('/login');
        
      } catch (error) {
        alert(`删除失败: ${error.message}`);
      }
    },

    // 5. 退出登录
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* 全局样式和背景 */
.dashboard-container {
  background: #f7f9fc; 
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px; 
  min-height: 100vh;
}

/* 主内容卡片 */
.dashboard-content {
  background: white;
  border-radius: 12px; 
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); 
  padding: 50px;
  width: 100%;
  max-width: 700px; /* 调整最大宽度，因为帖子区域已移除 */
  text-align: left; 
}

/* 头部和欢迎语 */
h1 {
  color: #333;
  margin-bottom: 5px;
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
}

p {
  color: #6c757d;
  margin-bottom: 40px;
  font-size: 1.1rem;
  text-align: center;
}

/* 按钮组 */
.dashboard-actions, .actions {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
  justify-content: center;
}

/* 账户管理区布局 */
.user-management {
  margin-bottom: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.user-management h2 {
  font-size: 1.8rem;
  color: #007bff; 
  margin-bottom: 25px;
  text-align: center;
}

/* 管理小节卡片 */
.management-section {
  background: #fcfcfc;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s;
}

.management-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.management-section h3 {
  color: #495057;
  font-size: 1.3rem;
  margin-bottom: 15px;
  border-bottom: 2px solid #007bff; 
  display: inline-block;
  padding-bottom: 5px;
}

/* 输入组 Flex 布局 */
.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.input-group input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.input-group input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* 按钮通用样式 */
.action-btn, .home-btn, .logout-btn, .danger-btn {
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap; 
}

/* 主题按钮 */
.action-btn, .home-btn {
  background: #007bff; 
  color: white;
  border: none;
}

.action-btn:hover, .home-btn:hover {
  background: #0056b3;
}

/* 危险操作按钮 */
.danger-btn, .logout-btn {
  background: #dc3545; 
  color: white;
  border: none;
}

.danger-btn:hover, .logout-btn:hover {
  background: #c82333;
}

/* 新增：使修改密码按钮占满整行 */
.full-width {
    width: 100%;
    margin-top: 10px;
}

/* 响应式设计调整 */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 30px;
  }
  .input-group {
    flex-direction: column;
    align-items: stretch;
  }
  .input-group button {
    width: 100%;
    margin-top: 5px;
  }
  .actions {
    flex-wrap: wrap;
  }
}
</style>