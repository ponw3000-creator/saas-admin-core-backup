<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserProfile, updateUserPreferences, updateReceptionStatus, changePassword } from '@/mock/index.js'

const isLoading = ref(true)
const isSaving = ref(false)
const profile = reactive({
  id: '',
  name: '',
  email: '',
  phone: '',
  avatar: '',
  role: '',
  roleName: '',
  department: '',
  joinDate: '',
  lastLogin: '',
  receptionStatus: 'offline',
  autoAccept: true,
  maxConcurrent: 5,
  quickRepliesEnabled: true,
  themeColor: '#409EFF',
  aiAnimSpeed: 1.5,
  language: 'zh-CN',
  notificationEnabled: true,
  emailNotify: true,
  smsNotify: false,
  passwordUpdatedAt: '',
  mfaEnabled: true,
  loginDeviceCount: 0
})

onMounted(async () => {
  isLoading.value = true
  try {
    const data = await getUserProfile()
    Object.assign(profile, data)
  } catch (error) {
    ElMessage.error('加载个人中心数据失败')
  } finally {
    isLoading.value = false
  }
})

/**
 * === 客服接待状态调度逻辑 ===
 * [数据链路] 状态更新需通过 API 同步至后端路由引擎，决定派单逻辑。
 * [业务坑位] 注意：前端仅做状态展示，实际的拦截由后端 WebSocket/网关完成。
 */
const handleStatusChange = async (newStatus) => {
  isSaving.value = true
  try {
    // TODO: [API接口预留] const res = await api.put('/user/reception-status', { status: newStatus })
    await updateReceptionStatus(newStatus)
    profile.receptionStatus = newStatus
    ElMessage.success('接待状态更新成功')
  } catch (error) {
    ElMessage.error('网络异常，请重试')
  } finally {
    isSaving.value = false
  }
}

/**
 * === 快捷回复启用逻辑 ===
 * [数据链路] 偏好设置变更通过统一 API 提交至后端用户配置中心。
 */
const handleQuickRepliesToggle = async (enabled) => {
  isSaving.value = true
  try {
    // TODO: [API接口预留] const res = await api.put('/user/preferences', { quickRepliesEnabled: enabled })
    await updateUserPreferences({ quickRepliesEnabled: enabled })
    profile.quickRepliesEnabled = enabled
    ElMessage.success('设置已保存')
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

const handlePreferenceChange = async (key, value) => {
  isSaving.value = true
  try {
    // TODO: [API接口预留] const res = await api.put('/user/preferences', { [key]: value })
    await updateUserPreferences({ [key]: value })
    profile[key] = value
    ElMessage.success('偏好设置已保存')
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

const handleChangePassword = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新密码（至少6位）', '修改密码', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPattern: /.{6,}/,
      inputErrorMessage: '密码长度至少6位'
    })
    isSaving.value = true
    // TODO: [API接口预留] const res = await api.post('/user/change-password', { password: value })
    await changePassword('123456', value)
    ElMessage.success('密码修改成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('密码修改失败，请重试')
    }
  } finally {
    isSaving.value = false
  }
}

const handleLogoutAllDevices = async () => {
  try {
    await ElMessageBox.confirm('确定要注销所有其他设备的登录状态吗？', '安全提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    isSaving.value = true
    // TODO: [API接口预留] const res = await api.post('/user/logout-all-devices')
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('已注销所有其他设备的登录状态')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败，请重试')
    }
  } finally {
    isSaving.value = false
  }
}

const receptionStatusOptions = [
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' },
  { label: '忙碌', value: 'busy' },
  { label: '离开', value: 'away' }
]
</script>

<template>
  <div class="profile-container">
    <div v-if="isLoading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else class="profile-content">
      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">基础信息</span>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ profile.name }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ profile.roleName }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ profile.department }}</el-descriptions-item>
          <el-descriptions-item label="入职日期">{{ profile.joinDate }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ profile.email }}</el-descriptions-item>
          <el-descriptions-item label="手机">{{ profile.phone }}</el-descriptions-item>
          <el-descriptions-item label="最后登录" :span="2">{{ profile.lastLogin }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">接待设置</span>
          </div>
        </template>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">接待状态</span>
              <span class="setting-desc">当前自动分配的会话将根据此状态进行路由</span>
            </div>
            <el-select
              v-model="profile.receptionStatus"
              :loading="isSaving"
              style="width: 120px"
              @change="handleStatusChange"
            >
              <el-option
                v-for="item in receptionStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">自动接受会话</span>
              <span class="setting-desc">开启后，系统将自动接受分配的新会话</span>
            </div>
            <el-switch
              v-model="profile.autoAccept"
              :loading="isSaving"
              @change="(val) => handlePreferenceChange('autoAccept', val)"
            />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">最大同时接待数</span>
              <span class="setting-desc">允许同时进行的最大会话数量</span>
            </div>
            <el-input-number
              v-model="profile.maxConcurrent"
              :min="1"
              :max="10"
              :disabled="isSaving"
              @change="(val) => handlePreferenceChange('maxConcurrent', val)"
            />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">快捷回复</span>
              <span class="setting-desc">启用后可在聊天时使用 / 快捷触发回复</span>
            </div>
            <el-switch
              v-model="profile.quickRepliesEnabled"
              :loading="isSaving"
              @change="handleQuickRepliesToggle"
            />
          </div>
        </div>
      </el-card>

      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">偏好设置</span>
          </div>
        </template>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">主题颜色</span>
              <span class="setting-desc">界面全局主题色</span>
            </div>
            <el-color-picker
              v-model="profile.themeColor"
              :disabled="isSaving"
              @change="(val) => handlePreferenceChange('themeColor', val)"
            />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">AI 动画速度</span>
              <span class="setting-desc">AI 思考中动画的播放速度（秒）</span>
            </div>
            <el-input-number
              v-model="profile.aiAnimSpeed"
              :min="0.5"
              :max="3"
              :step="0.5"
              :disabled="isSaving"
              @change="(val) => handlePreferenceChange('aiAnimSpeed', val)"
            />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">语言</span>
              <span class="setting-desc">界面显示语言</span>
            </div>
            <el-select
              v-model="profile.language"
              :disabled="isSaving"
              style="width: 150px"
              @change="(val) => handlePreferenceChange('language', val)"
            >
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
            </el-select>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">消息通知</span>
              <span class="setting-desc">开启后有新消息时桌面通知</span>
            </div>
            <el-switch
              v-model="profile.notificationEnabled"
              :loading="isSaving"
              @change="(val) => handlePreferenceChange('notificationEnabled', val)"
            />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">邮件通知</span>
              <span class="setting-desc">有新通知时发送邮件提醒</span>
            </div>
            <el-switch
              v-model="profile.emailNotify"
              :loading="isSaving"
              @change="(val) => handlePreferenceChange('emailNotify', val)"
            />
          </div>
        </div>
      </el-card>

      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">账号安全</span>
          </div>
        </template>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">登录密码</span>
              <span class="setting-desc">上次修改于 {{ profile.passwordUpdatedAt }}</span>
            </div>
            <el-button
              type="primary"
              :loading="isSaving"
              @click="handleChangePassword"
            >
              修改密码
            </el-button>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">两步验证</span>
              <span class="setting-desc">启用后登录需输入手机验证码</span>
            </div>
            <el-switch
              v-model="profile.mfaEnabled"
              :loading="isSaving"
              disabled
            />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">登录设备</span>
              <span class="setting-desc">当前共有 {{ profile.loginDeviceCount }} 台设备登录</span>
            </div>
            <el-button
              type="warning"
              :loading="isSaving"
              @click="handleLogoutAllDevices"
            >
              注销其他设备
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 900px;
  margin: 0 auto;
}

.loading-container {
  padding: 20px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.setting-desc {
  font-size: 12px;
  color: #909399;
}
</style>
