import { useChatStore } from '@/store/chatStore'

export const vPermission = {
  mounted(el, binding) {
    const chatStore = useChatStore()
    const value = binding.value

    if (chatStore.currentUserRole === 'super_admin') {
      return
    }

    if (!value) {
      el.parentNode?.removeChild(el)
      return
    }

    if (chatStore.currentUserPermissions.includes('*')) {
      return
    }

    if (Array.isArray(value)) {
      if (value.includes(chatStore.currentUserRole)) {
        return
      }
      el.parentNode?.removeChild(el)
      return
    }

    if (typeof value === 'string') {
      if (chatStore.currentUserPermissions.includes(value)) {
        return
      }
      el.parentNode?.removeChild(el)
    }
  }
}

export const vRole = {
  mounted(el, binding) {
    const chatStore = useChatStore()
    const allowedRoles = binding.value

    if (!allowedRoles || !Array.isArray(allowedRoles)) {
      el.parentNode?.removeChild(el)
      return
    }

    if (chatStore.currentUserRole === 'super_admin') {
      return
    }

    if (!allowedRoles.includes(chatStore.currentUserRole)) {
      el.parentNode?.removeChild(el)
    }
  }
}

export default vPermission
