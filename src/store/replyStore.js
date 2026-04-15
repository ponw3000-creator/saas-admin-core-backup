import { defineStore } from 'pinia'

export const useReplyStore = defineStore('reply', {
  state: () => ({
    quickReplies: [
      { shortcut: '你好', content: '您好，很高兴为您服务！请问有什么可以帮您？', enabled: true },
      { shortcut: '退款', content: '请提供您的订单号，我马上为您核实退款进度。', enabled: true },
      { shortcut: '人工', content: '正在为您转接人工客服，请稍候...', enabled: true }
    ]
  }),
  actions: {
    updateReply(index, reply) {
      if (index >= 0 && index < this.quickReplies.length) {
        this.quickReplies[index] = { ...reply }
      }
    },
    addReply(reply) {
      this.quickReplies.push({ ...reply })
    },
    deleteReply(index) {
      if (index >= 0 && index < this.quickReplies.length) {
        this.quickReplies.splice(index, 1)
      }
    },
    toggleReply(index) {
      if (index >= 0 && index < this.quickReplies.length) {
        this.quickReplies[index].enabled = !this.quickReplies[index].enabled
      }
    }
  }
})