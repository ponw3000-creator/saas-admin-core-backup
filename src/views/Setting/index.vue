<script setup>
import { ref, reactive } from 'vue'
import { Plus, DocumentCopy } from '@element-plus/icons-vue'

const activeTab = ref('ai-model')

const apiForm = reactive({
  apiKey: '',
  baseUrl: 'https://api.dify.ai/v1',
  systemPrompt: ''
})

const saveAiConfig = () => {}

const knowledgeData = reactive([
  { id: 1, question: '企业版价格是多少？', enabled: true },
  { id: 2, question: '如何申请退款？', enabled: false }
])

const addKnowledge = () => {}
</script>

<template>
  <div class="setting-page">
    <el-card class="setting-card" shadow="never">
      <el-tabs v-model="activeTab" class="setting-tabs">
        <el-tab-pane label="AI 模型配置" name="ai-model">
          <div class="tab-content">
            <el-form :model="apiForm" label-width="120px" class="config-form">
              <el-form-item label="Dify API Key">
                <el-input
                  v-model="apiForm.apiKey"
                  type="password"
                  show-password
                  placeholder="请输入 Dify API Key"
                />
              </el-form-item>
              <el-form-item label="接口地址">
                <el-input
                  v-model="apiForm.baseUrl"
                  placeholder="https://api.dify.ai/v1"
                />
              </el-form-item>
              <el-form-item label="系统提示词">
                <el-input
                  v-model="apiForm.systemPrompt"
                  type="textarea"
                  :rows="6"
                  placeholder="设定 AI 客服的语气、禁忌话题、回复边界等..."
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveAiConfig">保存配置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="知识与话术" name="knowledge">
          <div class="tab-content">
            <div class="toolbar">
              <el-button type="primary" @click="addKnowledge">
                <el-icon><Plus /></el-icon>
                新增快捷问题
              </el-button>
            </div>
            <el-table :data="knowledgeData" stripe class="knowledge-table">
              <el-table-column prop="question" label="问题内容" min-width="280" />
              <el-table-column label="状态" width="120" align="center">
                <template #default="{ row }">
                  <el-switch v-model="row.enabled" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center">
                <template #default>
                  <el-button link type="primary">编辑</el-button>
                  <el-button type="danger" link>删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="接入配置" name="integration">
          <div class="tab-content">
            <el-descriptions title="C 端通信凭证" :column="1" border class="cred-descriptions">
              <el-descriptions-item label="App Key">
                <div class="cred-row">
                  <el-input value="sk-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" readonly class="cred-input" />
                  <el-button @click="() => {}">
                    <el-icon><DocumentCopy /></el-icon>
                    复制
                  </el-button>
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.setting-page {
  height: 100%;
}

.setting-card {
  border-radius: 8px;
  border: 1px solid #e4e4e7;
}

.setting-tabs {
  margin-top: 4px;
}

.tab-content {
  padding: 28px 24px;
  min-height: 400px;
}

.config-form {
  max-width: 640px;
}

.toolbar {
  margin-bottom: 16px;
}

.knowledge-table {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.cred-descriptions {
  max-width: 640px;
}

.cred-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cred-input {
  flex: 1;
  max-width: 360px;
}

.cred-input :deep(.el-input__wrapper) {
  background-color: #fafafa;
}
</style>