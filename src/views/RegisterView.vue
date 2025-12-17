<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>创建账户</h1>
        <p>填写信息完成注册</p>
      </div>

      <form @submit.prevent="handleRegister">
        <!-- 用户名 -->
        <div class="input-group">
          <label>用户名</label>
          <input type="text" v-model="form.username" required />
        </div>

        <!-- 邮箱 -->
        <div class="input-group">
          <label>邮箱</label>
          <input type="email" v-model="form.email" required />
        </div>

        <!-- 密码 -->
        <div class="input-group">
          <label>密码</label>
          <input type="password" v-model="form.password" required />
        </div>

        <!-- 确认密码 -->
        <div class="input-group">
          <label>确认密码</label>
          <input type="password" v-model="form.confirmPassword" required />
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 注册按钮 -->
        <button type="submit" class="register-button" :disabled="isLoading">
          {{ isLoading ? "注册中..." : "立即注册" }}
        </button>

        <div class="login-link">
          已有账户？
          <router-link to="/login">去登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { usersAPI } from '@/api/index';

export default {
  name: "RegisterView",
  data() {
    return {
      form: {
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
      },
      isLoading: false,
      errorMessage: ""
    };
  },
  methods: {
    async handleRegister() {
      this.errorMessage = "";

      if (this.form.password !== this.form.confirmPassword) {
        this.errorMessage = "两次输入的密码不一致";
        return;
      }

      this.isLoading = true;

      try {
        const response = await usersAPI.createUser({
          username: this.form.username,
          email: this.form.email,
          password: this.form.password
        });

        alert("注册成功！");
        this.$router.push("/login");
      } catch (error) {
        this.errorMessage =
          error.response?.data?.detail || "注册失败，请稍后再试";
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.register-container {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 50px 40px;
  width: 100%;
  max-width: 700px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.input-group {
  margin-bottom: 20px;
}

label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
  color: #444;
}

input {
  width: 100%;
  padding: 14px;
  border: 1px solid #ced4da;
  border-radius: 10px;
  font-size: 16px;
  transition: 0.2s;
}

input:focus {
  border-color: #6a11cb;
  outline: none;
}

.error-message {
  background: #ffe3e3;
  color: #d63031;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 15px;
}

.register-button {
  background: linear-gradient(to right, #6a11cb, #2575fc);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 16px;
  width: 100%;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.3s;
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #555;
}

.login-link a {
  color: #6a11cb;
  font-weight: 600;
}
</style>
