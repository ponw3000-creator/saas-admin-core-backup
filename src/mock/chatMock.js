// [业务规范] 会话列表数据 - 纯数据，无响应式包装
export const chatSessionsMockData = [
  {
    id: 1,
    name: '张三',
    status: '在线',
    channel_id: 1,
    lastMsg: '我想咨询产品报价',
    time: '刚刚',
    summary: '客户对企业版套餐感兴趣，询问价格区间与功能差异。客服已介绍基础版与高级版的主要区别，客户表示需要内部讨论后回复。',
    fullHistory: [
      { time: '10:00', role: 'ai', text: '您好！我是智能客服小e，请问有什么可以帮您？' },
      { time: '10:01', role: 'user', text: '我想咨询一下你们的企业版套餐' },
      { time: '10:01', role: 'ai', text: '好的，我们企业版套餐分为基础版、高级版和旗舰版。请问您公司规模是多大呢？' }
    ]
  },
  {
    id: 2,
    name: '李四',
    status: '在线',
    channel_id: 3,
    lastMsg: '退款申请审核进度',
    time: '10:32',
    summary: '客户提交退款申请已5个工作日，询问审核进度。客服查询后告知正在财务复核阶段，预计2-3个工作日内完成。',
    fullHistory: []
  },
  {
    id: 3,
    name: '王五',
    status: '离线',
    channel_id: 2,
    lastMsg: '发票怎么开具',
    time: '09:15',
    summary: '客户咨询如何申请电子发票，客服已发送操作指引链接，客户未再回复。',
    fullHistory: []
  },
  {
    id: 4,
    name: '赵六',
    status: '在线',
    channel_id: 5,
    lastMsg: '会员如何升级',
    time: '昨天',
    summary: '客户询问会员升级规则与权益差异，已介绍当前等级特权及升级条件，客户表示考虑中。',
    fullHistory: []
  },
  {
    id: 5,
    name: '钱七',
    status: '离线',
    channel_id: 4,
    lastMsg: '密码忘了怎么办',
    time: '昨天',
    summary: '客户忘记登录密码，客服引导通过邮箱验证码重置密码，客户已成功重置。',
    fullHistory: []
  }
]
