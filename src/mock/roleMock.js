// [业务规范] 权限管理 Mock 数据 - 纯数据，无响应式包装
// API-Ready: 未来替换为 api.getPermissions() 等接口返回

export const roleListMockData = [
  { id: 1, name: '超级管理员', description: '拥有系统全部权限，可管理所有模块', is_super_admin: true },
  { id: 2, name: '客服组长', description: '管理本组客服，查看组内业务数据' },
  { id: 3, name: '普通客服', description: '日常接待会话，处理分发的工单' },
  { id: 4, name: '数据专员', description: '查看和导出业务数据报表' }
]

export const permissionTreeMockData = [
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
]
