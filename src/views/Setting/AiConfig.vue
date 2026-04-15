<script setup>
import { reactive } from 'vue'
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
        <el-form-item label="Dify API Key">
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            placeholder="请输入 Dify API Key"
          />
        </el-form-item>
        <el-form-item label="接口地址">
          <el-input v-model="form.baseUrl" placeholder="https://api.dify.ai/v1" />
        </el-form-item>
        <el-form-item label="系统提示词">
          <div class="form-label-row">
            <span>System Prompt</span>
            <InfoLabel dict-key="system_prompt_hint" />
          </div>
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