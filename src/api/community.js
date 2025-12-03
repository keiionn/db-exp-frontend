// src/api/community.js

const API_DELAY = 500;
const mockCommunityData = {
    vue: {
        id: 1,
        name: 'vue',
        title: 'Vue.js 开发者社区',
        description: '讨论 Vue.js 框架、生态系统和最佳实践。',
        subscribers: 15000,
        isSubscribed: false
    },
    tech: {
        id: 2,
        name: 'tech',
        title: '前沿科技讨论',
        description: '分享最新的技术新闻和深度分析。',
        subscribers: 25000,
        isSubscribed: true
    }
};

const mockPosts = [
    { id: 101, communityName: 'vue', title: 'Vue 3.5 新功能展望', content: '期待 Composition API 的进一步优化...', upvotes: 450, comments: 20 },
    { id: 102, communityName: 'tech', title: 'AI 伦理的未来挑战', content: '我们该如何规范大模型的使用？', upvotes: 800, comments: 55 },
    { id: 103, communityName: 'vue', title: '如何优化 Vue 组件渲染性能？', content: '分享一个 useMemo 替代方案。', upvotes: 320, comments: 12 },
];


export default {
    /**
     * 社区详情和帖子列表 API
     * @param {string} communityName - 社区名称 (e.g., 'vue')
     * @returns {Promise<Object>} 包含社区详情和帖子列表
     */
    getCommunityDetails(communityName) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const community = mockCommunityData[communityName];
                if (community) {
                    const posts = mockPosts.filter(p => p.communityName === communityName);
                    // 假设用户ID为1
                    community.isSubscribed = communityName === 'tech'; 

                    resolve({
                        community,
                        posts
                    });
                } else {
                    reject(new Error(`社区 "${communityName}" 不存在`));
                }
            }, API_DELAY);
        });
    },

    /**
     * 订阅 API
     * @param {string} communityName 
     */
    subscribe(communityName) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 模拟订阅成功，更新状态
                if (mockCommunityData[communityName]) {
                    mockCommunityData[communityName].isSubscribed = true;
                    mockCommunityData[communityName].subscribers += 1;
                }
                resolve({ success: true, isSubscribed: true });
            }, API_DELAY);
        });
    },

    /**
     * 取消订阅 API
     * @param {string} communityName 
     */
    unsubscribe(communityName) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 模拟取消订阅成功，更新状态
                if (mockCommunityData[communityName]) {
                    mockCommunityData[communityName].isSubscribed = false;
                    mockCommunityData[communityName].subscribers -= 1;
                }
                resolve({ success: true, isSubscribed: false });
            }, API_DELAY);
        });
    },
    
    // 帖子创建 API (简化，只打印日志)
    createPost(communityName, postData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[Mock API] 在 ${communityName} 创建帖子:`, postData.title);
                resolve({ success: true, postId: Date.now() });
            }, API_DELAY);
        });
    }
};