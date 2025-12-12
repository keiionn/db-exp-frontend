<template>
  <div class="dashboard-container">
    <h1>我的主页</h1>
    <router-link to="/home" class="btn position top-right">
      返回首页
    </router-link>

    <div class="user-info">
      <p><strong>用户名：</strong> {{ getUserInfo.username }}</p>
      <p v-if="getUserInfo.email"><strong>邮箱：</strong> {{ getUserInfo.email }}</p>
    </div>

    <div class="submit-community">
      <h2>社区管理</h2>
      <button class="btn" @click="createCommunity">创建社区</button>
    </div>

    <div class="user-management">
      <h2>账户管理</h2>
      <button class="btn" @click="openPasswordModal">更改密码</button>
      <button class="btn" @click="openEmailModal">更改邮箱</button>
    </div>

    <div class="my-communities-section">
      <h2>我的社区</h2>
      <div v-if="usercommunities.length > 0">
        <div class="community-card" v-for="community in usercommunities" :key="community.communityId"
          @click="goToCommunity(community)">
          <h3>{{ community.title }}</h3>
          <p>{{ community.description ? community.description.substring(0, 100) : '' }}...</p>
        </div>
      </div>
      <p v-else class="empty">暂无社区</p>
    </div>

    <div class="my-communities-section">
      <h2>我关注的社区</h2>
      <div v-if="subscribedcommunities.length > 0">
        <div class="community-card" v-for="community in subscribedcommunities" :key="community.communityId"
          @click="goToCommunity(community)">
          <h3>{{ community.title }}</h3>
          <p class="follow-time">
            关注时间：{{ (community.createAt) }}
          </p>
        </div>
      </div>
      <p v-else class="empty">暂无关注的社区</p>
    </div>

    <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal-content">
        <h3>修改密码</h3>
        <div class="form-group">
          <label>旧密码</label>
          <input type="password" v-model="pwdForm.oldPassword" placeholder="请输入旧密码">
        </div>
        <div class="form-group">
          <label>新密码</label>
          <input type="password" v-model="pwdForm.newPassword" placeholder="请输入新密码">
        </div>
        <div class="form-group">
          <label>确认新密码</label>
          <input type="password" v-model="pwdForm.confirmPassword" placeholder="再次输入新密码">
        </div>
        <div class="modal-actions">
          <button class="btn cancel" @click="closePasswordModal">取消</button>
          <button class="btn" @click="submitPasswordChange">确认修改</button>
        </div>
      </div>
    </div>

    <div v-if="showEmailModal" class="modal-overlay" @click.self="closeEmailModal">
      <div class="modal-content">
        <h3>绑定新邮箱</h3>
        <div class="form-group">
          <label>新邮箱地址</label>
          <input type="email" v-model="emailForm.newEmail" placeholder="example@mail.com">
        </div>
        <div class="form-group">
          <label>当前密码（验证身份）</label>
          <input type="password" v-model="emailForm.password" placeholder="请输入密码以确认">
        </div>
        <div class="modal-actions">
          <button class="btn cancel" @click="closeEmailModal">取消</button>
          <button class="btn" @click="submitEmailChange">确认修改</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import api from "@/api";

export default {
  name: "DashboardView",

  computed: {
    getUserInfo() {
      return this.$store.state.user || {};
    }
  },

  data() {
    return {
      usercommunities: [],
      subscribedcommunities: [],

      showPasswordModal: false,
      showEmailModal: false,

      pwdForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      emailForm: {
        newEmail: '',
        password: ''
      }
    };
  },

  mounted() {
    if (this.getUserInfo && this.getUserInfo.userId) {
      this.fetchUserPosts();
      this.fetchSubscribedPosts();
    }
  },

  methods: {
    async fetchUserPosts() {
      try {
        const res = await api.get(`/api/communities/myCommunities/${this.getUserInfo.userId}`);
        this.usercommunities = res.data;
      } catch (err) {
        console.error("获取用户创建的社区失败:", err);
      }
    },

    async fetchSubscribedPosts() {
      try {
        const res = await api.get(`/api/communities/subscribed/${this.getUserInfo.userId}`);
        this.subscribedcommunities = res.data;
      } catch (err) {
        console.error("获取用户关注的社区失败:", err);
      }
    },

    goToCommunity(community) {
      this.$router.push(`/communities/${community.communityId}`);
    },

    createCommunity() {
      this.$router.push("/createcommunity");
    },

    // ------------------- 修改密码 -------------------
    openPasswordModal() {
      this.pwdForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
      this.showPasswordModal = true;
    },
    closePasswordModal() {
      this.showPasswordModal = false;
    },
    async submitPasswordChange() {
      const { oldPassword, newPassword, confirmPassword } = this.pwdForm;

      if (!oldPassword || !newPassword) return alert("请填写完整信息");
      if (newPassword !== confirmPassword) return alert("两次输入的新密码不一致");
      if (newPassword.length < 6) return alert("新密码长度不能少于6位");

      try {
        await api.post("http://localhost:8081/api/auth/change_password", {
          userId: this.getUserInfo.userId,
          oldPassword,
          newPassword
        });

        alert("密码修改成功！");
        this.closePasswordModal();

      } catch (err) {
        alert(err.response?.data?.detail || "修改密码失败");
      }
    },

    // ------------------- 修改邮箱 -------------------
    openEmailModal() {
      this.emailForm = { newEmail: '', password: '' };
      this.showEmailModal = true;
    },
    closeEmailModal() {
      this.showEmailModal = false;
    },

    async submitEmailChange() {
      const { newEmail, password } = this.emailForm;

      if (!newEmail || !password) return alert("请完整填写信息");

      try {
        const res = await api.post("http://localhost:8081/api/auth/change_email", {
          userId: this.getUserInfo.userId,
          oldEmail: this.getUserInfo.email,
          newEmail,
          password
        });

        const updatedEmail = res.data.newEmail;

        // ① 更新 Vuex 用户 email
        this.$store.commit("UPDATE_USER_EMAIL", updatedEmail);

        // ② 更新本地 UI（避免 UI 不刷新）
        this.getUserInfo.email = updatedEmail;

        // ③ 关闭弹窗
        this.closeEmailModal();

        alert("邮箱修改成功！当前邮箱：" + updatedEmail);

      } catch (err) {
        alert(err.response?.data?.detail || "修改邮箱失败");
      }
    }

  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.user-info {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.user-management {
  margin-bottom: 30px;
}

.btn {
  padding: 10px 14px;
  margin-right: 10px;
  background: #4a8fff;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.btn:hover {
  opacity: 0.9;
}

.btn.danger {
  background: #e74c3c;
}

.btn.position {
  position: absolute;
}

/* 常见位置预设 */
.btn.top-left {
  top: 20px;
  left: 20px;
}

.btn.top-right {
  top: 20px;
  right: 20px;
}

.btn.bottom-left {
  bottom: 20px;
  left: 20px;
}

.btn.bottom-right {
  bottom: 20px;
  right: 20px;
}

/* 创建一个完全自由可控位置 */
.btn.custom-pos {
  position: absolute;
  top: var(--btn-top, auto);
  left: var(--btn-left, auto);
  right: var(--btn-right, auto);
  bottom: var(--btn-bottom, auto);
}

.my-communities-section {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.community-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 15px;
  cursor: pointer;
  transition: 0.25s;
}

.community-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.community-meta {
  display: flex;
  gap: 20px;
  color: #888;
  margin-top: 10px;
}

.community-tag {
  background: #eef3f7;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #007bff;
}

.empty {
  color: #777;
  margin-top: 10px;
}

.modal-overlay {
  position: fixed;
  /* 关键：固定在视口 */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  /* 半透明黑色背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  /* 确保覆盖页面上的其他元素 */
}

/* 弹窗主体 */
.modal-content {
  background: white;
  padding: 25px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

/* 表单组 */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 0.9em;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
  outline: none;
}

/* 底部按钮区域 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 取消按钮样式 */
.btn.cancel {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  margin-right: 10px;
}

.btn.cancel:hover {
  background: #e0e0e0;
}
</style>
