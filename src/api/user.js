// src/api/user.js

// 模拟网络请求延迟 (1秒)
const API_DELAY = 1000;
// 模拟当前登录用户的初始状态，用于返回更新后的数据
let currentUser = { id: 1, name: '当前用户', email: 'current@example.com' };


export default {
  /**
   * 模拟修改用户名 API
   * @param {string} newUsername 
   * @returns {Promise<Object>} 成功时返回包含新用户名的对象
   */
  changeUsername(newUsername) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (newUsername.length < 3) {
          // 模拟校验失败
          reject(new Error('用户名至少需要3个字符'));
        } else if (newUsername.toLowerCase() === 'admin') {
          // 模拟用户名被占用
          reject(new Error('用户名已被占用，请更换'));
        } else {
          // 模拟成功：更新本地模拟状态并返回
          currentUser.name = newUsername;
          console.log(`[Mock API] 用户名更新成功: ${newUsername}`);
          resolve({ ...currentUser }); 
        }
      }, API_DELAY);
    });
  },

  /**
   * 模拟修改邮箱 API
   * @param {string} newEmail 
   * @returns {Promise<Object>} 成功时返回包含新邮箱的对象
   */
  changeEmail(newEmail) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!newEmail.includes('@') || newEmail.length < 5) {
          reject(new Error('邮箱格式不正确'));
        } else {
          // 模拟成功
          currentUser.email = newEmail;
          console.log(`[Mock API] 邮箱更新成功: ${newEmail}`);
          resolve({ ...currentUser });
        }
      }, API_DELAY);
    });
  },

  /**
   * 模拟修改密码 API
   * @param {string} currentPassword 
   * @param {string} newPassword 
   * @returns {Promise<Object>} 成功时返回成功消息
   */
  changePassword(currentPassword, newPassword) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (currentPassword === '错误密码') {
          reject(new Error('当前密码输入错误'));
        } else if (newPassword === currentPassword) {
          reject(new Error('新密码不能与旧密码相同'));
        } else {
          // 模拟成功
          console.log('[Mock API] 密码更新成功');
          resolve({ message: '密码更新成功，请重新登录' });
        }
      }, API_DELAY);
    });
  },

  /**
   * 模拟删除账户 API
   * @returns {Promise<Object>} 成功时返回成功消息
   */
  deleteAccount() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Mock API] 账户删除完成');
        resolve({ message: '账户已成功删除' });
      }, API_DELAY);
    });
  }
};