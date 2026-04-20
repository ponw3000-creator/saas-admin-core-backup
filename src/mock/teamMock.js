// [业务规范] 客服账号列表数据 - 纯数据，无响应式包装
export const teamMockData = [
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
  },
  {
    id: 999,
    account: 'true_expired@company.com',
    realName: '测试过期',
    nickName: '老王(已过期测试)',
    group: '售后支持组',
    groupIds: [2],
    roleAssignments: [
      { roleId: '1', roleName: '主管', expireType: 'limited', startTime: '2023-01-01 00:00:00', endTime: '2023-12-31 23:59:59' },
      { roleId: '2', roleName: '客服', expireType: 'limited', startTime: '2023-06-01 00:00:00', endTime: '2024-01-01 00:00:00' }
    ],
    channel: '微信',
    channels: [1],
    maxConcurrent: 5,
    online: false,
    isArchived: false,
    status: 'expired',
    joinDate: '2023-01-01',
    gender: '男'
  }
]
