<script setup>
import { reactive } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import InfoLabel from '@/components/InfoLabel.vue'
import { logOperation } from '@/utils/auditLogger'

const form = reactive({
  apiKey: '',
  baseUrl: 'https://api.dify.ai/v1',
  systemPrompt: ''
})

const save = () => {
  logOperation('AI 模型配置', '保存配置', form, form)
}
</script>

<template>
  <div class="ai-config-page">
    <el-card class="config-card" shadow="never">
      <template #header>
        <span class="card-title">AI 模型配置</span>
      </template>
      <el-form :model="form" label-width="120px" class="config-form">
        <el-form-item>
          <template #label>
            <span style="display: inline-flex; align-items: center; gap: 4px;">
              Dify API Key
              <el-tooltip placement="top" effect="dark" popper-class="pro-tooltip">
                <template #content>
                  <div>
                    <div style="font-weight: 600; margin-bottom: 6px;">Dify API Key</div>
                    <div style="line-height: 1.6;">用于连接 Dify 平台 AI 模型的密钥凭证，可在 Dify 控制台「设置 → API Key」页面复制获取。</div>
                  </div>
                </template>
                <el-icon style="color: #909399; cursor: pointer; vertical-align: middle;"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            placeholder="请输入 Dify API Key"
          />
        </el-form-item>
        <el-form-item>
          <template #label>
            <span style="display: inline-flex; align-items: center; gap: 4px;">
              接口地址
              <el-tooltip placement="top" effect="dark" popper-class="pro-tooltip">
                <template #content>
                  <div>
                    <div style="font-weight: 600; margin-bottom: 6px;">接口地址</div>
                    <div style="line-height: 1.6;">Dify API 的后端服务地址，默认 https://api.dify.ai/v1。若您使用私有化部署，请替换为对应的域名或 IP + 端口。</div>
                  </div>
                </template>
                <el-icon style="color: #909399; cursor: pointer; vertical-align: middle;"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input v-model="form.baseUrl" placeholder="https://api.dify.ai/v1" />
        </el-form-item>
        <el-form-item>
          <template #label>
            <span style="display: inline-flex; align-items: center; gap: 4px;">
              系统提示词
              <InfoLabel dict-key="system_prompt_hint" />
            </span>
          </template>
          <el-input
            v-model="form.systemPrompt"
            type="textarea"
            :rows="6"
            placeholder="设定 AI 客服的语气、禁忌话题、回复边界等..."
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存配置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.ai-config-page {
  height: 100%;
}

.config-card {
  border-radius: 8px;
  border: 1px solid #e4e4e7;
  max-width: 680px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.config-form {
  margin-top: 8px;
}

.form-label-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>