<template>
  <button 
    @click="toggleSubscription" 
    :disabled="isProcessing"
    :class="{'subscribed': isSubscribed, 'unsubscribed': !isSubscribed}"
    class="subscription-btn"
  >
    <span v-if="isProcessing">处理中...</span>
    <span v-else-if="isSubscribed">已订阅 ({{ count }})</span>
    <span v-else>+ 订阅 ({{ count }})</span>
  </button>
</template>

<script>
import communityApi from '@/api/community';

export default {
  name: 'SubscriptionButton',
  props: {
    communityName: {
      type: String,
      required: true
    },
    initialIsSubscribed: {
      type: Boolean,
      default: false
    },
    initialSubscriberCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      // 使用组件内部状态管理订阅状态和数量
      isSubscribed: this.initialIsSubscribed,
      count: this.initialSubscriberCount,
      isProcessing: false
    };
  },
  methods: {
    async toggleSubscription() {
      // ⚠️ 实际项目中，需要先检查用户是否已登录
      if (!this.$store.getters.isAuthenticated) {
        alert('请先登录才能订阅社区！');
        this.$router.push('/login');
        return;
      }

      this.isProcessing = true;

      try {
        let response;
        if (this.isSubscribed) {
          // 调用取消订阅 API
          response = await communityApi.unsubscribe(this.communityName);
        } else {
          // 调用订阅 API
          response = await communityApi.subscribe(this.communityName);
        }

        // 成功后更新本地状态
        this.isSubscribed = response.isSubscribed;
        this.count += response.isSubscribed ? 1 : -1;
        
        // 提示用户
        alert(`成功${response.isSubscribed ? '订阅' : '取消订阅'} ${this.communityName}`);

      } catch (error) {
        console.error('订阅操作失败:', error);
        alert('操作失败，请重试。');
      } finally {
        this.isProcessing = false;
      }
    }
  }
};
</script>

<style scoped>
.subscription-btn {
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.unsubscribed {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.unsubscribed:hover {
  background: #2980b9;
}

.subscribed {
  background: white;
  color: #3498db;
  border-color: #3498db;
}

.subscribed:hover {
  background: #ecf0f1;
}

.subscription-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>