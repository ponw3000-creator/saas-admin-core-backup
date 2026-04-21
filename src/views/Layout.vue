<script setup>
import { computed, onMounted } from 'vue'
import {
  ChatDotRound,
  Tickets,
  DataLine,
  Setting,
  UserFilled,
  OfficeBuilding,
  InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useChatStore } from '@/store/chatStore'
import { hasMenuPermission } from '@/utils/permission'
import Watermark from '@/components/Watermark.vue'
import ProAvatar from '@/components/ProAvatar/index.vue'

const chatStore = useChatStore()
const isSuperAdmin = computed(() => chatStore.currentUserRole === 'super_admin')

const roleLabels = {
  super_admin: '超级管理员',
  admin: '管理员',
  leader: '主管',
  agent: '客服'
}

const currentUserName = computed(() => roleLabels[chatStore.currentUserRole] || '客服')

const MENU_MAP = {
  chat: 'menu:chat',
  ticket: 'menu:ticket',
  dashboard: 'menu:dashboard',
  preferences: 'menu:preferences',
  ai: 'menu:ai',
  llm: 'menu:llm',
  knowledge: 'menu:knowledge',
  team: 'menu:team',
  role: 'menu:role',
  oplog: 'menu:oplog',
  dictionary: 'menu:dictionary',
  channel: 'menu:channel'
}

const checkMenu = (menuKey) => {
  if (isSuperAdmin.value) return true
  const permCode = MENU_MAP[menuKey]
  if (!permCode) return true
  return hasMenuPermission(permCode)
}

const visibleMenus = computed(() => ({
  ai: checkMenu('ai'),
  llm: checkMenu('llm'),
  knowledge: checkMenu('knowledge'),
  team: checkMenu('team'),
  role: checkMenu('role'),
  oplog: checkMenu('oplog'),
  dictionary: checkMenu('dictionary'),
  channel: checkMenu('channel')
}))

const handleRoleChange = async (newRole) => {
  chatStore.switchRole(newRole)
  const roleLabels = {
    super_admin: '超级管理员',
    admin: '管理员',
    leader: '主管',
    agent: '客服'
  }
  ElMessage.success(`已切换至 ${roleLabels[newRole] || newRole} 身份，系统正在重新加载...`)
  setTimeout(() => {
    window.location.reload()
  }, 500)
}

onMounted(() => {
  chatStore.initFromStorage()
})
</script>

<template>
  <el-container class="layout-container">
    <Watermark />
    <el-header class="header">
      <div class="header-left">
        <span class="logo-text">企业级 SaaS 客服工作台</span>
      </div>
      <div class="header-right">
        <div class="role-switch">
          <span class="role-label">角色：</span>
          <el-select
            v-model="chatStore.currentUserRole"
            size="small"
            style="width: 120px;"
            @change="handleRoleChange"
          >
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="管理员" value="admin" />
            <el-option label="主管" value="leader" />
            <el-option label="客服" value="agent" />
          </el-select>
          <el-input
            v-model="chatStore.currentUserPath"
            size="small"
            style="width: 100px; margin-left: 8px;"
            placeholder="path"
            @change="chatStore.setUserPath($event)"
          />
        </div>
        <el-dropdown>
          <span class="user-info">
            <ProAvatar :name="currentUserName" :size="28" />
            <span style="margin-left: 8px;">{{ currentUserName }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container class="body-container">
      <el-aside width="200px" class="sidebar">
        <el-menu
          :default-active="$route.path"
          class="sidebar-menu"
          router
          background-color="#1e222d"
          text-color="#8b8fa3"
          active-text-color="#409eff"
          :ellipsis="false"
        >
          <el-sub-menu index="1">
            <template #title>
              <el-icon><ChatDotRound /></el-icon>
              <span>会话工作台</span>
            </template>
            <el-menu-item index="/chat">当前接待</el-menu-item>
            <el-menu-item index="/chat?tab=history">历史会话</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="2">
            <template #title>
              <el-icon><Tickets /></el-icon>
              <span>工单系统</span>
            </template>
            <el-menu-item index="/ticket">我的待办</el-menu-item>
            <el-menu-item index="/ticket">工单大厅</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="3">
            <template #title>
              <el-icon><DataLine /></el-icon>
              <span>数据看板</span>
            </template>
            <el-menu-item index="/dashboard/realtime">实时大屏</el-menu-item>
            <el-menu-item index="/dashboard/performance">AI 效能分析</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="4">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </template>
            <el-menu-item index="/setting/enterprise">
              企业资料
            </el-menu-item>
            <el-menu-item index="/setting/security">
              安全中心
            </el-menu-item>
            <el-menu-item index="/setting">基础偏好</el-menu-item>
            <el-menu-item
              v-if="visibleMenus.ai"
              index="/setting/ai"
            >AI 模型配置</el-menu-item>
            <el-menu-item
              v-if="visibleMenus.llm"
              index="/setting/llm"
            >LLM 基座配置</el-menu-item>
            <el-menu-item index="/setting/knowledge">知识与话术</el-menu-item>
            <el-menu-item
              v-if="visibleMenus.team"
              index="/setting/team"
            >团队与权限</el-menu-item>
            <el-menu-item
              v-if="visibleMenus.role"
              index="/setting/role"
            >角色管理</el-menu-item>
            <el-menu-item
              v-if="visibleMenus.oplog"
              index="/setting/oplog"
            >操作日志</el-menu-item>
            <el-menu-item
              v-if="visibleMenus.channel"
              index="/setting/channel"
            >渠道接入</el-menu-item>
            <el-menu-item
              v-if="visibleMenus.dictionary"
              index="/setting/dict"
            >字典管理</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
  min-width: 1024px;
  overflow-x: auto;
  overflow-y: hidden;
}

.header {
  background-color: #1e222d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 56px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.role-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.role-label {
  font-size: 13px;
  color: #8b8fa3;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8b8fa3;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.body-container {
  height: calc(100vh - 56px);
}

.sidebar {
  background-color: #1e222d;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu {
  border-right: none;
  background-color: #1e222d;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu::-webkit-scrollbar {
  display: none;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}

.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-track {
  background-color: #f0f2f5;
}
</style>
