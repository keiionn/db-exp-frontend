import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// 导入必需的 View 组件
import LoginView from '@/views/LoginView.vue'
import CommunityDetailView from '@/views/CommunityDetailView.vue'
import PostDetailView from '@/views/PostDetailView.vue'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
    //登录的路由
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue')
    //注册用户的路由
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true }
    //首页的路由
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
    //个人主页的路由
  },
  {
    path: '/community/:name',
    name: 'CommunityDetail',
    component: () => import('@/views/CommunityDetailView.vue')
    // 社区详情路由
  },
  {
    path: '/community/:name/post/:id',
    name: 'PostDetail',
    component: PostDetailView 
    //帖子的路由
  },
  {
    path: '/createcommunity',
    name: 'createcommunity',
    component: () => import('@/views/CreateCommunityView.vue'),
    meta: { requiresAuth: true }
    //创建社区的路由
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
    //404
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫 (逻辑非常完善，仅调整打印信息)
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated
  // 打印信息更简洁
  // console.log(`路由守卫: 目标路径=${to.path}, 认证状态=${isAuthenticated}`)

  // 1. 如果用户已登录，并且尝试访问登录或注册页，重定向到主页
  if (isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    next({ name: 'Home' })
    return
  }

  // 2. 检查目标路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      // 未认证，重定向到登录页
      // console.log('未认证，重定向到登录页')
      next('/login')
    } else {
      // 已认证，放行
      // console.log('已认证，放行')
      next()
    }
  } else {
    // 3. 不需要认证的路由直接放行
    // console.log('无需认证的路由，放行')
    next() 
  }
})

export default router