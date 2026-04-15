<script setup>
import { onMounted } from 'vue'
import { useGlobalStore } from '@/store/global'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const globalStore = useGlobalStore()

onMounted(() => {
  globalStore.initSystemDict()
})
</script>

<template>
  <el-config-provider :locale="zhCn" size="default">
    <router-view />
  </el-config-provider>
</template>

<style>
/* ==========================================
   表格操作列按钮：底层变量穿透对齐 (14px)
   ========================================== */
.el-table .el-button.is-link,
.el-table .el-button.is-text {
  --el-button-size: 14px !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  height: auto !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  vertical-align: middle !important;
}
.el-table .el-button.is-link > span,
.el-table .el-button.is-text > span {
  font-size: 14px !important;
}
</style>
