<template>
  <div class="create-community-view">

    <!-- 标题 -->
    <h1 class="title">创建社区</h1>
    <p class="desc">请填写社区信息以创建你的社区。</p>

    <!-- 返回主页按钮 -->
    <router-link to="/dashboard" class="back-btn">
      返回主页
    </router-link>

    <!-- 表单区域 -->
    <form class="form-box" @submit.prevent="createCommunity">

      <!-- 社区名称 -->
      <div class="input-group">
        <label>社区名称（如：vue、coding）</label>
        <input
          type="text"
          v-model="form.name"
          placeholder="请输入社区名称"
          required
        />
      </div>

      <!-- 社区描述 -->
      <div class="input-group">
        <label>社区描述</label>
        <textarea
          v-model="form.description"
          placeholder="请输入社区简介"
          rows="4"
          required
        ></textarea>
      </div>

      <!-- 提交按钮 -->
      <button class="create-btn" type="submit">
        创建社区
      </button>

    </form>
  </div>
</template>

<script>
import api from "@/api";

export default {
  name: "CreateCommunityView",
  data() {
    return {
      form: {
        name: "",
        description: "",
      },
    };
  },
  methods: {
    async createCommunity() {
      try {
        // 获取当前用户ID（假设存储在store中）
        const authorId = this.$store.state.user.userId;
        
        const response = await api.post("/api/communities/createCommunity", {
          communityName: this.form.name,
          title: this.form.name, // 使用社区名称作为标题
          description: this.form.description,
          authorId: authorId
        });

        if (response.data && response.data.communityId) {
          alert(`社区 ${this.form.name} 创建成功！`);
          this.$router.push(`/community/${response.data.communityId}`);
        } else {
          throw new Error("创建社区失败");
        }
      } catch (err) {
        console.error("创建社区失败:", err);
        alert("创建社区失败，请重试");
      }
    },
  },
};
</script>

<style scoped>
/* 主体容器 */
.create-community-view {
  width: 80%;
  margin: 50px auto;
  padding: 28px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

/* 标题 */
.title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

/* 描述 */
.desc {
  font-size: 15px;
  color: #666;
  margin-bottom: 25px;
}

/* 返回按钮 */
.back-btn {
  display: inline-block;
  padding: 10px 16px;
  margin-bottom: 25px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  transition: 0.25s;
}

.back-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* 表单整体 */
.form-box {
  margin-top: 10px;
}

/* 输入组 */
.input-group {
  margin-bottom: 22px;
}

.input-group label {
  font-size: 14px;
  color: #444;
  margin-bottom: 8px;
  display: block;
}

/* 输入框、textarea */
input,
textarea {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
  transition: 0.25s;
}

input:focus,
textarea:focus {
  border-color: #6a11cb;
  box-shadow: 0 0 6px rgba(106, 17, 203, 0.25);
}

/* 创建按钮 */
.create-btn {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: 0.25s;
}

.create-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
</style>
