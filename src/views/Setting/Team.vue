<script setup>
import { reactive, ref, computed } from 'vue'
import { Plus, QuestionFilled, Setting } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useConfirmDelete } from '@/utils/useConfirmDelete'

const { confirmDelete } = useConfirmDelete()

const tableData = reactive([
  {
    id: 1,
    account: 'admin@company.com',
    realName: '张明',
    nickName: '小明',
    groupIds: [1, 2],
    roleAssignments: [
      { roleId: '1', expireType: 'permanent', startTime: '', endTime: '' },
      { roleId: '2', expireType: 'limited', startTime: '2026-01-01 00:00:00', endTime: '2026-12-31 23:59:59' }
    ],
    channels: ['微信', 'App', 'Web'],
    maxConcurrent: 10,
    online: true
  },
  {
    id: 2,
    account: 'support01@company.com',
    realName: '李娜',
    nickName: '娜美',
    groupIds: [2],
    roleAssignments: [
      { roleId: '3', expireType: 'permanent', startTime: '', endTime: '' }
    ],
    channels: ['微信小程序 A', '内部 CRM'],
    maxConcurrent: 5,
    online: true
  },
  {
    id: 3,
    account: 'support02@company.com',
    realName: '王浩',
    nickName: '浩哥',
    groupIds: [3],
    roleAssignments: [
      { roleId: '3', expireType: 'limited', startTime: '2026-04-01 00:00:00', endTime: '2026-04-30 23:59:59' },
      { roleId: '4', expireType: 'permanent', startTime: '', endTime: '' }
    ],
    channels: ['App 商城 B'],
    maxConcurrent: 3,
    online: false
  }
])

const dialogVisible = ref(false)
const isGroupDrawerVisible = ref(false)
const filterView = ref('all')
const isEdit = ref(false)
const currentEditId = ref(null)

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
    { required: true, message: '请设置最大并发数', trigger: 'blur' },
    { type: 'number', min: 1, message: '并发数最小为 1', trigger: 'change' }
  ]
})

const unassignedCount = computed(() => {
  return tableData.filter(item => !item.groupIds || item.groupIds.length === 0).length
})

const filteredTableData = computed(() => {
  if (filterView.value === 'unassigned') {
    return tableData.filter(item => !item.groupIds || item.groupIds.length === 0)
  }
  return tableData
})

const channelOptions = [
  { label: '微信', value: '微信' },
  { label: 'App', value: 'App' },
  { label: 'Web', value: 'Web' },
  { label: '微信小程序 A', value: '微信小程序 A' },
  { label: 'App 商城 B', value: 'App 商城 B' },
  { label: '内部 CRM', value: '内部 CRM' }
]

const roleOptions = [
  { label: '超级管理员', value: '1' },
  { label: '管理员', value: '2' },
  { label: '普通客服', value: '3' },
  { label: '客服组长', value: '4' }
]

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

const groupOptions = [
  { id: 1, name: '售前咨询组' },
  { id: 2, name: '售后支持组' },
  { id: 3, name: '大客户服务组' }
]

const groupListData = reactive([
  { id: 1, name: '售前咨询组', memberCount: 5 },
  { id: 2, name: '售后支持组', memberCount: 8 },
  { id: 3, name: '大客户服务组', memberCount: 3 }
])

const getGroupNames = (groupIds) => {
  if (!groupIds || groupIds.length === 0) return '-'
  return groupIds.map(id => groupOptions.find(g => g.id === id)?.name || '').filter(Boolean).join('、')
}

const getRoleLabel = (roleId) => {
  return roleOptions.find(r => r.value === roleId)?.label || roleId
}

const isRoleExpired = (assignment) => {
  if (assignment.expireType === 'permanent') return false
  if (!assignment.endTime) return false
  return new Date(assignment.endTime) < new Date()
}

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
    maxConcurrent: row.maxConcurrent
  })
  isEdit.value = true
  currentEditId.value = row.id
  dialogVisible.value = true
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
      tableData.push({ id: Date.now(), ...form, online: false })
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
  selectedRoleId.value = null
  ElMessage.success('角色已加入待分配列表，请配置有效期')
}

const handleDeleteRole = (index) => {
  form.roleAssignments.splice(index, 1)
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
            <el-button plain size="small" @click="isGroupDrawerVisible = true">
              <el-icon><Setting /></el-icon>
              分组管理
            </el-button>
            <el-button type="primary" size="small" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              添加客服
            </el-button>
          </div>
        </div>
      </template>
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <el-radio-group v-model="filterView">
          <el-radio-button label="all">全部客服</el-radio-button>
          <el-radio-button label="unassigned">
            未分配分组
            <span v-if="unassignedCount > 0" style="color: #F56C6C; margin-left: 4px; font-weight: bold;">
              ({{ unassignedCount }})
            </span>
          </el-radio-button>
        </el-radio-group>
      </div>
      <el-table :data="filteredTableData" stripe class="team-table" size="default" :header-cell-style="{ fontSize: '14px', fontWeight: '600', color: '#909399' }">
        <el-table-column prop="account" label="账号" min-width="200" />
        <el-table-column label="所属分组" min-width="140" align="center">
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
        <el-table-column prop="nickName" label="对外昵称" min-width="120" align="center" />
        <el-table-column label="系统角色" min-width="200" align="center">
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
        <el-table-column label="接待渠道" min-width="240" align="center">
          <template #default="{ row }">
            <el-tag v-for="channel in row.channels" :key="channel" size="small" style="margin-right: 4px;">
              {{ channel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <span class="status-dot" :class="row.online ? 'online' : 'offline'"></span>
            {{ row.online ? '在线' : '离线' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="default" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="default" style="margin-left: 12px;" @click="handleRemove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
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
              @change="(file) => form.avatar = URL.createObjectURL(file.raw)"
            >
              <img v-if="form.avatar" :src="form.avatar" class="avatar-preview" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="avatar-tip">建议尺寸 400×400px (或 1:1 比例)，支持 jpg/png 格式，大小不超过 2MB。如果不上传，对外将默认展示「全局设置」中配置的统一头像。</div>
          </div>
        </el-form-item>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="登录账号" prop="account">
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
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
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
                  v-for="item in roleOptions"
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
                      <el-radio-group v-model="row.expireType" size="small" style="flex-shrink: 0; white-space: nowrap;">
                        <el-radio-button label="permanent">永久</el-radio-button>
                        <el-radio-button label="limited">限时</el-radio-button>
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
                  <el-tooltip content='该客服同时能接待的最大会话数量，建议新手设置 3-5，最高支持同时接待 20 人。' placement="top">
                    <el-icon style="color: #909399; cursor: pointer;"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-input-number v-model="form.maxConcurrent" :min="1" :max="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接待渠道">
              <el-select
                v-model="form.channels"
                multiple
                filterable
                placeholder="选填，如：微信、App"
                style="width: 100%;"
              >
                <el-option
                  v-for="item in channelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <div class="field-tip">暂未分配具体接客路由时，可留空</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
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
</style>
