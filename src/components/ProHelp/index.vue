<template>
  <el-tooltip :content="content" placement="top" effect="dark" popper-class="pro-help-popper">
    <span class="pro-help-trigger" :class="{ danger: danger }">
      <el-icon><QuestionFilled /></el-icon>
    </span>
  </el-tooltip>
</template>

<script setup>
import { QuestionFilled } from '@element-plus/icons-vue'

defineProps({
  content: {
    type: String,
    required: true
  },
  danger: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.pro-help-trigger {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  flex-shrink: 0;
  height: 1em;
  color: var(--el-text-color-secondary);
}

.pro-help-trigger.danger {
  color: #cf1322;
}
</style>
