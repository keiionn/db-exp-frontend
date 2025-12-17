<template>
  <div class="create-community-view">

    <h1 class="title">创建社区</h1>
    <p class="desc">请填写社区信息以创建你的社区。</p>

    <router-link to="/dashboard" class="back-btn">
      返回主页
    </router-link>

    <form class="form-box" @submit.prevent="createCommunity">

      <div class="input-group">
        <label>社区名称（如：vue、coding）</label>
        <input
          type="text"
          v-model="form.name"
          placeholder="请输入社区名称"
          required
        />
      </div>

      <div class="input-group">
        <label>社区描述</label>
        <textarea
          v-model="form.description"
          placeholder="请输入社区简介"
          rows="4"
          required
        ></textarea>
      </div>

      <button class="create-btn" type="submit">
        创建社区
      </button>

    </form>
  </div>
</template>

<script>
// 假设您的 API 封装文件已包含 communitiesAPI
import { communitiesAPI } from "@/api/index";

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
        const response = await communitiesAPI.createCommunity({
          "name": this.form.name,
          "description": this.form.description,
        });
        
        const responseData = response.data;
        
        // 检查响应数据是否存在，并且包含 communityId
        if (responseData && responseData.communityId !== undefined) {
          const newCommunityId = responseData.communityId;
          alert(`社区 ${this.form.name} 创建成功！`);
          this.$router.push(`/communities/${newCommunityId}`);
          
        } else {
          // 尽管后端返回成功状态码，但响应体结构不符合预期
          throw new Error("创建社区成功，但未能获取社区ID，请检查后端配置。");
        }
      } catch (err) {
        console.error("创建社区失败:", err);
        let errorMessage = "创建社区失败，请检查网络或重试。";

        // 增强错误处理逻辑：
        if (err.response) {
            const status = err.response.status;
            const message = err.response.data && err.response.data.message;

            if (status === 401 || status === 403) {
                // 认证/授权失败
                errorMessage = "创建社区需要登录。请先登录您的账户！";
            } else if (status === 400 && message) {
                // 客户端请求错误，例如社区名称不符合规则或已存在
                errorMessage = `创建社区失败: ${message}`;
            } else if (status === 409) {
                // 冲突，例如社区名称已存在
                errorMessage = "创建社区失败: 该名称已存在，请更换一个。";
            } else if (message) {
                 errorMessage = `创建社区失败 (${status}): ${message}`;
            }
        }
        
        alert(errorMessage);
      }
    },
  },
};
</script>

<style scoped>
/* 样式保持不变 */
.create-community-view {
  width: 80%;
  margin: 50px auto;
  padding: 28px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.desc {
  font-size: 15px;
  color: #666;
  margin-bottom: 25px;
}

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

.form-box {
  margin-top: 10px;
}

.input-group {
  margin-bottom: 22px;
}

.input-group label {
  font-size: 14px;
  color: #444;
  margin-bottom: 8px;
  display: block;
}

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