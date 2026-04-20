import { defineStore } from 'pinia'
import { ref } from 'vue'
import { setGlobalThemeColor } from '@/utils/theme'

export const useAppStore = defineStore('app', () => {
  const themeColor = ref('#409eff')
  const aiAnimSpeed = ref(1.8)
  const language = ref('zh-CN')
  const globalFallbackAvatar = ref('')

  const setThemeColor = (color) => {
    themeColor.value = color
    setGlobalThemeColor(color)
  }

  const setAiAnimSpeed = (speed) => {
    aiAnimSpeed.value = speed
  }

  const setLanguage = (lang) => {
    language.value = lang
  }

  const setGlobalFallbackAvatar = (url) => {
    globalFallbackAvatar.value = url
  }

  const savePreferences = (settings) => {
    themeColor.value = settings.themeColor
    aiAnimSpeed.value = settings.aiAnimSpeed
    language.value = settings.language
    if (settings.globalFallbackAvatar !== undefined) {
      globalFallbackAvatar.value = settings.globalFallbackAvatar
    }
    setThemeColor(settings.themeColor)
  }

  return {
    themeColor,
    aiAnimSpeed,
    language,
    globalFallbackAvatar,
    setThemeColor,
    setAiAnimSpeed,
    setLanguage,
    setGlobalFallbackAvatar,
    savePreferences
  }
})
