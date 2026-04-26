// [业务规范] 用户个人中心数据 - 纯数据，无响应式包装
export const userProfileMockData = {
  id: 1,
  name: '张三',
  email: 'zhangsan@company.com',
  phone: '138****8888',
  avatar: '',
  role: 'super_admin',
  roleName: '超级管理员',
  department: '客服部',
  joinDate: '2023-06-15',
  lastLogin: '2024-01-20 14:32:18',
  receptionStatus: 'online',
  autoAccept: true,
  maxConcurrent: 5,
  quickRepliesEnabled: true,
  themeColor: '#409EFF',
  aiAnimSpeed: 1.5,
  language: 'zh-CN',
  notificationEnabled: true,
  emailNotify: true,
  smsNotify: false,
  passwordUpdatedAt: '2023-12-01',
  mfaEnabled: true,
  loginDeviceCount: 3
}

// [API-Ready] 获取用户个人中心数据
// TODO: [API对接] 未来将下面替换为: const res = await api.get('/user/profile'); return res.data
export const getUserProfile = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return { ...userProfileMockData }
}

// [API-Ready] 更新用户偏好设置
// TODO: [API对接] 未来将下面替换为: const res = await api.put('/user/preferences', data); return res.data
export const updateUserPreferences = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  Object.assign(userProfileMockData, data)
  return { success: true }
}

// [API-Ready] 更新接待状态
// TODO: [API对接] 未来将下面替换为: const res = await api.put('/user/reception-status', data); return res.data
export const updateReceptionStatus = async (status) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  userProfileMockData.receptionStatus = status
  return { success: true }
}

// [API-Ready] 更新密码
// TODO: [API对接] 未来将下面替换为: const res = await api.post('/user/change-password', data); return res.data
export const changePassword = async (oldPassword, newPassword) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  if (oldPassword !== '123456') {
    throw new Error('原密码错误')
  }
  userProfileMockData.passwordUpdatedAt = new Date().toISOString().split('T')[0]
  return { success: true }
}
