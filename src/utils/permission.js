import { useChatStore } from '@/store/chatStore'

const ROLE_WEIGHT_MAP = {
  super_admin: 100,
  admin: 80,
  leader: 50,
  agent: 10
}

export function checkPermission(currentUser, targetUser) {
  if (!currentUser || !targetUser) {
    return false
  }

  if (currentUser.role === 'super_admin') {
    return true
  }

  const currentWeight = ROLE_WEIGHT_MAP[currentUser.role] || 0
  const targetWeight = ROLE_WEIGHT_MAP[targetUser.role] || 0

  if (currentWeight <= targetWeight) {
    return false
  }

  if (!targetUser.path) {
    return false
  }

  return targetUser.path.startsWith(currentUser.path)
}

export function hasMenuPermission(permissionCode) {
  if (!permissionCode) return true

  const chatStore = useChatStore()
  if (!chatStore) return false

  if (chatStore.currentUserRole === 'super_admin') return true
  if (chatStore.currentUserPermissions.includes('*')) return true

  return chatStore.currentUserPermissions.includes(permissionCode)
}

export function hasAnyPermission(permissionCodes) {
  if (!permissionCodes || !Array.isArray(permissionCodes) || permissionCodes.length === 0) {
    return true
  }

  const chatStore = useChatStore()
  if (!chatStore) return false

  if (chatStore.currentUserRole === 'super_admin') return true
  if (chatStore.currentUserPermissions.includes('*')) return true

  return permissionCodes.some(code => chatStore.currentUserPermissions.includes(code))
}

export function hasAllPermissions(permissionCodes) {
  if (!permissionCodes || !Array.isArray(permissionCodes) || permissionCodes.length === 0) {
    return true
  }

  const chatStore = useChatStore()
  if (!chatStore) return false

  if (chatStore.currentUserRole === 'super_admin') return true
  if (chatStore.currentUserPermissions.includes('*')) return true

  return permissionCodes.every(code => chatStore.currentUserPermissions.includes(code))
}

export function buildQueryParams(currentUser) {
  if (!currentUser) {
    return {}
  }

  return {
    pathPrefix: currentUser.path || ''
  }
}

export { ROLE_WEIGHT_MAP }
