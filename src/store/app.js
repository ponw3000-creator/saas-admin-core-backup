import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const themeColor = ref('#409eff')
  const aiAnimSpeed = ref(1.8)
  const language = ref('zh-CN')

  const setThemeColor = (color) => {
    if (!color) return
    themeColor.value = color
    const node = document.documentElement

    node.style.setProperty('--el-color-primary', color)

    for (let i = 1; i <= 9; i++) {
      node.style.setProperty(
        `--el-color-primary-light-${i}`,
        `color-mix(in srgb, white ${i * 10}%, ${color})`
      )
    }

    node.style.setProperty(
      '--el-color-primary-dark-2',
      `color-mix(in srgb, black 20%, ${color})`
    )
  }

  const setAiAnimSpeed = (speed) => {
    aiAnimSpeed.value = speed
  }

  const setLanguage = (lang) => {
    language.value = lang
  }

  const savePreferences = (settings) => {
    themeColor.value = settings.themeColor
    aiAnimSpeed.value = settings.aiAnimSpeed
    language.value = settings.language
    setThemeColor(settings.themeColor)
  }

  return {
    themeColor,
    aiAnimSpeed,
    language,
    setThemeColor,
    setAiAnimSpeed,
    setLanguage,
    savePreferences
  }
})
