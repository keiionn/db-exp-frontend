<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>创建新账户</h1>
        <p>请填写以下信息注册</p>
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="input-group">
          <label>用户名</label>
          <input 
            type="text" 
            v-model="form.username"
            required
          >
        </div>
        
        <div class="input-group">
          <label>邮箱</label>
          <input 
            type="email" 
            v-model="form.email"
            required
          >
        </div>
        
        <div class="input-group">
          <label>密码</label>
          <input 
            type="password" 
            v-model="form.password"
            required
          >
        </div>
        
        <div class="input-group">
          <label>确认密码</label>
          <input 
            type="password" 
            v-model="form.confirmPassword"
            required
          >
        </div>
        
        <button 
          type="submit" 
          class="register-button"
          :disabled="isLoading"
        >
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
        
        <div class="login-link">
          已有账户? <router-link to="/login">立即登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      isLoading: false
    }
  },
  methods: {
    async handleRegister() {
      if (this.form.password !== this.form.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }
      
      this.isLoading = true
      
      try {
        // 调用注册API
        const response = await this.$axios.post('/api/register', this.form)
        
        if (response.data.success) {
          alert('注册成功!')
          this.$router.push('/login')
        } else {
          alert(response.data.message || '注册失败')
        }
      } catch (error) {
        alert(error.response?.data?.message || '请求出错，请稍后重试')
      } finally {
        this.isLoading = false
      }
    }
  }
}
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
  padding: 60px 50px;
  width: 100%;
  max-width: 800px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.register-header p {
  color: #7f8c8d;
}

.input-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

input {
  width: 100%;
  padding: 16px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 16px;
}

.register-button {
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
  margin-top: 20px;
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.register-button:hover:not(:disabled) {
  opacity: 0.9;
}

.login-link {
  text-align: center;
  margin-top: 25px;
  font-size: 16px;
  color: #666;
}

.login-link a {
  color: #6a11cb;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>