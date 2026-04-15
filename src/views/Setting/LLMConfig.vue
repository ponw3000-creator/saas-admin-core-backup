<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useChatStore } from '@/store/chatStore'
import { QuestionFilled } from '@element-plus/icons-vue'
import { useConfirmDelete } from '@/utils/useConfirmDelete'

const { confirmDelete } = useConfirmDelete()
const chatStore = useChatStore()

const engineTypeOptions = [
  { label: '公有云 API (如 OpenAI)', value: 'public' },
  { label: '本地私有化 (如 Ollama)', value: 'local' }
]

const tableData = ref([
  {
    id: 1,
    engineType: 'public',
    apiBaseUrl: 'https://api.openai.com/v1',
    apiKey: 'sk-xxxxxx',
    modelName: 'gpt-4o',
    tokenLimit: 128000
  },
  {
    id: 2,
    engineType: 'local',
    apiBaseUrl: 'http://localhost:11434/api',
    apiKey: '',
    modelName: 'qwen:14b',
    tokenLimit: 8192
  }
])

const formRef = ref(null)
const dialogVisible = ref(false)
const isEditing = ref(false)
const currentEditId = ref(null)

const form = reactive({
  engineType: 'public',
  apiBaseUrl: '',
  apiKey: '',
  modelName: '',
  tokenLimit: 4096
})

const rules = {
  engineType: [{ required: true, message: '请选择引擎类型', trigger: 'change' }],
  apiBaseUrl: [{ required: true, message: '请输入 API 基础地址', trigger: 'blur' }],
  modelName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  tokenLimit: [
    { required: true, message: '请输入上下文长度', trigger: 'blur' },
    { type: 'number', min: 1, message: '上下文长度必须大于 0', trigger: 'blur' }
  ]
}

const handleAdd = () => {
  isEditing.value = false
  currentEditId.value = null
  Object.assign(form, {
    engineType: 'public',
    apiBaseUrl: '',
    apiKey: '',
    modelName: '',
    tokenLimit: 4096
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEditing.value = true
  currentEditId.value = row.id
  Object.assign(form, {
    engineType: row.engineType,
    apiBaseUrl: row.apiBaseUrl,
    apiKey: row.apiKey,
    modelName: row.modelName,
    tokenLimit: row.tokenLimit
  })
  dialogVisible.value = true
}

const handleDelete = (row) => {
  confirmDelete(row.modelName, () => {
    tableData.value = tableData.value.filter(item => item.id !== row.id)
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEditing.value) {
        const index = tableData.value.findIndex(item => item.id === currentEditId.value)
        if (index !== -1) {
          tableData.value[index] = { ...form, id: currentEditId.value }
        }
        ElMessage.success('更新成功')
      } else {
        tableData.value.push({
          ...form,
          id: Date.now()
        })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleSetDefault = (row) => {
  chatStore.setActiveModel(row.id)
  ElMessage.success(`已切换为 ${row.modelName}`)
}
</script>

<template>
  <div class="llm-config-page">
    <el-alert
      type="warning"
      :closable="false"
      show-icon
      class="config-alert"
    >
      <template #title>
        <span class="alert-content">
          切换本地私有化模型后，由于算力差异，回复延迟可能增加，系统将自动开启流式输出加载动画。
        </span>
      </template>
    </el-alert>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">AI 模型配置列表</span>
          <el-button type="primary" @click="handleAdd">新增配置</el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="engineType" label="引擎类型" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.engineType === 'public' ? 'success' : 'warning'">
              {{ row.engineType === 'public' ? '公有云 API' : '本地私有化' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="apiBaseUrl" label="API 基础地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="apiKey" label="认证秘钥" min-width="150" align="center">
          <template #default="{ row }">
            <span v-if="row.apiKey">{{ row.apiKey.replace(/./g, '*') }}</span>
            <span v-else class="no-key">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="modelName" label="模型名称" min-width="120" show-overflow-tooltip />
        <el-table-column label="当前状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.id === chatStore.activeModelId" type="success" size="small">使用中</el-tag>
            <el-tag v-else type="info" size="small">未启用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tokenLimit" label="上下文长度 (Token)" min-width="120" align="center" />
        <el-table-column label="操作" min-width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            <el-button
              v-if="row.id !== chatStore.activeModelId"
              type="success"
              link
              size="small"
              @click="handleSetDefault(row)"
            >设为默认</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑模型配置' : '新增模型配置'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="130px"
      >
        <el-form-item label="引擎类型" prop="engineType">
          <el-select v-model="form.engineType" placeholder="请选择引擎类型" style="width: 100%">
            <el-option
              v-for="item in engineTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="API 基础地址" prop="apiBaseUrl">
          <el-input v-model="form.apiBaseUrl" placeholder="如: https://api.openai.com/v1" />
        </el-form-item>

        <el-form-item label="认证秘钥" prop="apiKey">
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            placeholder="请输入 API Key"
          />
        </el-form-item>

        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="form.modelName" placeholder="如: gpt-4o 或 qwen:14b" />
        </el-form-item>

        <el-form-item prop="tokenLimit">
          <template #label>
            <span style="display: inline-flex; align-items: center; gap: 4px;">
              上下文长度
              <el-tooltip
  content="Token（上下文长度）：大模型单次对话能记忆的最大字符量限制。设置过高可能导致计费增加与响应变慢；设置过低将导致模型频繁‘失忆’，无法联系上下文或回答被强行截断。"
  placement="top"
>
  <el-icon><QuestionFilled /></el-icon>
</el-tooltip>
            </span>
          </template>
          <el-input-number
            v-model="form.tokenLimit"
            :min="1"
            :max="2000000"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.llm-config-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-alert {
  border-radius: 8px;
}

.alert-content {
  font-size: 14px;
  color: #903;
}

.table-card {
  border-radius: 8px;
  border: 1px solid #e4e4e7;
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.no-key {
  color: #999;
  font-style: italic;
}
</style>
