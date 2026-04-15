<script setup>
import { computed } from 'vue'
import { useGlobalStore } from '@/store/global'
import { QuestionFilled } from '@element-plus/icons-vue'

const props = defineProps({
  dictKey: {
    type: String,
    required: true
  }
})

const globalStore = useGlobalStore()
const entry = computed(() => globalStore.metricsDict[props.dictKey])
</script>

<template>
  <el-tooltip
    v-if="entry"
    :content="`${entry.title}：${entry.desc}`"
    placement="top"
    effect="light"
  >
    <el-icon class="info-icon"><QuestionFilled /></el-icon>
  </el-tooltip>
</template>

<style scoped>
.info-icon {
  color: #909399;
  cursor: pointer;
  margin-left: 4px;
  vertical-align: middle;
  transition: color 0.2s;
}

.info-icon:hover {
  color: #409eff;
}
</style>