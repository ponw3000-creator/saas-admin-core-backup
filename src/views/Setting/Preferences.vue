<template>
  <div class="system-preferences">
    <div class="page-header">
      <h2 class="page-title">基础偏好设置</h2>
      <span class="page-desc">管理系统的显示语言、全局主题色及 AI 交互视觉动效</span>
    </div>
    <el-divider />

    <el-form label-width="140px" class="preference-form" label-position="left">
      <el-form-item label="系统显示语言">
        <div class="form-item-content">
          <el-radio-group v-model="settings.language">
            <el-radio label="zh-CN">简体中文</el-radio>
            <el-radio label="en-US">English</el-radio>
          </el-radio-group>
          <div class="setting-tip">切换语言将立即生效，但用户产生的业务数据仍保持原语言。</div>
        </div>
      </el-form-item>

      <el-form-item label="全局主题色">
        <div class="form-item-content">
          <el-color-picker
            v-model="settings.themeColor"
            color-format="hex"
            :predefine="['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#626aef']"
            @change="handleColorChange"
          />
          <div class="setting-tip">调整后将应用于全局高亮、按钮样式及 AI 星芒光晕效果。</div>
        </div>
      </el-form-item>

      <el-form-item label="AI 思考动画节奏">
        <div class="form-item-content">
          <el-slider
            v-model="settings.aiAnimSpeed"
            :min="0.5"
            :max="3"
            :step="0.1"
            style="width: 300px"
          />
          <div class="setting-tip">控制 AI 思考时星芒图标的呼吸循环时长（秒），当前值：{{ settings.aiAnimSpeed }}s。</div>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSave">保存配置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()

const settings = reactive({
  language: appStore.language,
  themeColor: appStore.themeColor,
  aiAnimSpeed: appStore.aiAnimSpeed
})

const handleColorChange = (color) => {
  appStore.setThemeColor(color)
}

const handleSave = () => {
  appStore.savePreferences(settings)
  ElMessage.success('系统偏好设置已保存')
  console.log('保存的新配置：', settings)
}
</script>

<style scoped>
.system-preferences {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  height: 100%;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.page-desc {
  font-size: 13px;
  color: #909399;
}

.preference-form {
  max-width: 600px;
  margin-top: 30px;
}

.form-item-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.setting-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 8px;
}
</style>
