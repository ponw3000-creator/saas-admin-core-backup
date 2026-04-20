<script setup>
import { computed } from 'vue'
import { getAvatarColor, getAvatarText } from '@/utils/avatar'
import { useAppStore } from '@/store/app'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true,
    default: ''
  },
  size: {
    type: [Number, String],
    default: 40
  }
})

const appStore = useAppStore()

const avatarLevel = computed(() => {
  if (props.src) return 'personal'
  if (appStore.globalFallbackAvatar) return 'global'
  return 'initial'
})

const displaySrc = computed(() => {
  if (props.src) return props.src
  if (appStore.globalFallbackAvatar) return appStore.globalFallbackAvatar
  return ''
})

const bgColor = computed(() => {
  return getAvatarColor(props.name)
})

const displayText = computed(() => {
  return getAvatarText(props.name)
})

const resolvedSize = computed(() => {
  return typeof props.size === 'number' ? props.size : parseInt(props.size) || 40
})
</script>

<template>
  <el-avatar
    v-if="displaySrc"
    :src="displaySrc"
    :size="resolvedSize"
  />
  <el-avatar
    v-else
    :size="resolvedSize"
    :style="{ backgroundColor: bgColor, color: '#ffffff', fontWeight: 600, fontSize: resolvedSize * 0.4 + 'px' }"
  >
    {{ displayText }}
  </el-avatar>
</template>
