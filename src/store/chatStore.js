import { defineStore } from 'pinia'

const ROLE_WEIGHT_MAP = {
  super_admin: 100,
  admin: 80,
  leader: 50,
  agent: 10
}

const ROLE_PERMISSIONS_MAP = {
  super_admin: ['*'],
  admin: [
    'menu:preferences', 'menu:ai', 'menu:llm', 'menu:knowledge', 'menu:team', 'menu:role', 'menu:oplog', 'menu:dictionary',
    'menu:chat', 'menu:ticket', 'menu:dashboard',
    'btn:account:add', 'btn:account:edit', 'btn:account:delete', 'btn:role:edit', 'btn:role:assign'
  ],
  leader: [
    'menu:preferences', 'menu:knowledge',
    'menu:chat', 'menu:ticket', 'menu:dashboard',
    'btn:account:add', 'btn:account:edit'
  ],
  agent: [
    'menu:preferences', 'menu:knowledge',
    'menu:chat', 'menu:ticket',
    'btn:account:view'
  ]
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    activeSessions: [],
    currentSessionId: null,
    currentUserRole: 'agent',
    currentUserWeight: ROLE_WEIGHT_MAP['agent'],
    currentUserPath: '1.2.3',
    currentWorkerId: 'KF-8801',
    activeModelId: 1,
    currentUserPermissions: []
  }),
  getters: {
    roleWeight: (state) => ROLE_WEIGHT_MAP[state.currentUserRole] || 0,
    isSuperAdmin: (state) => state.currentUserRole === 'super_admin',
    isAdmin: (state) => state.currentUserRole === 'admin',
    isLeader: (state) => state.currentUserRole === 'leader',
    isAgent: (state) => state.currentUserRole === 'agent',
    canAssignRole: (state) => (targetRole) => {
      if (state.currentUserRole === 'super_admin') return true
      const currentWeight = ROLE_WEIGHT_MAP[state.currentUserRole] || 0
      const targetWeight = ROLE_WEIGHT_MAP[targetRole] || 0
      return currentWeight > targetWeight
    },
    canEditUser: (state) => (targetPath, targetWeight) => {
      if (state.currentUserRole === 'super_admin') return true
      if (!targetPath) return false
      const currentWeight = ROLE_WEIGHT_MAP[state.currentUserRole] || 0
      return targetPath.startsWith(state.currentUserPath) && currentWeight > targetWeight
    },
    permissions: (state) => {
      if (state.currentUserRole === 'super_admin') return ['*']
      return state.currentUserPermissions
    },
    hasPermission: (state) => (permission) => {
      if (state.currentUserRole === 'super_admin') return true
      if (state.currentUserPermissions.includes('*')) return true
      return state.currentUserPermissions.includes(permission)
    }
  },
  actions: {
    setActiveModel(id) {
      this.activeModelId = id
    },
    switchRole(role) {
      if (ROLE_WEIGHT_MAP[role]) {
        this.currentUserRole = role
        this.currentUserWeight = ROLE_WEIGHT_MAP[role]
        this.currentUserPermissions = ROLE_PERMISSIONS_MAP[role] || []
        try {
          localStorage.setItem('saas_role', role)
          localStorage.setItem('saas_permissions', JSON.stringify(this.currentUserPermissions))
        } catch (e) {}
      }
    },
    setUserRole(role) {
      this.switchRole(role)
    },
    setUserPath(path) {
      this.currentUserPath = path
    },
    setUserPermissions(permissions) {
      this.currentUserPermissions = permissions
    },
    initFromStorage() {
      try {
        const savedRole = localStorage.getItem('saas_role')
        if (savedRole && ROLE_WEIGHT_MAP[savedRole]) {
          this.switchRole(savedRole)
        }
      } catch (e) {}
    }
  }
})

export { ROLE_WEIGHT_MAP, ROLE_PERMISSIONS_MAP }