import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    component: () => import('@/views/Auth.vue'),
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('@/views/Login.vue')
      }
    ]
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/chat',
    children: [
      {
        path: 'chat',
        name: 'Chat',
        meta: { title: '当前接待', permission: 'menu:chat' },
        component: () => import('@/views/Chat/index.vue')
      },
      {
        path: 'ticket',
        name: 'Ticket',
        meta: { title: '工单系统', permission: 'menu:ticket' },
        component: () => import('@/views/Ticket/index.vue')
      },
      {
        path: 'dashboard/realtime',
        name: 'Realtime',
        meta: { title: '实时大屏', permission: 'menu:dashboard' },
        component: () => import('@/views/Dashboard/Realtime.vue')
      },
      {
        path: 'dashboard/performance',
        name: 'AIPerformance',
        meta: { title: 'AI 效能分析', permission: 'menu:dashboard' },
        component: () => import('@/views/Dashboard/AIPerformance.vue')
      },
      {
        path: 'setting',
        name: 'Preferences',
        meta: { title: '基础偏好', permission: 'menu:preferences' },
        component: () => import('@/views/Setting/Preferences.vue')
      },
      {
        path: 'setting/enterprise',
        name: 'Enterprise',
        meta: { title: '企业资料', permission: 'menu:enterprise' },
        component: () => import('@/views/Setting/Enterprise.vue')
      },
      {
        path: 'setting/security',
        name: 'Security',
        meta: { title: '安全中心', permission: 'menu:security' },
        component: () => import('@/views/Setting/Security.vue')
      },
      {
        path: 'setting/ai',
        name: 'AiConfig',
        meta: { title: 'AI 模型配置', permission: 'menu:ai' },
        component: () => import('@/views/Setting/AiConfig.vue')
      },
      {
        path: 'setting/llm',
        name: 'LLMConfig',
        meta: { title: 'LLM 基座配置', permission: 'menu:llm' },
        component: () => import('@/views/Setting/LLMConfig.vue')
      },
      {
        path: 'setting/knowledge',
        name: 'Knowledge',
        meta: { title: '知识与话术', permission: 'menu:knowledge' },
        component: () => import('@/views/Setting/Knowledge.vue')
      },
      {
        path: 'setting/team',
        name: 'Team',
        meta: { title: '团队与权限', permission: 'menu:team' },
        component: () => import('@/views/Setting/Team.vue')
      },
      {
        path: 'setting/role',
        name: 'Role',
        meta: { title: '角色管理', permission: 'menu:role' },
        component: () => import('@/views/Setting/Role.vue')
      },
      {
        path: 'setting/oplog',
        name: 'OpLog',
        meta: { title: '操作日志', permission: 'menu:oplog' },
        component: () => import('@/views/Setting/OpLog.vue')
      },
      {
        path: 'setting/dict',
        name: 'Dictionary',
        meta: { title: '字典管理', permission: 'menu:dictionary' },
        component: () => import('@/views/Setting/Dictionary.vue')
      },
      {
        path: 'setting/channel',
        name: 'ChannelSetting',
        meta: { title: '渠道接入', permission: 'menu:channel' },
        component: () => import('@/views/Setting/Channel.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        meta: { title: '个人中心' },
        component: () => import('@/views/Profile/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
