<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>欢迎回来</h1>
        <p :class="{ 'header-error': isHeaderError }">{{ headerText }}</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <i class="fas fa-user"></i>
          <input type="text" v-model="form.username" placeholder="用户名或邮箱" :class="{ error: errors.username }"
            @blur="validateField('username')" />
        </div>
        <div class="error-message" v-if="errors.username">
          <i class="fas fa-exclamation-circle"></i> {{ errors.username }}
        </div>

        <div class="input-group">
          <i class="fas fa-lock"></i>
          <input :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="密码"
            :class="{ error: errors.password }" @blur="validateField('password')" />
          <i class="fas fa-eye" :class="{ 'fa-eye-slash': showPassword }" @click="showPassword = !showPassword"
            style="left: auto; right: 15px; cursor: pointer;" title="显示或隐藏密码"></i>
        </div>
        <div class="error-message" v-if="errors.password">
          <i class="fas fa-exclamation-circle"></i> {{ errors.password }}
        </div>

        <div class="options">
          <label class="remember-me">
            <input type="checkbox" v-model="form.rememberMe" /> 记住我
          </label>
          <a href="#" class="forgot-password">忘记密码?</a>
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="!isLoading">登录</span>
          <span v-else>登录中...</span>
        </button>
        
        <div class="error-message" v-if="apiError">
           <i class="fas fa-exclamation-circle"></i> {{ apiError }}
        </div>
      </form>

      <div class="signup-link">
        还没有账户? <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '@/api/index';

export default {
  name: "LoginView",
  data() {
    return {
      form: {
        username: "",
        password: "",
        rememberMe: false
      },
      errors: {
        username: "",
        password: ""
      },
      showPassword: false,
      isLoading: false,
      apiError: "",
      
      headerText: "请登录您的账户继续", 
      isHeaderError: false,
      headerTimer: null 
    };
  },
  methods: {
    validateField(field) {
      this.errors[field] = '';
      if (field === 'username') {
        if (!this.form.username) this.errors.username = '请输入用户名或邮箱';
        else if (this.form.username.length < 3) this.errors.username = '用户名至少需要3个字符';
      }
      if (field === 'password') {
        if (!this.form.password) this.errors.password = '请输入密码';
        else if (this.form.password.length < 6) this.errors.password = '密码至少需要6个字符';
      }
    },
    validateForm() {
      this.validateField('username');
      this.validateField('password');
      this.apiError = '';
      return !this.errors.username && !this.errors.password;
    },

    triggerHeaderError(text) {
      if (this.headerTimer) clearTimeout(this.headerTimer);

      this.headerText = text;
      this.isHeaderError = true;

      this.headerTimer = setTimeout(() => {
        this.headerText = "请登录您的账户继续";
        this.isHeaderError = false;
        this.headerTimer = null;
      }, 2000);
    },

    async handleLogin() {
      if (!this.validateForm()) return;

      this.isLoading = true;
      this.apiError = '';

      try {
        const response = await authAPI.login({
          username: this.form.username,
          password: this.form.password
        });

        const data = response.data; // axios 的返回数据在 .data 中
        
        this.$store.commit('setUser', {
          userId: data.userId,
          username: data.username,
          email: data.email
        });
        
        this.$router.push('/home');
      } catch (error) {
        console.error("登录错误:", error);
        
        if (error.response) {
            const status = error.response.status;
            
            if (status === 401) {
                this.triggerHeaderError("用户名或密码错误");
            } else if (status === 404) {
                this.triggerHeaderError("接口不存在");
            } else {
                this.triggerHeaderError(`登录失败 (${status})`);
            }
        } else if (error.code === 'ECONNABORTED') {
            this.triggerHeaderError("请求超时，请检查网络");
        } else {
            this.triggerHeaderError("网络连接异常");
        }
      } finally {
        this.isLoading = false;
      }
    },

    async autoLogin() {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        this.$store.commit("setUser", JSON.parse(savedUser));
        return true;
      }
      return false;
    }
  },
  async mounted() {
    await this.autoLogin();
  }
};
</script>

<style scoped>
.header-error {
  color: #ff3860; /* 红色警告色 */
  font-weight: bold;
  animation: shake 0.3s ease-in-out; /* 可选：加一个轻微抖动效果 */
}

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}

.login-container {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}
.login-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 40px 30px;
  width: 60%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
}
.input-group {
  position: relative;
  margin-bottom: 15px;
}
.input-group i {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 15px;
  color: #6a11cb;
}
.input-group input {
  width: 100%;
  padding: 16px 25px 16px 55px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
  transition: border-color 0.3s;
}
.input-group input:focus {
  border-color: #6a11cb;
  outline: none;
}
.input-group input.error {
  border-color: #ff3860;
}
.error-message {
  color: #ff3860;
  font-size: 14px;
  margin-top: -10px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}
.error-message i {
  margin-right: 5px;
}
.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}
.remember-me input {
  margin-right: 5px;
}
.login-button {
  background: linear-gradient(to right, #6a11cb, #2575fc);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 18px;
  width: 100%;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}
.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.login-button:hover:not(:disabled) {
  opacity: 0.9;
}
.signup-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}
.signup-link a {
  color: #6a11cb;
  font-weight: 600;
  text-decoration: none;
}
.signup-link a:hover {
  text-decoration: underline;
}
</style>