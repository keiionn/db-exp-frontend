<template>
  <div class="dashboard-container">
    <h1>我的主页</h1>

    <router-link to="/home" class="btn position top-right">
      返回首页
    </router-link>

    <!-- 用户信息 -->
    <div class="user-info">
      <p><strong>用户名：</strong> {{ getUserInfo.username }}</p>
      <p v-if="getUserInfo.email">
        <strong>邮箱：</strong> {{ getUserInfo.email }}
      </p>
    </div>

    <!-- 社区管理 -->
    <div class="submit-community">
      <h2>社区管理</h2>
      <button class="btn" @click="createCommunity">创建社区</button>
    </div>

    <!-- 账户管理 -->
    <div class="user-management">
      <h2>账户管理</h2>
      <button class="btn" @click="openPasswordModal">更改密码</button>
      <button class="btn" @click="openEmailModal">更改邮箱</button>
    </div>

    <!-- 修改密码弹窗 -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal-content">
        <h3>修改密码</h3>

        <div class="form-group">
          <label>旧密码</label>
          <input type="password" v-model="pwdForm.currentPassword" />
        </div>

        <div class="form-group">
          <label>新密码</label>
          <input type="password" v-model="pwdForm.newPassword" />
        </div>

        <div class="form-group">
          <label>确认新密码</label>
          <input type="password" v-model="pwdForm.confirmPassword" />
        </div>

        <div class="modal-actions">
          <button class="btn cancel" @click="closePasswordModal">
            取消
          </button>
          <button class="btn" @click="submitPasswordChange">
            确认修改
          </button>
        </div>
      </div>
    </div>

    <!-- 修改邮箱弹窗 -->
    <div v-if="showEmailModal" class="modal-overlay" @click.self="closeEmailModal">
      <div class="modal-content">
        <h3>更改邮箱</h3>

        <div class="form-group">
          <label>新邮箱地址</label>
          <input type="email" v-model="emailForm.newEmail" placeholder="example@mail.com" />
        </div>

        <div class="form-group">
          <label>当前密码（验证身份）</label>
          <input type="password" v-model="emailForm.currentPassword" />
        </div>

        <div class="modal-actions">
          <button class="btn cancel" @click="closeEmailModal">
            取消
          </button>
          <button class="btn" @click="submitEmailChange">
            确认修改
          </button>
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
      showPasswordModal: false,
      showEmailModal: false,

      pwdForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      },

      emailForm: {
        newEmail: "",
        currentPassword: ""
      }
    };
  },

  mounted() {
    // ✅ 关键防护：确保 userId 来源正确
    if (!this.$store.state.user?.userId) {
      alert("登录状态异常，请重新登录");
      this.$router.replace("/login");
    }

    console.log("当前登录用户：", this.$store.state.user);

  },

  methods: {
    createCommunity() {
      this.$router.push("/createcommunity");
    },
    async refreshCurrentUser() {
      try {
        const res = await api.get("/auth/me");

        // 推荐：统一通过 Vuex 更新
        if (this.$store._mutations.SET_USER) {
          this.$store.commit("SET_USER", res.data);
        } else {
          // 兜底方案（不推荐长期使用）
          this.$store.state.user = res.data;
        }
      } catch (err) {
        console.error("刷新当前用户信息失败", err);
      }
    },
    /* ================= 修改密码 ================= */

    openPasswordModal() {
      this.pwdForm = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      };
      this.showPasswordModal = true;
    },

    closePasswordModal() {
      this.showPasswordModal = false;
    },

    async submitPasswordChange() {
      const { currentPassword, newPassword, confirmPassword } =
        this.pwdForm;

      if (!currentPassword || !newPassword) {
        return alert("请填写完整信息");
      }

      if (newPassword !== confirmPassword) {
        return alert("两次输入的新密码不一致");
      }

      const userId = this.$store.state.user.userId;

      try {
        await api.put(`/users/${userId}/password`, {
          currentPassword,
          newPassword
        });

        alert("密码修改成功！");
        this.closePasswordModal();
      } catch (err) {
        alert(
          err.response?.data?.message ||
          "修改失败，请检查旧密码"
        );
      }
    },

    /* ================= 修改邮箱（重点修复） ================= */

    openEmailModal() {
      this.emailForm = {
        newEmail: "",
        currentPassword: ""
      };
      this.showEmailModal = true;
    },

    closeEmailModal() {
      this.showEmailModal = false;
    },

    async submitEmailChange() {
      const { newEmail, currentPassword } = this.emailForm;
      const currentEmail = this.getUserInfo.email;

      if (!newEmail || !currentPassword) {
        return alert("请完整填写信息");
      }

      if (newEmail === currentEmail) {
        return alert("新邮箱不能与当前邮箱相同");
      }

      try {
        await api.put(`/users/${this.getUserInfo.userId}/email`, {
          currentPassword,
          newEmail
        });

        // ⭐ 关键：重新获取登录用户信息 ⭐
        await this.refreshCurrentUser();

        this.closeEmailModal();
        alert("邮箱修改成功！");

      } catch (err) {
        const msg =
          err.response?.data ||
          err.response?.data?.message ||
          "修改邮箱失败";
        alert(msg);
      }
    }
  }
};
</script>

<style scoped>
/* 样式与你原来完全一致，未改动 */
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

.btn.position {
  position: absolute;
}

.btn.top-right {
  top: 20px;
  right: 20px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 25px;
  border-radius: 10px;
  width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group input {
  width: 100%;
  padding: 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.btn.cancel {
  background: #f5f5f5;
  color: #666;
}
</style>
