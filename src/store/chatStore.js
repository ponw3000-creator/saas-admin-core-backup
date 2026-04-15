import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    activeSessions: [],
    currentSessionId: null,
    currentUserRole: 'normal',
    currentWorkerId: 'KF-8801',
    activeModelId: 1
  }),
  actions: {
    setActiveModel(id) {
      this.activeModelId = id
    }
  }
})