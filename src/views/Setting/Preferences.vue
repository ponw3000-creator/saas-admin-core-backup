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
            <el-radio value="zh-CN">简体中文</el-radio>
            <el-radio value="en-US">English</el-radio>
          </el-radio-group>
          <div class="setting-tip">切换语言将立即生效，但用户产生的业务数据仍保持原语言。</div>
        </div>
      </el-form-item>

      <el-form-item label="全局主题色">
        <div class="form-item-content">
          <el-color-picker
            v-model="settings.themeColor"
            color-format="hex"
            :predefine="THEME_COLORS"
            @change="handleColorChange"
          />
          <div class="setting-tip">调整后将应用于全局高亮、按钮样式及 AI 星芒光晕效果。</div>
        </div>
      </el-form-item>

      <el-form-item label="企业统一默认头像">
        <div class="form-item-content">
          <div class="avatar-upload-row">
            <el-upload
              class="avatar-uploader"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept=".jpg,.jpeg,.png"
              :before-upload="beforeAvatarUpload"
              :on-change="(file) => handleAvatarChange(file)"
            >
              <img v-if="settings.globalFallbackAvatar" :src="settings.globalFallbackAvatar" class="avatar-preview" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div v-if="settings.globalFallbackAvatar" class="avatar-clear">
              <el-button size="small" link type="danger" @click="handleAvatarRemove">移除</el-button>
            </div>
          </div>
          <div class="setting-tip">非必选。建议尺寸 400×400px (或 1:1 比例)，支持 jpg/png 格式，大小不超过 2MB。当客服未上传个人头像时，系统将全盘展示此头像作为兜底；若此处不配置，将根据员工姓名动态生成文字头像。</div>
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
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/store/app'
import { THEME_COLORS } from '@/config/theme'

const appStore = useAppStore()

const settings = reactive({
  language: appStore.language,
  themeColor: appStore.themeColor,
  aiAnimSpeed: appStore.aiAnimSpeed,
  globalFallbackAvatar: appStore.globalFallbackAvatar
})

const handleColorChange = (color) => {
  appStore.setThemeColor(color)
}

const beforeAvatarUpload = (rawFile) => {
  const allowedTypes = ['image/jpeg', 'image/png']
  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('头像图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像图片大小不能超过 2MB!')
    return false
  }
  return true
}

// TODO: 联调时需移除此本地预览逻辑，对接真实上传接口
const handleAvatarChange = (file) => {
  const url = URL.createObjectURL(file.raw)
  settings.globalFallbackAvatar = url
}

const handleAvatarRemove = () => {
  settings.globalFallbackAvatar = ''
}

const handleSave = () => {
  appStore.savePreferences(settings)
  ElMessage.success('系统偏好设置已保存')
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

.avatar-upload-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-uploader {
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  overflow: hidden;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 24px;
  color: #8c8c8c;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.avatar-clear {
  display: flex;
  flex-direction: column;
}
</style>
