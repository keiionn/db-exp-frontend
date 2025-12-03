module.exports = {
  root: true,
  env: { node: true },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    'prettier'
  ],
  rules: {
    'vue/multi-word-component-names': 'off' // 关闭组件名多单词警告
  }
};