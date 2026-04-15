<script setup>
import { ref } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { logOperation } from '@/utils/auditLogger'
import { useConfirmDelete } from '@/utils/useConfirmDelete'

const { confirmDelete } = useConfirmDelete()

const searchKeyword = ref('')

const tableData = ref([
  { id: 1, dict_key: 'total_inbound', title: '今日总进线量', desc: '统计周期内从各渠道进入客服系统的来访总人数，反映业务流量规模。' },
  { id: 2, dict_key: 'token_cost', title: 'Token 消耗', desc: '每次 AI 对话消耗的 Token 数量（含 Input 与 Output），按量计费。' },
  { id: 3, dict_key: 'ai_fee_est', title: '预估 AI 费用', desc: '基于 Token 消耗量与模型单价估算的当日 AI 服务成本。' },
  { id: 4, dict_key: 'avg_session_cost', title: '单均会话成本', desc: '总 AI 费用 ÷ 总会话数，代表每场对话的平均成本。' },
  { id: 5, dict_key: 'ai_resolution', title: 'AI 独立解决率', desc: '无需人工介入、由 AI 独立完成回答的会话占比。' },
  { id: 6, dict_key: 'aht_time', title: '平均处理时长（AHT）', desc: '从用户发起到问题解决的平均总时长。' },
  { id: 7, dict_key: 'csat_score', title: '满意度评分（CSAT）', desc: '用户在会话结束后对服务质量的评分（好评/中评/差评）。' },
  { id: 8, dict_key: 'intent_tags', title: '意向标签', desc: '基于用户行为和对话内容打上的兴趣/意图标识。' },
  { id: 9, dict_key: 'session_duration', title: '会话时长', desc: '从用户发起咨询到会话结束的总时长。' },
  { id: 10, dict_key: 'avg_first_response', title: '平均首次响应耗时', desc: '从用户发出第一条消息，到系统给出首次回复的时间差。' },
  { id: 11, dict_key: 'avg_ai_response', title: '平均 AI 回复耗时', desc: '大语言模型生成并返回完整文本的平均耗时。' },
  { id: 12, dict_key: 'kb_hit_rate', title: '知识库命中率', desc: 'AI 回复内容中，成功匹配并引用现有知识库的会话占比。' },
  { id: 13, dict_key: 'chat_completion_rate', title: '对话完成率', desc: '用户得到明确答复且正常结束对话的比例。' }
])

const dialogVisible = ref(false)
const dialogTitle = ref('编辑字典项')
const formData = ref({ id: null, dict_key: '', title: '', desc: '' })
const isEdit = ref(false)

function handleEdit(row) {
  formData.value = { ...row }
  dialogTitle.value = '编辑字典项'
  isEdit.value = true
  dialogVisible.value = true
}

function handleAdd() {
  formData.value = { id: null, dict_key: '', title: '', desc: '' }
  dialogTitle.value = '新增字典项'
  isEdit.value = false
  dialogVisible.value = true
}

function handleDelete(row) {
  confirmDelete(row.title, () => {
    tableData.value = tableData.value.filter(item => item.id !== row.id)
    console.log(`[操作日志] 账号 admin 删除了字典项: ${row.dict_key}`)
    logOperation('字典管理', '删除字典项', { dict_key: row.dict_key, title: row.title }, '-')
  })
}

function handleConfirm() {
  if (isEdit.value) {
    console.log(`[操作日志] 账号 admin 编辑了字典项: ${formData.value.dict_key}`)
    const idx = tableData.value.findIndex(item => item.id === formData.value.id)
    if (idx !== -1) tableData.value[idx] = { ...formData.value }
    logOperation('字典管理', '编辑字典项', { dict_key: formData.value.dict_key }, { dict_key: formData.value.dict_key })
  } else {
    console.log(`[操作日志] 账号 admin 新增了字典项: ${formData.value.dict_key}`)
    const newItem = { id: Date.now(), ...formData.value }
    tableData.value.unshift(newItem)
    logOperation('字典管理', '新增字典项', '-', { dict_key: newItem.dict_key, title: newItem.title })
  }
  dialogVisible.value = false
}
</script>

<template>
  <div class="dict-page">
    <el-card class="dict-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">字典管理</span>
          <el-button type="primary" @click="handleAdd">
            <span style="margin-right: 4px">+</span> 新增字典项
          </el-button>
        </div>
      </template>

      <div class="toolbar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索字典 Key 或名称..."
          style="width: 280px"
          clearable
        />
      </div>

      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="dict_key" label="字典 Key" width="220">
          <template #default="{ row }">
            <code class="dict-key">{{ row.dict_key }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="字典名称" width="200" />
        <el-table-column prop="desc" label="字典描述">
          <template #default="{ row }">
            <span class="desc-text" :title="row.desc">{{ row.desc }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" destroy-on-close>
      <el-form :model="formData" label-width="90px">
        <el-form-item prop="dict_key">
          <template #label>
            <div style="display: inline-flex; align-items: center;">
              <span>字典 Key</span>
              <el-tooltip content="该 Key 是系统读取文案的唯一凭证，需保持全局唯一。建议遵循 模块_功能_具体项 的规范（如 db_metric_token）。修改已上线 Key 可能导致报错。" placement="top">
                <el-icon style="margin-left: 4px; cursor: pointer; color: #909399;">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input v-model="formData.dict_key" placeholder="如 token_cost" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="字典名称">
          <el-input v-model="formData.title" placeholder="如 Token 消耗" />
        </el-form-item>
        <el-form-item label="字典描述">
          <el-input v-model="formData.desc" type="textarea" :rows="3" placeholder="请输入完整描述文案" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.dict-page {
  padding: 0;
}

.dict-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.dict-key {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.desc-text {
  display: block;
  max-width: 480px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #606266;
  font-size: 13px;
}
</style>