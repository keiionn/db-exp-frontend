<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>欢迎回来</h1>
        <p>请登录您的账户继续</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <i class="fas fa-user"></i>
          <input type="text" v-model="form.username" placeholder="用户名或邮箱" :class="{ error: errors.username }"
            @blur="validateField('username')">
        </div>
        <div class="error-message" v-if="errors.username">
          <i class="fas fa-exclamation-circle"></i> {{ errors.username }}
        </div>

        <div class="input-group">
          <i class="fas fa-lock"></i>
          <input :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="密码"
            :class="{ error: errors.password }" @blur="validateField('password')">

          <i class="fas fa-eye" :class="{ 'fa-eye-slash': showPassword }" @click="showPassword = !showPassword"
            style="left: auto; right: 15px; cursor: pointer;" title="显示或隐藏密码" aria-label="显示或隐藏密码" role="button"
            tabindex="0"></i>
        </div>
        <div class="error-message" v-if="errors.password">
          <i class="fas fa-exclamation-circle"></i> {{ errors.password }}
        </div>

        <div class="options">
          <label class="remember-me">
            <input type="checkbox" v-model="form.rememberMe"> 记住我
          </label>
          <a href="#" class="forgot-password">忘记密码?</a>
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="!isLoading">登录</span>
          <span v-else>登录中...</span>
        </button>
      </form>

      <div class="signup-link">
        还没有账户? <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      form: {
        username: '',
        password: '',
        rememberMe: false
      },
      errors: {
        username: '',
        password: ''
      },
      showPassword: false,
      isLoading: false,
      // ⚠️ 添加一个用于显示API错误的属性
      apiError: '' 
    }
  },
  methods: {
    validateField(field) {
      this.errors[field] = '';
      
      if (field === 'username') {
        if (!this.form.username) {
          this.errors.username = '请输入用户名或邮箱';
        } else if (this.form.username.length < 3) {
          this.errors.username = '用户名至少需要3个字符';
        }
      }
      
      if (field === 'password') {
        if (!this.form.password) {
          this.errors.password = '请输入密码';
        } else if (this.form.password.length < 6) {
          this.errors.password = '密码至少需要6个字符';
        }
      }
    },
    validateForm() {
      this.validateField('username');
      this.validateField('password');
      this.apiError = ''; // 重置 API 错误
      
      return !this.errors.username && !this.errors.password;
    },
    
    // ✅ 关键修复：使用 async/await 处理异步登录
    async handleLogin() {
      // 1. 校验表单
      if (!this.validateForm()) {
        return;
      }
      
      // 2. 开启加载状态
      this.isLoading = true;
      
      try {
        // 3. 等待 Vuex Store 的 login 动作完成 (异步)
        await this.$store.dispatch('login', {
          username: this.form.username,
          password: this.form.password,
          rememberMe: this.form.rememberMe
        });

        // 4. 登录成功，跳转到首页
        this.$router.push('/home');
        
      } catch (error) {
        // 5. 登录失败，捕获并显示错误
        console.error('登录失败:', error);
        
        // 假设 Store Action 抛出的错误对象包含 message 属性
        this.apiError = error.message || '登录失败，请检查账号和密码。';
        
      } finally {
        // 6. 无论成功失败，关闭加载状态
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
/* 这里放置所有的CSS样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  max-width: 400px;
}

/* 平板端 */
@media (min-width: 768px) {
  .login-card {
    max-width: 500px;
    padding: 50px 40px;
  }
}

/* 桌面端 */
@media (min-width: 1024px) {
  .login-card {
    max-width: 600px;
    padding: 60px 50px;
  }

  .login-header h1 {
    font-size: 2.2rem;
  }

  .input-group input {
    padding: 18px 25px 18px 55px;
    font-size: 16px;
  }

  .login-button {
    padding: 20px;
    font-size: 18px;
  }
}

/* 大桌面端 */
@media (min-width: 1440px) {
  .login-card {
    max-width: 900px;
    padding: 70px 60px;
  }
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

.remember-me {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.remember-me input {
  margin-right: 5px;
}

.forgot-password {
  color: #6a11cb;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password:hover {
  text-decoration: underline;
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

.divider {
  position: relative;
  text-align: center;
  margin: 30px 0;
}

.divider span {
  background: white;
  padding: 0 15px;
  position: relative;
  z-index: 1;
  color: #666;
  font-size: 14px;
}

.divider:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #ddd;
  z-index: 0;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}

.social-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.3s;
}

.social-button:hover {
  transform: scale(1.1);
}

.google {
  background: #db4437;
  color: white;
}

.facebook {
  background: #4267B2;
  color: white;
}

.github {
  background: #333;
  color: white;
}

.signup-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.signup-link a {
  color: #6a11cb;
  text-decoration: none;
  font-weight: 600;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>
