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
      
      // 👇 修改点 2: 添加控制 Header 文本的状态变量
      headerText: "请登录您的账户继续", 
      isHeaderError: false,
      headerTimer: null // 用于存储定时器ID，防止频繁点击时的冲突
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

    // 👇 修改点 3: 添加显示临时错误的辅助方法
    triggerHeaderError() {
      // 如果已经有定时器在运行，先清除它
      if (this.headerTimer) clearTimeout(this.headerTimer);

      this.headerText = "用户名或密码错误";
      this.isHeaderError = true; // 触发红色样式

      // 2秒后恢复
      this.headerTimer = setTimeout(() => {
        this.headerText = "请登录您的账户继续";
        this.isHeaderError = false; // 恢复默认样式
        this.headerTimer = null;
      }, 2000);
    },

    async handleLogin() {
      if (!this.validateForm()) return;

      this.isLoading = true;
      this.apiError = '';

      try {
        const response = await fetch('http://localhost:8081/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.form.username,
            password: this.form.password
          }),
          credentials: 'include'
        });

        if (response.status === 200) {
          const data = await response.json();
          this.$store.commit('setUser', {
            userId: data.userId,
            username: data.username,
            email: data.email
          });
          this.$router.push('/home');
        } else if (response.status === 401) {
          // 👇 修改点 4: 登录失败(401)时调用头部错误提示
          this.triggerHeaderError();
          
          // 如果不想底部同时也显示文字，可以注释掉下面这行
          // const data = await response.json();
          // this.apiError = data.message || '用户名或密码错误';
        } else {
          this.apiError = '登录失败，请稍后再试';
        }

      } catch (err) {
        console.error(err);
        this.apiError = '网络错误，请检查后重试';
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
/* ... (保留你之前的样式) ... */

/* 👇 修改点 5: 添加头部错误状态的样式 */
.header-error {
  color: #ff3860; /* 红色警告色 */
  font-weight: bold;
  animation: shake 0.3s ease-in-out; /* 可选：加一个轻微抖动效果 */
}

/* 可选的抖动动画 keyframes */
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}

/* 以下是你原来的代码，保持不变 */
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