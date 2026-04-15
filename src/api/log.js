export const MOCK_LOGS = [
  {
    id: 1,
    create_time: '2024-12-01 09:23:41',
    operator: 'admin',
    module: 'AI 模型配置',
    action: '修改配置',
    detail_before: 'API Key: sk-***(旧)',
    detail_after: 'API Key: sk-***(新)',
    ip_address: '192.168.1.101'
  },
  {
    id: 2,
    create_time: '2024-12-01 09:18:05',
    operator: 'admin',
    module: 'AI 模型配置',
    action: '修改系统提示词',
    detail_before: 'System Prompt: (128 chars)',
    detail_after: 'System Prompt: (256 chars)',
    ip_address: '192.168.1.101'
  },
  {
    id: 3,
    create_time: '2024-12-01 08:55:22',
    operator: 'admin',
    module: '字典管理',
    action: '新增字典项',
    detail_before: '-',
    detail_after: 'dict_key: kb_hit_rate | 知识库命中率',
    ip_address: '192.168.1.101'
  },
  {
    id: 4,
    create_time: '2024-12-01 08:41:10',
    operator: 'admin',
    module: '字典管理',
    action: '删除字典项',
    detail_before: 'dict_key: legacy_metric_xyz | 废弃指标X',
    detail_after: '-',
    ip_address: '192.168.1.101'
  },
  {
    id: 5,
    create_time: '2024-11-30 17:52:33',
    operator: 'admin',
    module: '知识与话术',
    action: '导入知识库',
    detail_before: 'FAQ 条目: 12',
    detail_after: 'FAQ 条目: 48（+36）',
    ip_address: '192.168.1.101'
  },
  {
    id: 6,
    create_time: '2024-11-30 16:10:08',
    operator: '李明',
    module: '知识与话术',
    action: '删除 FAQ',
    detail_before: 'Q: 如何申请退款？',
    detail_after: '-',
    ip_address: '192.168.1.105'
  },
  {
    id: 7,
    create_time: '2024-11-30 14:25:47',
    operator: 'admin',
    module: '团队与权限',
    action: '封禁账号',
    detail_before: '账号: wangfang | 状态: 正常',
    detail_after: '账号: wangfang | 状态: 已封禁',
    ip_address: '192.168.1.101'
  },
  {
    id: 8,
    create_time: '2024-11-30 11:08:32',
    operator: 'admin',
    module: '团队与权限',
    action: '修改权限',
    detail_before: '李明: 普通客服',
    detail_after: '李明: 超级管理员',
    ip_address: '192.168.1.101'
  },
  {
    id: 9,
    create_time: '2024-11-29 15:30:00',
    operator: '王五',
    module: 'AI 模型配置',
    action: '切换模型',
    detail_before: '模型: gpt-3.5-turbo',
    detail_after: '模型: gpt-4o-mini',
    ip_address: '192.168.1.102'
  },
  {
    id: 10,
    create_time: '2024-11-29 14:20:11',
    operator: 'admin',
    module: '字典管理',
    action: '编辑字典项',
    detail_before: 'dict_key: session_timeout | 会话超时时长 (旧值: 30min)',
    detail_after: 'dict_key: session_timeout | 会话超时时长 (新值: 60min)',
    ip_address: '192.168.1.101'
  },
  {
    id: 11,
    create_time: '2024-11-28 10:05:44',
    operator: '张三',
    module: '知识与话术',
    action: '新增 FAQ',
    detail_before: '-',
    detail_after: 'Q: 企业版价格是多少？',
    ip_address: '192.168.1.103'
  },
  {
    id: 12,
    create_time: '2024-11-28 09:48:29',
    operator: 'admin',
    module: '团队与权限',
    action: '新增成员',
    detail_before: '-',
    detail_after: '新增成员: 赵六 (角色: 普通客服)',
    ip_address: '192.168.1.101'
  },
  {
    id: 13,
    create_time: '2024-11-27 16:33:17',
    operator: '李四',
    module: 'AI 模型配置',
    action: '开启审金模式',
    detail_before: '审金模式: 关闭',
    detail_after: '审金模式: 开启 | 阈值: 0.7',
    ip_address: '192.168.1.106'
  },
  {
    id: 14,
    create_time: '2024-11-27 14:11:55',
    operator: 'admin',
    module: '字典管理',
    action: '批量导入字典',
    detail_before: '字典项数量: 5',
    detail_after: '字典项数量: 23（+18）',
    ip_address: '192.168.1.101'
  },
  {
    id: 15,
    create_time: '2024-11-26 11:22:03',
    operator: '赵六',
    module: '知识与话术',
    action: '编辑 FAQ',
    detail_before: 'Q: 有哪些支付方式？ (A: 支付宝/微信)',
    detail_after: 'Q: 有哪些支付方式？ (A: 支付宝/微信/银行卡)',
    ip_address: '192.168.1.107'
  },
  {
    id: 16,
    create_time: '2024-11-25 17:45:21',
    operator: 'admin',
    module: '团队与权限',
    action: '移除成员',
    detail_before: '成员: 陈七 (角色: 普通客服)',
    detail_after: '-',
    ip_address: '192.168.1.101'
  },
  {
    id: 17,
    create_time: '2024-11-25 15:10:38',
    operator: '王五',
    module: 'AI 模型配置',
    action: '修改温度参数',
    detail_before: 'Temperature: 0.5',
    detail_after: 'Temperature: 0.8',
    ip_address: '192.168.1.102'
  }
]

export const fetchOperationLogs = async (params = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const { module, operator, dateRange, page = 1, pageSize = 10 } = params

  let filtered = [...MOCK_LOGS]

  if (module) {
    filtered = filtered.filter((item) => item.module === module)
  }

  if (operator) {
    filtered = filtered.filter((item) => item.operator.toLowerCase().includes(operator.toLowerCase()))
  }

  if (dateRange && dateRange.length === 2) {
    const [start, end] = dateRange
    filtered = filtered.filter((item) => {
      return item.create_time >= start && item.create_time <= end
    })
  }

  const total = filtered.length
  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)

  return { list, total }
}
