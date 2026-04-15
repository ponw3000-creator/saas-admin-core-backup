<script setup>
import { reactive, ref, computed, nextTick } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const roleList = reactive([
  { id: 1, name: '超级管理员', description: '拥有系统全部权限，可管理所有模块', is_super_admin: true },
  { id: 2, name: '客服组长', description: '管理本组客服，查看组内业务数据' },
  { id: 3, name: '普通客服', description: '日常接待会话，处理分发的工单' },
  { id: 4, name: '数据专员', description: '查看和导出业务数据报表' }
])

const selectedRoleId = ref(1)
const currentRole = ref(roleList[0])

const isCurrentSuperAdmin = computed(() => currentRole.value?.is_super_admin === true)

const permissionData = reactive([
  {
    id: 'chat',
    label: '会话工作台',
    type: 'page',
    children: [
      { id: 'chat_reception', label: '接待访客', type: 'operation' },
      { id: 'chat_transfer', label: '会话转接', type: 'operation' }
    ]
  },
  {
    id: 'ticket',
    label: '工单系统',
    type: 'page',
    children: [
      {
        id: 'ticket_scope',
        label: '工单查看范围',
        type: 'data-level',
        scopeOptions: [
          { id: 'ticket_company', label: '全公司' },
          { id: 'ticket_group', label: '本组' },
          { id: 'ticket_self', label: '仅本人' }
        ]
      },
      { id: 'ticket_create', label: '新增工单', type: 'operation' },
      { id: 'ticket_approve', label: '审批与流转', type: 'operation' }
    ]
  },
  {
    id: 'ai',
    label: 'AI 与大模型配置',
    type: 'page',
    children: [
      { id: 'ai_config', label: 'AI 模型配置', type: 'page' },
      { id: 'llm_config', label: 'LLM 基座配置', type: 'operation' }
    ]
  },
  {
    id: 'security',
    label: '安全与审计',
    type: 'page',
    children: [
      { id: 'oplog', label: '操作日志', type: 'operation' },
      { id: 'dict', label: '字典管理', type: 'page' }
    ]
  },
  {
    id: 'settings',
    label: '系统设置',
    type: 'page',
    children: [
      {
        id: 'settings_knowledge',
        label: '知识与话术配置',
        type: 'page',
        children: [
          { id: 'settings_knowledge_crud', label: '增删改查话术', type: 'operation' }
        ]
      },
      {
        id: 'settings_team',
        label: '团队账号总览',
        type: 'page',
        children: [
          {
            id: 'settings_team_scope',
            label: '账号查看范围',
            type: 'data-level',
            scopeOptions: [
              { id: 'team_company', label: '全公司' },
              { id: 'team_group', label: '本组' },
              { id: 'team_self', label: '仅本人' }
            ]
          },
          { id: 'settings_team_edit', label: '新增/编辑账号', type: 'operation' },
          { id: 'settings_team_delete', label: '删除账号', type: 'operation' }
        ]
      },
      {
        id: 'settings_role',
        label: '角色权限配置',
        type: 'page'
      }
    ]
  }
])

const getAllPermissionIds = (data) => {
  const result = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      result.push(node.id)
      if (node.children) traverse(node.children)
      if (node.scopeOptions) node.scopeOptions.forEach(opt => result.push(opt.id))
    })
  }
  traverse(data)
  return result
}

const rolePermissionMap = reactive({
  1: getAllPermissionIds(permissionData),
  2: [
    'chat_reception', 'chat_transfer',
    'ticket_group', 'ticket_create', 'ticket_approve',
    'ai_config', 'llm_config',
    'team_group', 'settings_knowledge_crud'
  ],
  3: [
    'chat_reception',
    'ticket_self', 'ticket_create',
    'settings_knowledge_crud'
  ],
  4: []
})

const treeRef = ref(null)
const checkedKeys = ref([])

const refreshTreeChecked = () => {
  nextTick(() => {
    if (!treeRef.value) return
    if (isCurrentSuperAdmin.value) {
      treeRef.value.setCheckedKeys(getAllPermissionIds(permissionData))
    } else {
      treeRef.value.setCheckedKeys(rolePermissionMap[currentRole.value.id] || [])
    }
  })
}

const selectRole = (role) => {
  selectedRoleId.value = role.id
  currentRole.value = role
  rolePermissionMap[currentRole.value.id] = rolePermissionMap[currentRole.value.id] || []
  checkedKeys.value = [...(rolePermissionMap[currentRole.value.id])]
  refreshTreeChecked()
}

const savePermissions = () => {
  if (isCurrentSuperAdmin.value) {
    ElMessage.warning('超级管理员权限不可修改')
    return
  }
  const checked = treeRef.value?.getCheckedKeys() || []
  const halfChecked = treeRef.value?.getHalfCheckedKeys() || []
  const allChecked = [...checked, ...halfChecked]
  rolePermissionMap[currentRole.value.id] = allChecked
  ElMessage.success(`「${currentRole.value.name}」权限配置已保存`)
}

const getNodeIcon = (type) => {
  switch (type) {
    case 'operation': return '🎯'
    case 'data-level': return '🔐'
    default: return '📄'
  }
}

const newRoleDialogVisible = ref(false)
const newRoleForm = reactive({
  name: '',
  description: ''
})

const newRoleRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

const openNewRoleDialog = () => {
  newRoleForm.name = ''
  newRoleForm.description = ''
  newRoleDialogVisible.value = true
}

const confirmAddRole = () => {
  if (!newRoleForm.name) {
    ElMessage.warning('请输入角色名称')
    return
  }
  const newId = Date.now()
  roleList.push({
    id: newId,
    name: newRoleForm.name,
    description: newRoleForm.description || '暂无描述'
  })
  rolePermissionMap[newId] = []
  newRoleDialogVisible.value = false
  nextTick(() => {
    const newRole = roleList.find(r => r.id === newId)
    if (newRole) {
      selectRole(newRole)
    }
  })
  ElMessage.success(`「${newRoleForm.name}」角色已创建，请配置权限`)
}
</script>

<template>
  <div class="role-page">
    <el-card class="role-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">角色与权限管理</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="role-list-panel">
            <div class="panel-header">
              <span class="panel-title">角色列表</span>
              <el-button type="primary" size="small" @click="openNewRoleDialog">
                <el-icon><Plus /></el-icon>
                新增角色
              </el-button>
            </div>
            <el-menu :default-active="String(selectedRoleId)" class="role-menu">
              <el-menu-item
                v-for="role in roleList"
                :key="role.id"
                :index="String(role.id)"
                @click="selectRole(role)"
              >
                <div class="role-item">
                  <span class="role-name">{{ role.name }}</span>
                  <span class="role-desc">{{ role.description }}</span>
                </div>
              </el-menu-item>
            </el-menu>
          </div>
        </el-col>

        <el-col :span="18">
          <div class="permission-panel">
            <div class="panel-header">
              <div class="current-role">
                <span class="label">当前角色：</span>
                <span class="value">{{ currentRole.name }}</span>
              </div>
              <el-button v-if="!isCurrentSuperAdmin" type="primary" @click="savePermissions">保存权限</el-button>
            </div>

            <template v-if="isCurrentSuperAdmin">
              <div class="god-mode-text">
                <div class="god-mode-heading">超级管理员特权</div>
                <div class="god-mode-body">该角色为系统内置最高权限角色，默认拥有当前及未来所有的系统功能权限，不受颗粒度节点限制，无需进行繁琐配置。</div>
              </div>
            </template>

            <template v-else>
              <div class="permission-tree-wrapper">
                <el-tree
                  ref="treeRef"
                  :data="permissionData"
                  :default-expand-all="true"
                  show-checkbox
                  node-key="id"
                  :props="{
                    children: 'children',
                    label: 'label'
                  }"
                  :default-checked-keys="checkedKeys"
                  :check-strictly="false"
                  highlight-current
                  :expand-on-click-node="false"
                  class="permission-tree"
                >
                  <template #default="{ node, data }">
                    <div class="tree-node-content">
                      <span class="node-icon">{{ getNodeIcon(data.type) }}</span>
                      <span class="node-label">{{ node.label }}</span>
                      <span v-if="data.type === 'data-level' && data.scopeOptions" class="scope-tags">
                        <el-tag
                          v-for="scope in data.scopeOptions"
                          :key="scope.id"
                          size="small"
                          :type="checkedKeys.includes(scope.id) ? 'success' : 'info'"
                          class="scope-tag"
                        >
                          {{ scope.label }}
                        </el-tag>
                      </span>
                      <span v-if="data.type === 'operation'" class="type-badge operation">操作</span>
                      <span v-if="data.type === 'data-level'" class="type-badge data-level">数据级</span>
                    </div>
                  </template>
                </el-tree>
              </div>
            </template>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog v-model="newRoleDialogVisible" title="新增角色" width="500px">
      <el-form :model="newRoleForm" :rules="newRoleRules" label-width="90px" label-position="left">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="newRoleForm.name" placeholder="例如：初级客服" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="newRoleForm.description"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="简要描述角色职能"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="newRoleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddRole">确认创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.role-page {
  height: 100%;
}

.role-card {
  border-radius: 8px;
  border: 1px solid #e4e4e7;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.role-list-panel {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  min-height: 500px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.role-menu {
  border-right: none;
  background: transparent;
}

.role-menu :deep(.el-menu-item) {
  height: auto;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 4px;
  color: #666;
  line-height: 1.4;
}

.role-menu :deep(.el-menu-item:hover) {
  background: #e8f4ff;
  color: #409eff;
}

.role-menu :deep(.el-menu-item.is-active) {
  background: #409eff;
  color: #fff;
}

.role-menu :deep(.el-menu-item.is-active .role-desc) {
  color: rgba(255, 255, 255, 0.8);
}

.role-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.role-name {
  font-size: 14px;
  font-weight: 500;
}

.role-desc {
  font-size: 12px;
  color: #999;
  white-space: normal;
  word-break: break-word;
}

.permission-panel {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  min-height: 500px;
}

.current-role {
  display: flex;
  align-items: center;
}

.current-role .label {
  font-size: 14px;
  color: #666;
}

.current-role .value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.god-mode-text {
  margin-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 40px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.god-mode-heading {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.god-mode-body {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  max-width: 400px;
}

.permission-tree-wrapper {
  margin-top: 16px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e4e4e7;
}

.permission-tree {
  background: transparent;
}

.permission-tree :deep(.el-tree-node__content) {
  height: 42px;
}

.permission-tree :deep(.el-tree-node__label) {
  font-size: 14px;
}

.tree-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.node-icon {
  font-size: 16px;
}

.node-label {
  font-size: 14px;
  color: #333;
}

.scope-tags {
  display: flex;
  gap: 4px;
  margin-left: 12px;
}

.scope-tag {
  font-size: 12px;
}

.type-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

.type-badge.operation {
  background: #e8f4ff;
  color: #409eff;
}

.type-badge.data-level {
  background: #fef0f0;
  color: #f56c6c;
}
</style>
