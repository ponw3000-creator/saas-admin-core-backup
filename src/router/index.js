import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/chat',
    children: [
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/Chat/index.vue')
      },
      {
        path: 'ticket',
        name: 'Ticket',
        component: () => import('@/views/Ticket/index.vue')
      },
      {
        path: 'dashboard/realtime',
        name: 'Realtime',
        component: () => import('@/views/Dashboard/Realtime.vue')
      },
      {
        path: 'dashboard/performance',
        name: 'AIPerformance',
        component: () => import('@/views/Dashboard/AIPerformance.vue')
      },
      {
        path: 'setting',
        name: 'Preferences',
        component: () => import('@/views/Setting/Preferences.vue')
      },
      {
        path: 'setting/ai',
        name: 'AiConfig',
        component: () => import('@/views/Setting/AiConfig.vue')
      },
      {
        path: 'setting/llm',
        name: 'LLMConfig',
        component: () => import('@/views/Setting/LLMConfig.vue')
      },
      {
        path: 'setting/knowledge',
        name: 'Knowledge',
        component: () => import('@/views/Setting/Knowledge.vue')
      },
      {
        path: 'setting/team',
        name: 'Team',
        component: () => import('@/views/Setting/Team.vue')
      },
      {
        path: 'setting/role',
        name: 'Role',
        component: () => import('@/views/Setting/Role.vue')
      },
      {
        path: 'setting/oplog',
        name: 'OpLog',
        component: () => import('@/views/Setting/OpLog.vue')
      },
      {
        path: 'setting/dict',
        name: 'Dictionary',
        component: () => import('@/views/Setting/Dictionary.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router