<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useChatStore } from '@/store/chatStore'

const chatStore = useChatStore()
const watermarkRef = ref(null)
let observer = null

const generateWatermarkBase64 = () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1

  canvas.width = 400 * dpr
  canvas.height = 200 * dpr

  ctx.scale(dpr, dpr)
  ctx.rotate(-0.5)

  const workerId = chatStore.currentWorkerId || 'KF-0000'
  const timestamp = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  const watermarkText = `机密・${workerId}・${timestamp}`

  ctx.font = '16px Arial'
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(watermarkText, 30, 100)

  return canvas.toDataURL('image/png')
}

const initWatermark = () => {
  if (!watermarkRef.value) return

  const existingWatermark = watermarkRef.value.querySelector('.watermark-layer')
  if (existingWatermark) {
    existingWatermark.remove()
  }

  const layer = document.createElement('div')
  layer.className = 'watermark-layer'
  layer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
    background-image: url(${generateWatermarkBase64()});
    background-repeat: repeat;
    background-size: 400px 200px;
    opacity: 1;
  `

  watermarkRef.value.appendChild(layer)
}

const setupMutationObserver = () => {
  observer = new MutationObserver((mutations) => {
    const hasWatermark = watermarkRef.value?.querySelector('.watermark-layer')
    if (!hasWatermark) {
      initWatermark()
    }
  })

  observer.observe(watermarkRef.value, {
    childList: true,
    subtree: true
  })
}

onMounted(() => {
  initWatermark()
  setupMutationObserver()
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <div ref="watermarkRef" class="watermark-container"></div>
</template>

<style scoped>
.watermark-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}
</style>
