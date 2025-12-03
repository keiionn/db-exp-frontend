<template>
  <div class="change-password">
    <h2>更改密码</h2>
    <form @submit.prevent="handleChangePassword">
      <div class="input-group">
        <label>当前密码</label>
        <input 
          type="password" 
          v-model="form.currentPassword"
          required
        >
      </div>
      
      <div class="input-group">
        <label>新密码</label>
        <input 
          type="password" 
          v-model="form.newPassword"
          required
        >
      </div>
      
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? '处理中...' : '更改密码' }}
      </button>
      
      <div v-if="message" class="message" :class="{ error: isError }">
        {{ message }}
      </div>
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ChangePassword',
  data() {
    return {
      form: {
        currentPassword: '',
        newPassword: ''
      },
      isLoading: false,
      message: '',
      isError: false
    }
  },
  computed: {
    ...mapState(['user'])
  },
  methods: {
    async handleChangePassword() {
      this.isLoading = true
      this.message = ''
      this.isError = false
      
      try {
        const response = await this.$axios.put(
          `/${this.user.id}/password`,
          {
            currentPassword: this.form.currentPassword,
            newPassword: this.form.newPassword
          }
        )
        
        if (response.data.success) {
          this.message = '密码已成功更改！'
          this.form.currentPassword = ''
          this.form.newPassword = ''
        } else {
          this.isError = true
          this.message = response.data.message || '密码更改失败'
        }
      } catch (error) {
        this.isError = true
        this.message = error.response?.data?.message || '请求出错，请稍后重试'
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.change-password {
  max-width: 500px;
  margin: 0 auto;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #2c3e50;
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
  padding: 12px 15px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #0069d9;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
}
</style>