<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { Plus, QuestionFilled, Setting, MoreFilled, Rank, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useConfirmDelete } from '@/utils/useConfirmDelete'
import { useChannelStore } from '@/store/channelStore'
import { useChatStore } from '@/store/chatStore'
import { ROLE_WEIGHT_MAP } from '@/store/chatStore'
import { checkPermission, buildQueryParams } from '@/utils/permission'
import ProAvatar from '@/components/ProAvatar/index.vue'

const { confirmDelete } = useConfirmDelete()
const chatStore = useChatStore()
const channelStore = useChannelStore()

const CHANNEL_DICT = {
  'WX_MINI': '微信小程序',
  'WEB': 'Web网页端',
  'APP': 'APP原生端',
  'H5': 'H5移动端',
  'DOUYIN': '抖音客服',
  'XHS': '小红书店铺',
  'WX_GZH': '微信公众号'
}

const CHANNEL_DICT_OPTIONS = Object.entries(CHANNEL_DICT).map(([value, label]) => ({ label, value }))

const groupListData = reactive([
  { id: 1, name: '售前咨询组', memberCount: 5 },
  { id: 2, name: '售后支持组', memberCount: 8 },
  { id: 3, name: '大客户服务组', memberCount: 3 }
])

const getGroupNames = (groupIds) => {
  if (!groupIds || groupIds.length === 0) return '-'
  return groupIds.map(id => groupListData.find(g => g.id === id)?.name || '').filter(Boolean).join('、')
}

const groupOptions = computed(() =>
  groupListData.map(g => ({ label: g.name, value: g.id }))
)

const tableData = reactive([
  {
    id: 1,
    account: 'admin@company.com',
    realName: '张明',
    nickName: '小明',
    group: '售前',
    groupIds: [1, 2],
    path: '1.2.3',
    weight: 80,
    roleAssignments: [
      { roleId: '1', expireType: 'permanent', startTime: '', endTime: '' },
      { roleId: '2', expireType: 'limited', startTime: '2026-01-01 00:00:00', endTime: '2026-12-31 23:59:59' }
    ],
    channel: '微信',
    channels: [1, 2, 3],
    maxConcurrent: 10,
    online: true,
    isArchived: false,
    status: 'active',
    joinDate: '2024-01-15',
    gender: '男'
  },
  {
    id: 2,
    account: 'pending@company.com',
    realName: '李娜',
    nickName: '娜美',
    group: '售后',
    groupIds: [],
    path: '1.2.3.4',
    weight: 10,
    roleAssignments: [
      { roleId: '3', expireType: 'permanent', startTime: '', endTime: '' }
    ],
    channel: '官网',
    channels: [1, 2],
    maxConcurrent: 5,
    online: false,
    isArchived: false,
    status: 'inactive',
    joinDate: '2024-03-20',
    gender: '女'
  },
  {
    id: 3,
    account: 'expired@company.com',
    realName: '王浩',
    nickName: '浩哥',
    group: '技术',
    groupIds: [3],
    path: '1.2.3.5',
    weight: 10,
    roleAssignments: [
      { roleId: '3', expireType: 'limited', startTime: '2024-01-01 00:00:00', endTime: '2024-12-31 23:59:59' },
      { roleId: '4', expireType: 'permanent', startTime: '', endTime: '' }
    ],
    channel: 'App',
    channels: [4],
    maxConcurrent: 3,
    online: false,
    isArchived: false,
    status: 'active',
    joinDate: '2024-02-10',
    gender: '男'
  },
  {
    id: 4,
    account: 'disabled@company.com',
    realName: '陈婷',
    nickName: '婷婷',
    group: '售前',
    groupIds: [1],
    path: '1.2.6',
    weight: 10,
    roleAssignments: [
      { roleId: '4', expireType: 'permanent', startTime: '', endTime: '' }
    ],
    channel: '微信',
    channels: [1],
    maxConcurrent: 5,
    online: false,
    isArchived: false,
    status: 'disabled',
    joinDate: '2023-11-05',
    gender: '女'
  },
  {
    id: 5,
    account: 'liuyang@company.com',
    realName: '刘洋',
    nickName: '洋洋',
    group: '售后',
    groupIds: [2],
    path: '1.2.7',
    weight: 10,
    roleAssignments: [
      { roleId: '4', expireType: 'permanent', startTime: '', endTime: '' }
    ],
    channel: '官网',
    channels: [3],
    maxConcurrent: 8,
    online: true,
    isArchived: false,
    status: 'active',
    joinDate: '2024-05-01',
    gender: '男'
  },
  {
    id: 6,
    account: 'zhaomei@company.com',
    realName: '赵美',
    nickName: '小美',
    group: '售前',
    groupIds: [1],
    path: '1.2.8',
    weight: 10,
    roleAssignments: [
      { roleId: '4', expireType: 'permanent', startTime: '', endTime: '' }
    ],
    channel: 'App',
    channels: [4, 5],
    maxConcurrent: 6,
    online: true,
    isArchived: false,
    status: 'active',
    joinDate: '2024-06-15',
    gender: '女'
  },
  {
    id: 7,
    account: 'sunwei@company.com',
    realName: '孙伟',
    nickName: '伟哥',
    group: '技术',
    groupIds: [3],
    path: '1.2.9',
    weight: 10,
    roleAssignments: [
      { roleId: '4', expireType: 'permanent', startTime: '', endTime: '' }
    ],
    channel: '微信',
    channels: [1, 4],
    maxConcurrent: 4,
    online: false,
    isArchived: false,
    status: 'active',
    joinDate: '2024-07-22',
    gender: '男'
  },
  {
    id: 8,
    account: 'zhoujing@company.com',
    realName: '周静',
    nickName: '静静',
    group: '售后',
    groupIds: [2],
    path: '1.2.10',
    weight: 10,
    roleAssignments: [
      { roleId: '3', expireType: 'limited', startTime: '2024-09-01 00:00:00', endTime: '2025-09-01 23:59:59' }
    ],
    channel: '官网',
    channels: [2, 3],
    maxConcurrent: 5,
    online: true,
    isArchived: false,
    status: 'active',
    joinDate: '2024-08-30',
    gender: '女'
  }
])

const dialogVisible = ref(false)
const isGroupDrawerVisible = ref(false)
const filterView = ref('all')
const isEdit = ref(false)
const currentEditId = ref(null)
const currentEditRow = computed(() => tableData.find(item => item.id === currentEditId.value) || null)
const searchKeyword = ref('')
const isAdvancedVisible = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const filterSchema = ref([
  {
    key: 'group',
    label: '客服组别',
    type: 'select',
    options: groupOptions
  },
  {
    key: 'channel',
    label: '所属渠道',
    type: 'select',
    options: CHANNEL_DICT_OPTIONS
  },
  {
    key: 'joinDate',
    label: '入职时间',
    type: 'daterange'
  },
  {
    key: 'gender',
    label: '性别',
    type: 'select',
    options: [
      { label: '男', value: '男' },
      { label: '女', value: '女' }
    ]
  }
])

const activeFilterFields = ref(filterSchema.value.map(f => f.key))

const filterForm = reactive(
  filterSchema.value.reduce((acc, field) => {
    acc[field.key] = field.type === 'daterange' ? [] : ''
    return acc
  }, {})
)

const resetFilters = () => {
  searchKeyword.value = ''
  filterSchema.value.forEach(field => {
    filterForm[field.key] = field.type === 'daterange' ? [] : ''
  })
  currentPage.value = 1
}

const defaultForm = () => ({
  avatar: '',
  account: '',
  realName: '',
  nickName: '',
  groupIds: [],
  roleAssignments: [],
  channels: [],
  maxConcurrent: 5
})

const form = reactive(defaultForm())

const formRef = ref(null)

const validateAccount = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入员工手机号或邮箱'))
  }
  const phoneRegex = /^1[3-9]\d{9}$/
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (phoneRegex.test(value) || emailRegex.test(value)) {
    callback()
  } else {
    callback(new Error('请输入正确的手机号或有效邮箱格式'))
  }
}

const formRules = reactive({
  account: [
    { required: true, message: '登录账号不能为空', trigger: 'blur' },
    { validator: validateAccount, trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { type: 'string', min: 2, message: '真实姓名至少 2 个字符', trigger: 'blur' }
  ],
  maxConcurrent: [
    { required: true, message: '接待上限不能为空', trigger: 'blur' },
    { type: 'number', min: 1, max: 20, message: '接待上限必须在 1 到 20 之间', trigger: ['blur', 'change'] }
  ]
})

const unassignedCount = computed(() => {
  return tableData.filter(item => !item.groupIds || item.groupIds.length === 0).length
})

// [业务规范] 采用软删除而非物理删除，以确保历史会话数据在报表端的关联完整性。
// 已归档账号（isArchived === true）不出现在主列表中，但数据仍可通过专属查询访问。
const filteredTableData = computed(() => {
  let data = tableData.filter(item => item.isArchived !== true)

  if (filterView.value === 'unassigned') {
    data = data.filter(item => !item.groupIds || item.groupIds.length === 0)
  }

  if (chatStore.currentUserRole !== 'super_admin') {
    data = data.filter(item => {
      return checkPermission(
        { role: chatStore.currentUserRole, path: chatStore.currentUserPath },
        { role: item.roleAssignments?.[0]?.roleId, path: item.path, weight: item.weight }
      )
    })
  }

  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    data = data.filter(row => {
      const nickNameMatch = (row.nickName || '').toLowerCase().includes(kw)
      const accountMatch = (row.account || '').toLowerCase().includes(kw)
      const roleMatch = row.roleAssignments.some(a => {
        const label = getRoleLabel(a.roleId).toLowerCase()
        return label.includes(kw)
      })
      return nickNameMatch || accountMatch || roleMatch
    })
  }

  filterSchema.value.forEach(field => {
    const value = filterForm[field.key]
    if (!value || (Array.isArray(value) && value.length === 0)) return
    if (field.type === 'select') {
      data = data.filter(item => item[field.key] === value)
    } else if (field.type === 'daterange') {
      const [start, end] = value
      data = data.filter(item => {
        if (!item[field.key]) return false
        const t = new Date(item[field.key]).getTime()
        return t >= new Date(start).getTime() && t <= new Date(end).getTime()
      })
    }
  })

  return data
})

watch(
  () => filterSchema.value.map(f => filterForm[f.key]),
  () => { currentPage.value = 1 },
  { deep: true }
)

watch(
  activeFilterFields,
  (val) => {
    try {
      localStorage.setItem('TEAM_ACTIVE_FILTERS', JSON.stringify(val))
    } catch (e) {}
  },
  { deep: true }
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTableData.value.slice(start, end)
})

const totalCount = computed(() => filteredTableData.value.length)

const apiQueryParams = computed(() => {
  return buildQueryParams({
    role: chatStore.currentUserRole,
    path: chatStore.currentUserPath
  })
})
const roleOptions = [
  { label: '超级管理员', value: '1', roleKey: 'super_admin', weight: 100 },
  { label: '管理员', value: '2', roleKey: 'admin', weight: 80 },
  { label: '主管', value: '3', roleKey: 'leader', weight: 50 },
  { label: '客服', value: '4', roleKey: 'agent', weight: 10 }
]

const assignableRoles = computed(() => {
  const currentWeight = chatStore.currentUserWeight || 0

  return roleOptions.filter(role => {
    const isNotSuperAdmin = role.roleKey !== 'super_admin'
    const isLowerWeight = role.weight < currentWeight
    return isNotSuperAdmin && isLowerWeight
  })
})

const defaultTime = ref([new Date(), new Date()])

const startTimeShortcuts = [
  {
    text: '从此刻起',
    value: () => new Date()
  }
]

const dataScopeOptions = [
  { label: '本人', value: 1 },
  { label: '全组', value: 2 },
  { label: '全部', value: 3 }
]

const getRoleLabel = (roleId) => {
  return roleOptions.find(r => r.value === roleId)?.label || roleId
}

const isRoleExpired = (assignment) => {
  if (assignment.expireType === 'permanent') return false
  if (!assignment.endTime) return false
  return new Date(assignment.endTime) < new Date()
}

const getStatusType = (status) => {
  const map = {
    active: 'success',
    inactive: 'warning',
    expired: 'danger',
    disabled: 'info'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    active: '正常',
    inactive: '待激活',
    expired: '已过期',
    disabled: '已停用'
  }
  return map[status] || '未知'
}

// [业务规范] 账号 expired（过期）为不可逆终结状态，不提供续期操作。
// inactive（待激活）可执行撤销并删除（isArchived）；disabled（已停用）可重新启用。
const getActionMenuItems = (row) => {
  const status = row.status
  if (status === 'active') {
    return [
      { key: 'resetPwd', label: '重置密码', danger: false },
      { key: 'disable', label: '停用', danger: true }
    ]
  }
  if (status === 'inactive') {
    return [
      { key: 'resend', label: '重发邀请', danger: false, primary: true },
      { key: 'cancel', label: '撤销并删除', danger: true }
    ]
  }
  if (status === 'expired') {
    // [业务规范] expired 是终态，只能查看，不可续期、不可撤销、不可停用
    return []
  }
  if (status === 'disabled') {
    return [
      { key: 'resetPwd', label: '重置密码', danger: false, disabled: true, disabledTip: '账号已停用，请先启用' },
      { key: 'enable', label: '启用', danger: false, primary: true }
    ]
  }
  return []
}

const handleMenuAction = (row, action) => {
  if (action === 'resetPwd') {
    handleResetPassword(row)
  } else if (action === 'resend') {
    handleResendInvite(row)
  } else if (action === 'disable') {
    handleToggleStatus(row)
  } else if (action === 'enable') {
    handleToggleStatus(row)
  } else if (action === 'cancel') {
    handleCancelInvite(row)
  } else if (action === 'renew') {
    handleRenewAccount(row)
  }
}

const columnsConfig = ref([
  { key: 'avatar', label: '头像', visible: true, width: 80 },
  { key: 'account', label: '账号', visible: true, minWidth: 200 },
  { key: 'groups', label: '所属分组', visible: true, minWidth: 140 },
  { key: 'nickName', label: '对外昵称', visible: true, minWidth: 120 },
  { key: 'roles', label: '系统角色', visible: true, minWidth: 200 },
  { key: 'channels', label: '接待渠道', visible: true, minWidth: 240 },
  { key: 'status', label: '状态', visible: true, width: 100 },
  { key: 'actions', label: '操作', visible: true, width: 100, fixed: 'right' }
])

const loadColumnsConfig = () => {
  try {
    const saved = localStorage.getItem('AGENT_TABLE_COLUMNS')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const reorderedColumns = []
        parsed.forEach(cachedCol => {
          const defaultCol = columnsConfig.value.find(c => c.key === cachedCol.key)
          if (defaultCol) {
            reorderedColumns.push({ ...defaultCol, visible: cachedCol.visible !== false })
          }
        })
        columnsConfig.value.forEach(defaultCol => {
          if (!reorderedColumns.find(c => c.key === defaultCol.key)) {
            reorderedColumns.push(defaultCol)
          }
        })
        columnsConfig.value = reorderedColumns
      }
    }
  } catch (error) {
    console.error('加载列配置失败', error)
  }
}

watch(
  () => columnsConfig.value,
  (newVal) => {
    try {
      localStorage.setItem('AGENT_TABLE_COLUMNS', JSON.stringify(newVal))
    } catch (e) {}
  },
  { deep: true }
)

const saveColumnsConfig = () => {
  try {
    const toSave = columnsConfig.value.map(c => ({
      key: c.key,
      visible: c.visible
    }))
    localStorage.setItem('AGENT_TABLE_COLUMNS', JSON.stringify(toSave))
  } catch (e) {}
}

let dragSrcIndex = -1

const onDragStart = (index) => {
  dragSrcIndex = index
}

const onDragEnter = (index) => {
  if (dragSrcIndex === -1 || dragSrcIndex === index) return
  const arr = [...columnsConfig.value]
  const [removed] = arr.splice(dragSrcIndex, 1)
  arr.splice(index, 0, removed)
  dragSrcIndex = index
  columnsConfig.value = arr
}

const onDragEnd = () => {
  dragSrcIndex = -1
  saveColumnsConfig()
}

const toggleColumnVisible = (key) => {
  const col = columnsConfig.value.find(c => c.key === key)
  if (col) {
    col.visible = !col.visible
    saveColumnsConfig()
  }
}

onMounted(() => {
  loadColumnsConfig()

  try {
    const filterSaved = localStorage.getItem('TEAM_ACTIVE_FILTERS')
    if (filterSaved) {
      const parsed = JSON.parse(filterSaved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        activeFilterFields.value = parsed
      }
    }
  } catch (e) {
    localStorage.removeItem('TEAM_ACTIVE_FILTERS')
  }
})

const handleAdd = () => {
  Object.assign(form, defaultForm())
  isEdit.value = false
  currentEditId.value = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, {
    avatar: row.avatar || '',
    account: row.account,
    realName: row.realName,
    nickName: row.nickName,
    groupIds: [...(row.groupIds || [])],
    roleAssignments: JSON.parse(JSON.stringify(row.roleAssignments)),
    channels: [...row.channels],
    maxConcurrent: row.maxConcurrent,
    status: deriveStatus(row.roleAssignments)
  })
  isEdit.value = true
  currentEditId.value = row.id
  dialogVisible.value = true
}

const handleResendInvite = (row) => {
  ElMessageBox.confirm(
    '确认重新发送邀请吗？新的系统入口及初始凭证将再次拥有 48 小时有效期。',
    '重发邀请',
    {
      confirmButtonText: '确认发送',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    if (row.status === 'expired') {
      row.status = 'inactive'
      ElMessage.success('邀请已重新发送')
    } else {
      ElMessage.success('邀请已重新发送')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    if (isEdit.value) {
      const index = tableData.findIndex(item => item.id === currentEditId.value)
      if (index !== -1) {
        tableData[index] = { ...tableData[index], ...form }
      }
    } else {
      tableData.push({ id: Date.now(), ...form, online: false, isArchived: false })
    }
    dialogVisible.value = false
  })
}

const handleRemove = (row) => {
  confirmDelete(row.realName, () => {
    const index = tableData.findIndex(item => item.id === row.id)
    if (index !== -1) {
      tableData.splice(index, 1)
    }
  })
}

const handleResetPassword = (row) => {
  ElMessageBox.confirm(
    '确认要为该账号重置密码吗？系统将生成全新初始密码并下发至其关联邮箱/手机，旧密码将立即失效。',
    '重置密码',
    {
      confirmButtonText: '确认重置',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('新密码已下发')
  }).catch(() => {})
}

const handleToggleStatus = (row) => {
  const isDisable = row.status === 'active'
  const accountName = row.nickname || row.realName || row.account || '该客服'
  const newStatus = isDisable ? 'disabled' : 'active'
  ElMessageBox.confirm(
    isDisable
      ? '确认要停用客服 <strong>「' + accountName + '」</strong> 吗？<br/><span style="color: #909399; font-size: 13px; line-height: 1.5; display: inline-block; margin-top: 8px;">停用后该账号将立即被踢出系统，其正在接待的会话将被退回公共排队池，但历史接待数据会完整保留。</span>'
      : '确认要启用客服 <strong>「' + accountName + '」</strong> 吗？<br/><span style="color: #909399; font-size: 13px; line-height: 1.5; display: inline-block; margin-top: 8px;">启用后该账号将恢复正常登录及接待会话权限。</span>',
    isDisable ? '停用账号' : '启用账号',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: isDisable ? '确认停用' : '确认启用',
      cancelButtonText: '取消',
      confirmButtonClass: isDisable ? 'el-button--danger' : '',
      type: isDisable ? 'warning' : 'info'
    }
  ).then(() => {
    row.status = newStatus
    row.online = newStatus === 'active'
    ElMessage.success(`账号已${isDisable ? '停用' : '启用'}`)
  }).catch(() => {})
}

const handleCancelInvite = (row) => {
  // [业务防错] 禁止物理删除。释放的唯一键（account）将通过后续查重逻辑的 isArchived 过滤实现自动复用。
  const accountName = row.nickname || row.realName || row.account || '该客服'
  ElMessageBox.confirm(
    '确认要撤销并删除客服 <strong>「' + accountName + '」</strong> 吗？<br/><span style="color: #909399; font-size: 13px; line-height: 1.5; display: inline-block; margin-top: 8px;">撤销后该账号将被归档，历史会话数据仍保留在报表中。</span>',
    '撤销并删除账号',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确认归档',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger',
      type: 'warning'
    }
  ).then(() => {
    row.isArchived = true
    row.status = 'deleted'
    ElMessage.success('账号已归档')
  }).catch(() => {})
}

const handleRenewAccount = (row) => {
  // [业务防错] expired 为终态，禁止逆向恢复为 active。此方法已废弃，仅作占位保留。
  ElMessage.warning('已过期的账号无法续期，如需重新使用请新建账号。')
}

// [业务规范] 账号总体状态由角色数组推导：必须所有角色均过期，账号才视为过期；
// 只要存在一个有效角色，账号即为正常，仅剥夺过期角色对应的权限。
const deriveStatus = (roleAssignments) => {
  if (!roleAssignments || roleAssignments.length === 0) return 'inactive'
  const now = new Date().getTime()
  const hasActive = roleAssignments.some(r => {
    if (r.expireType === 'permanent') return true
    if (!r.endTime) return false
    return new Date(r.endTime).getTime() > now
  })
  return hasActive ? 'active' : 'expired'
}

const selectedRoleId = ref(null)

const handleRoleChange = (val) => {
  if (!val) return
  const exists = form.roleAssignments.find(r => r.roleId === val)
  if (exists) {
    ElMessage.warning('该角色已在列表中，请勿重复添加')
    selectedRoleId.value = null
    return
  }
  const matchedRole = roleOptions.find(r => r.value === val)
  if (!matchedRole) return
  form.roleAssignments.push({
    roleId: matchedRole.value,
    roleName: matchedRole.label,
    expireType: 'permanent',
    startTime: '',
    endTime: ''
  })
  form.status = deriveStatus(form.roleAssignments)
  selectedRoleId.value = null
  ElMessage.success('角色已加入待分配列表，请配置有效期')
}

const handleDeleteRole = (index) => {
  form.roleAssignments.splice(index, 1)
  form.status = deriveStatus(form.roleAssignments)
}

const beforeAvatarUpload = (rawFile) => {
  const allowedTypes = ['image/jpeg', 'image/png']
  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('头像图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像图片大小不能超过 2MB!')
    return false
  }
  return true
}

// TODO: 联调时需移除此本地预览逻辑，对接真实上传接口
const handleAvatarChange = (file, field) => {
  const url = URL.createObjectURL(file.raw)
  form[field] = url
}

const handleExpireTypeChange = (assignment) => {
  if (assignment.expireType === 'permanent') {
    assignment.startTime = ''
    assignment.endTime = ''
  }
}

const handleAddGroup = () => {
  ElMessageBox.prompt('请输入分组名称', '新增分组', {
    inputPattern: /\S+/,
    inputErrorMessage: '名称不能为空'
  }).then(({ value }) => {
    groupListData.push({ id: Date.now(), name: value, memberCount: 0 })
  }).catch(() => {})
}

const handleEditGroup = (row) => {
  ElMessageBox.prompt('请输入分组名称', '编辑分组', {
    inputValue: row.name,
    inputPattern: /\S+/,
    inputErrorMessage: '名称不能为空'
  }).then(({ value }) => {
    row.name = value
  }).catch(() => {})
}

const handleDeleteGroup = (row) => {
  confirmDelete(row.name, () => {
    const index = groupListData.findIndex(g => g.id === row.id)
    if (index !== -1) {
      groupListData.splice(index, 1)
    }
  })
}
</script>

<template>
  <div class="team-page">
    <el-card class="team-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">团队与权限</span>
          <div class="action-buttons">
            <el-button v-permission="['admin']" plain size="small" @click="isGroupDrawerVisible = true">
              <el-icon><Setting /></el-icon>
              分组管理
            </el-button>
            <el-button v-permission="['admin', 'leader']" type="primary" size="small" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              添加客服
            </el-button>
          </div>
        </div>
      </template>
      <div class="filter-bar">
        <div class="filter-top-row">
          <div class="filter-top-left">
            <el-radio-group v-model="filterView">
              <el-radio-button value="all">全部客服</el-radio-button>
              <el-radio-button value="unassigned">
                未分配分组
                <span v-if="unassignedCount > 0" style="color: #F56C6C; margin-left: 4px; font-weight: bold;">
                  ({{ unassignedCount }})
                </span>
              </el-radio-button>
            </el-radio-group>
            <el-divider direction="vertical" />
            <el-input
              v-model="searchKeyword"
              placeholder="搜索昵称、账号或角色..."
              prefix-icon="Search"
              clearable
              size="small"
              style="width: 200px;"
            />
          </div>
          <div class="filter-top-right">
            <el-button size="small" @click="isAdvancedVisible = !isAdvancedVisible">
              {{ isAdvancedVisible ? '收起' : '展开' }}
              <el-icon style="margin-left: 4px;">
                <ArrowUp v-if="isAdvancedVisible" />
                <ArrowDown v-else />
              </el-icon>
            </el-button>
            <el-popover
              placement="bottom-end"
              :width="260"
              trigger="click"
            >
              <template #reference>
                <el-button plain size="small">
                  <el-icon><Setting /></el-icon>
                  列设置
                </el-button>
              </template>
              <div class="column-settings">
                <div class="column-settings-title">拖拽调整列顺序</div>
                <div
                  v-for="(col, index) in columnsConfig"
                  :key="col.key"
                  class="column-item"
                  draggable="true"
                  @dragstart="onDragStart(index)"
                  @dragenter="onDragEnter(index)"
                  @dragend="onDragEnd"
                >
                  <el-icon class="drag-handle"><Rank /></el-icon>
                  <span class="column-label">{{ col.label || col.title || col.prop || '未命名列' }}</span>
                  <el-switch
                    :model-value="col.visible"
                    size="small"
                    @change="toggleColumnVisible(col.key)"
                  />
                </div>
              </div>
            </el-popover>
          </div>
        </div>
        <el-collapse-transition>
          <div v-show="isAdvancedVisible" class="filter-advanced-row">
            <div class="filter-advanced-left">
              <template v-for="field in filterSchema" :key="field.key">
                <el-select
                  v-if="activeFilterFields.includes(field.key) && field.type === 'select'"
                  v-model="filterForm[field.key]"
                  :placeholder="field.label"
                  clearable
                  size="small"
                  style="width: 140px;"
                >
                  <el-option
                    v-for="opt in field.options"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <el-date-picker
                  v-if="activeFilterFields.includes(field.key) && field.type === 'daterange'"
                  v-model="filterForm[field.key]"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  size="small"
                  style="width: 240px;"
                />
              </template>
            </div>
            <div class="filter-advanced-right">
              <el-button size="small" link type="primary" @click="resetFilters">重置</el-button>
              <el-popover
                placement="bottom-end"
                :width="200"
                trigger="click"
              >
                <template #reference>
                  <el-button plain size="small">⚙️ 自定义字段</el-button>
                </template>
                <el-checkbox-group v-model="activeFilterFields">
                  <el-checkbox
                    v-for="field in filterSchema"
                    :key="field.key"
                    :value="field.key"
                    style="display: block; margin-bottom: 8px;"
                  >
                    {{ field.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-popover>
            </div>
          </div>
        </el-collapse-transition>
      </div>
      <el-table :data="paginatedData" stripe class="team-table" size="default" :header-cell-style="{ fontSize: '14px', fontWeight: '600', color: '#909399' }">
        <template v-for="col in columnsConfig" :key="col.key">
          <el-table-column
            v-if="col.visible && col.key === 'avatar'"
            :label="col.label"
            :width="col.width"
            align="center"
          >
            <template #default="{ row }">
              <ProAvatar :src="row.avatar" :name="row.nickName || row.realName || row.account" :size="36" />
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="col.visible && col.key === 'account'"
            prop="account"
            :label="col.label"
            :min-width="col.minWidth"
          />
          <el-table-column
            v-else-if="col.visible && col.key === 'groups'"
            :label="col.label"
            :min-width="col.minWidth"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                v-for="groupId in row.groupIds"
                :key="groupId"
                size="small"
                style="margin-right: 4px;"
              >
                {{ getGroupNames([groupId]) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="col.visible && col.key === 'nickName'"
            prop="nickName"
            :label="col.label"
            :min-width="col.minWidth"
            align="center"
          />
          <el-table-column
            v-else-if="col.visible && col.key === 'roles'"
            :label="col.label"
            :min-width="col.minWidth"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                v-for="assignment in row.roleAssignments"
                :key="assignment.roleId"
                :type="isRoleExpired(assignment) ? 'info' : 'warning'"
                :effect="isRoleExpired(assignment) ? 'plain' : 'light'"
                size="small"
                style="margin-right: 4px;"
              >
                {{ getRoleLabel(assignment.roleId) }}
                <span v-if="isRoleExpired(assignment)" style="margin-left: 4px; text-decoration: line-through;">已失效</span>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="col.visible && col.key === 'channels'"
            :label="col.label"
            :min-width="col.minWidth"
            align="center"
          >
            <template #default="{ row }">
              <el-tag v-for="channelId in row.channels" :key="channelId" size="small" style="margin-right: 4px;">
                {{ channelStore.getChannelName(channelId) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="col.visible && col.key === 'status'"
            :label="col.label"
            :width="col.width"
            align="center"
          >
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="col.visible && col.key === 'actions'"
            :label="col.label"
            :width="col.width"
            :fixed="col.fixed"
            align="center"
          >
            <template #default="{ row }">
              <div style="display: flex; align-items: center; justify-content: flex-start; gap: 4px;">
                <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                <el-dropdown trigger="click" @command="(cmd) => handleMenuAction(row, cmd)">
                  <el-button link type="primary" size="small" style="display: flex; align-items: center; line-height: 1;">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <template v-for="item in getActionMenuItems(row)" :key="item.key">
                        <el-dropdown-item
                          :command="item.key"
                          :disabled="item.disabled"
                          :divided="item.key === 'disable' || item.key === 'cancel' || item.key === 'renew'"
                        >
                          <el-tooltip
                            v-if="item.disabled && item.disabledTip"
                            :content="item.disabledTip"
                            placement="left"
                            :disabled="false"
                          >
                            <span>{{ item.label }}</span>
                          </el-tooltip>
                          <span v-else :style="item.danger ? { color: '#F56C6C' } : item.primary ? { color: '#409EFF' } : {}">{{ item.label }}</span>
                        </el-dropdown-item>
                      </template>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </template>
      </el-table>
      <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑客服' : '新增客服'" width="800px" class="pro-dialog">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px" label-position="top">
        <el-divider content-position="left" style="margin: 24px 0;">基础身份</el-divider>
        <el-form-item label="头像">
          <div class="avatar-upload">
            <el-upload
              class="avatar-uploader"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept=".jpg,.jpeg,.png"
              :before-upload="beforeAvatarUpload"
              :on-change="(file) => handleAvatarChange(file, 'avatar')"
            >
              <img v-if="form.avatar" :src="form.avatar" class="avatar-preview" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="avatar-tip">建议尺寸 400×400px (或 1:1 比例)，支持 jpg/png 格式，大小不超过 2MB。若不上传，系统将优先展示「基础偏好」中的企业统一头像；若均未配置，则自动根据客服昵称生成专属文字头像。</div>
          </div>
        </el-form-item>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item prop="account">
              <template #label>
                <span style="display: inline-flex; align-items: center; gap: 4px;">
                  登录账号
                  <el-tooltip content="若需将此账号分配给新员工，请先在列表对原账号执行【撤销/停用】以释放唯一键。" placement="top" effect="dark" popper-class="pro-tooltip">
                    <el-icon style="color: #909399; cursor: pointer;"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="form.account" placeholder="请输入手机号或邮箱" clearable style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="form.realName" placeholder="请输入真实姓名" clearable style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="对外昵称">
              <template #label>
                <div style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                  对外昵称
                  <el-tooltip content='用于保护员工真实隐私。如果对外昵称为空，系统自动截取该员工【登录号】的后 4 位，拼接成代号。例如，登录号是 admin8801，那么默认对外昵称就是"客服8801"。' placement="top" effect="dark" popper-class="pro-tooltip">
                    <el-icon style="color: #909399; cursor: pointer;"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-input v-model="form.nickName" placeholder="选填，如：客服小王" clearable style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属分组">
              <template #label>
                <div style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                  所属分组
                  <el-tooltip content="此分组将作为「查看本组」等数据权限的计算依据。" placement="top">
                    <el-icon style="color: #909399; cursor: pointer;"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-select v-model="form.groupIds" multiple filterable placeholder="请选择所属分组" style="width: 100%;">
                <el-option
                  v-for="item in groupOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left" style="margin: 24px 0;">角色权限</el-divider>
        <el-form-item prop="roles">
          <template #label>
            <div style="display: inline-flex; align-items: center;">
              分配角色
              <el-tooltip content="可配置永久生效，或指定精确的生效与失效时间区间。" placement="top" effect="dark" popper-class="pro-tooltip">
                <el-icon style="margin-left: 4px; cursor: pointer; color: #909399;">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <div class="role-assignment-area">
            <div class="role-select-row">
              <el-select
                v-model="selectedRoleId"
                filterable
                placeholder="请搜索并选择一个角色"
                clearable
                style="width: 100%;"
                @change="handleRoleChange"
              >
                <el-option
                  v-for="item in assignableRoles"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="form.roleAssignments.some(r => r.roleId === item.value)"
                >
                  <div class="role-option">
                    <span>{{ item.label }}</span>
                    <span v-if="form.roleAssignments.some(r => r.roleId === item.value)" class="role-option-checked">✓ 已添加</span>
                  </div>
                </el-option>
              </el-select>
            </div>
            <div v-if="form.roleAssignments.length > 0" class="role-assignment-table-wrapper">
              <el-table :data="form.roleAssignments" stripe size="small" class="pro-table">
                <el-table-column prop="roleId" label="角色名称" width="120">
                  <template #default="{ row }">
                    {{ getRoleLabel(row.roleId) }}
                  </template>
                </el-table-column>
                <el-table-column label="有效期" min-width="520" align="center">
                  <template #default="{ row, $index }">
                    <div style="display: flex; align-items: center; justify-content: center; flex-wrap: nowrap; gap: 12px;">
                      <!-- [业务防错] 锁定历史生效时间与过期账号有效期，确保数据审计线索不可篡改。 -->
                      <el-radio-group v-model="row.expireType" size="small" style="flex-shrink: 0; white-space: nowrap;" :disabled="currentEditRow?.status === 'expired'">
                        <el-radio-button value="permanent">永久</el-radio-button>
                        <el-radio-button value="limited">限时</el-radio-button>
                      </el-radio-group>
                      <template v-if="row.expireType === 'limited'">
                        <el-date-picker
                          v-model="row.startTime"
                          type="datetime"
                          placeholder="生效开始时间"
                          value-format="YYYY-MM-DD HH:mm:ss"
                          format="YYYY-MM-DD HH:mm:ss"
                          size="small"
                          style="width: 180px; flex-shrink: 0;"
                          :default-time="defaultTime[0]"
                          :shortcuts="startTimeShortcuts"
                          :disabled="!!form.id || currentEditRow?.status === 'expired'"
                        />
                        <span style="color: #909399; flex-shrink: 0;">至</span>
                        <el-date-picker
                          v-model="row.endTime"
                          type="datetime"
                          placeholder="生效结束时间"
                          value-format="YYYY-MM-DD HH:mm:ss"
                          format="YYYY-MM-DD HH:mm:ss"
                          size="small"
                          style="width: 180px; flex-shrink: 0;"
                          :default-time="defaultTime[1]"
                          :disabled="currentEditRow?.status === 'expired'"
                        />
                      </template>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center">
                  <template #default="{ row, $index }">
                    <el-button link type="danger" @click="handleDeleteRole($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-form-item>

        <el-divider content-position="left" style="margin: 24px 0;">业务配置</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="maxConcurrent">
              <template #label>
                <div style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                  接待上限
                  <el-tooltip content='该客服同时能接待的最大会话数量，建议新人设置 3-5，最高支持同时接待 20 人。' placement="top" effect="dark" popper-class="pro-tooltip">
                    <el-icon style="color: #909399; cursor: pointer;"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-input-number v-model="form.maxConcurrent" :min="1" :max="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接待渠道">
              <el-select
                v-model="form.channels"
                multiple
                filterable
                placeholder="选填，选择可接待的渠道实例"
                style="width: 100%;"
              >
                <el-option
                  v-for="ch in channelStore.channelList"
                  :key="ch.id"
                  :label="ch.name"
                  :value="ch.id"
                />
              </el-select>
              <div class="field-tip">暂未分配具体接客路由时，可留空</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-alert
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 16px; text-align: left; line-height: 1.6;"
        >
          <template #title>
            <span style="font-weight: normal; color: var(--el-text-color-regular);">
              保存后，系统将自动下发包含<strong style="color: var(--el-text-color-primary);">「企业代码」</strong>与<strong style="color: var(--el-text-color-primary);">「高强随机初始密码」</strong>的邀请通知。为保障安全，初始凭证将于<strong style="color: var(--el-text-color-primary);">48 小时</strong>后失效，且员工首次登录必须<strong style="color: var(--el-text-color-primary);">强制修改密码</strong>。
            </span>
          </template>
        </el-alert>
        <div class="footer-buttons">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer v-model="isGroupDrawerVisible" title="分组管理" size="400px" direction="rtl">
      <div class="drawer-content">
        <div class="drawer-header-bar">
          <el-input placeholder="搜索分组名称" style="flex: 1;" />
          <el-button type="primary" style="margin-left: 8px;" @click="handleAddGroup">新增分组</el-button>
        </div>
        <el-table :data="groupListData" size="default" style="margin-top: 16px;" :header-cell-style="{ fontSize: '14px', fontWeight: '600', color: '#909399' }">
          <el-table-column prop="name" label="分组名称" />
          <el-table-column prop="memberCount" label="成员数" width="80" align="center" />
          <el-table-column label="操作" width="120" align="center">
            <template #default="scope">
              <el-button type="primary" link size="default" @click="handleEditGroup(scope.row)">编辑</el-button>
              <el-button type="danger" link size="default" style="margin-left: 12px;" @click="handleDeleteGroup(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
.team-page {
  height: 100%;
}

.team-card {
  border-radius: 8px;
  border: 1px solid #e4e4e7;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drawer-content {
  padding: 0 4px;
}

.drawer-header-bar {
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.team-table {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.status-dot.online {
  background-color: #67c23a;
}

.status-dot.offline {
  background-color: #c0c0c0;
}

.field-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-top: 4px;
}

.footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.max-concurrent-tip {
  margin-left: 8px;
  color: #909399;
  cursor: pointer;
  vertical-align: middle;
}

.avatar-upload {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.avatar-uploader {
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 24px;
  color: #8c8c8c;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.avatar-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  padding-top: 4px;
  max-width: 280px;
}

.role-assignment-area {
  width: 100%;
}

.filter-bar {
  margin-bottom: 20px;
}

.filter-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.filter-top-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-top-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.filter-advanced-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.filter-advanced-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-advanced-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.role-select-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.role-assignment-table-wrapper {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.role-assignment-table {
  border-radius: 6px;
}

.expire-type-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.role-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.role-option-checked {
  color: #67c23a;
  font-size: 12px;
  font-weight: 500;
}

:deep(.el-select-dropdown__item.is-disabled) {
  opacity: 0.6;
}

.column-settings {
  max-height: 360px;
  overflow-y: auto;
}

.column-settings-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.column-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  cursor: grab;
  user-select: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.column-item:hover {
  background-color: #f5f7fa;
}

.column-item:active {
  cursor: grabbing;
}

.drag-handle {
  color: #c0c4cc;
  font-size: 14px;
  flex-shrink: 0;
}

.column-label {
  flex: 1;
  font-size: 13px;
  color: #606266;
}
</style>
