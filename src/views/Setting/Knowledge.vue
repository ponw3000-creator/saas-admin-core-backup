<script setup>
import { ref, reactive, nextTick, onMounted, computed } from 'vue'
import { Plus, ArrowUp, ArrowDown, Top, QuestionFilled, Delete } from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import { trackOperation } from '@/utils/monitor'
import { logOperation } from '@/utils/auditLogger'
import { useConfirmDelete } from '@/utils/useConfirmDelete'
import Sortable from 'sortablejs'
import InfoLabel from '@/components/InfoLabel.vue'
import { useReplyStore } from '@/store/replyStore'
import { useChannelStore } from '@/store/channelStore'

const replyStore = useReplyStore()
const channelStore = useChannelStore()
const { confirmDelete } = useConfirmDelete()

const MAX_ANSWER_LENGTH = 500

const activeTab = ref('faq')
const channelFilter = ref('global')
const dialogVisible = ref(false)
const replyDialogVisible = ref(false)
const capsuleDialogVisible = ref(false)
const answerCharCount = ref(0)
const editForm = reactive({
  channels: [],
  question: '',
  answer: '',
  related_questions: [],
  timeType: 'permanent',
  timeRange: []
})
const replyForm = reactive({
  shortcut: '',
  content: '',
  timeType: 'permanent',
  timeRange: [],
  status: true
})
const capsuleForm = reactive({
  name: '',
  event: '',
  channels: [],
  timeType: 'permanent',
  timeRange: [],
  status: true
})
const isReplyEditing = ref(false)
const currentReplyIndex = ref(-1)
const isCapsuleEditing = ref(false)
const currentCapsuleIndex = ref(-1)

const channelOptions = computed(() => [
  { value: 'global', label: '全局通用' },
  ...channelStore.channelList
    .filter(ch => ch.name !== '全部适用')
    .map(ch => ({ value: ch.id, label: ch.name }))
])

const capsuleEventOptions = [
  { value: 'price_inquiry', label: 'price_inquiry - 价格咨询' },
  { value: 'transfer_human', label: 'transfer_human - 转人工客服' },
  { value: 'go_home', label: 'go_home - 返回首页' },
  { value: 'view_order', label: 'view_order - 查看订单' },
  { value: 'custom_service', label: 'custom_service - 专属客服' }
]

const relatedQuestionsOptions = ref([
  { value: '如何申请退款？', label: '如何申请退款？' },
  { value: '怎么联系人工客服？', label: '怎么联系人工客服？' },
  { value: '企业版价格是多少？', label: '企业版价格是多少？' },
  { value: '有哪些支付方式？', label: '有哪些支付方式？' },
  { value: '支持上门安装吗？', label: '支持上门安装吗？' },
  { value: '如何获取发票？', label: '如何获取发票？' }
])

const faqData = reactive([
  { id: 1, question: '企业版价格是多少？', enabled: true, priority: 1, startDate: '2024-01-01', endDate: '2024-12-31', channels: ['global', 1] },
  { id: 2, question: '如何申请退款？', enabled: true, priority: 2, startDate: '2024-01-01', endDate: '2024-12-31', channels: ['global', 4] },
  { id: 3, question: '怎么联系人工客服？', enabled: false, priority: 3, startDate: '2024-03-01', endDate: '2024-06-30', channels: [3] }
])

const capsuleData = reactive([
  { id: 1, name: '价格咨询', event: 'price_inquiry', enabled: true, channels: ['global'] },
  { id: 2, name: '人工客服', event: 'transfer_human', enabled: true, channels: [1, 4] },
  { id: 3, name: '返回首页', event: 'go_home', enabled: false, channels: [3] }
])

const faqTableRef = ref(null)
const capsuleTableRef = ref(null)
const replyTableRef = ref(null)

const handleChannelChange = (val, formRef) => {
  if (val.includes('ALL') && !formRef.channels.includes('ALL')) {
    formRef.channels = ['ALL']
  } else if (formRef.channels.includes('ALL') && val.length > 1) {
    formRef.channels = formRef.channels.filter(v => v !== 'ALL')
  }
}

const moveUp = (arr, index) => {
  if (index > 0) {
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
  }
}

const moveDown = (arr, index) => {
  if (index < arr.length - 1) {
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
  }
}

const moveTop = (arr, index) => {
  if (index > 0) {
    const item = arr.splice(index, 1)[0]
    arr.unshift(item)
  }
}

const initSortable = (tableRef, tableData) => {
  if (!tableRef) return
  const el = tableRef.$el.querySelector('.el-table__body-wrapper tbody')
  if (!el) return
  Sortable.create(el, {
    handle: '.drag-handle',
    onEnd: ({ oldIndex, newIndex }) => {
      if (oldIndex !== newIndex) {
        const item = tableData.splice(oldIndex, 1)[0]
        tableData.splice(newIndex, 0, item)
      }
    }
  })
}

onMounted(() => {
  nextTick(() => {
    initSortable(faqTableRef.value, faqData)
    initSortable(capsuleTableRef.value, capsuleData)
    initSortable(replyTableRef.value, replyStore.quickReplies)
  })
})

const onAnswerChange = () => {
  const plain = editForm.answer.replace(/<[^>]+>/g, '').trim()
  answerCharCount.value = plain.length
  if (plain.length > MAX_ANSWER_LENGTH) {
    ElMessage.warning(`答案内容最多支持 ${MAX_ANSWER_LENGTH} 个字符`)
    const truncated = plain.slice(0, MAX_ANSWER_LENGTH)
    editForm.answer = truncated
    answerCharCount.value = MAX_ANSWER_LENGTH
  }
}

const openDialog = () => {
  editForm.channels = []
  editForm.question = ''
  editForm.answer = ''
  editForm.related_questions = []
  editForm.timeType = 'permanent'
  editForm.timeRange = []
  answerCharCount.value = 0
  dialogVisible.value = true
}

const channelLabel = (vals) => {
  return vals.map(v => channelOptions.find(c => c.value === v)?.label || v)
}

const handleEdit = (row) => {
  editForm.channels = [...row.channels]
  editForm.question = row.question
  editForm.answer = ''
  editForm.related_questions = []
  editForm.timeType = 'custom'
  editForm.timeRange = [row.startDate + ' 00:00:00', row.endDate + ' 23:59:59']
  answerCharCount.value = 0
  dialogVisible.value = true
  trackOperation('知识与话术', '编辑 FAQ', { id: row.id, question: row.question })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确认要删除话术 <strong>「' + row.question + '」</strong> 吗？<br/><span style="color: #909399; font-size: 13px;">删除后将无法恢复。</span>',
      '删除确认',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }
    )
    logOperation('知识与话术', '删除 FAQ', { id: row.id, question: row.question }, '-')
    ElMessage.success('删除成功')
  } catch {
  }
}

const openReplyDialog = () => {
  isReplyEditing.value = false
  currentReplyIndex.value = -1
  replyForm.shortcut = ''
  replyForm.content = ''
  replyForm.timeType = 'permanent'
  replyForm.timeRange = []
  replyForm.status = true
  replyDialogVisible.value = true
}

const handleReplyEdit = (row, index) => {
  isReplyEditing.value = true
  currentReplyIndex.value = index
  replyForm.shortcut = row.shortcut
  replyForm.content = row.content
  replyForm.timeType = row.timeType || 'permanent'
  replyForm.timeRange = row.timeRange || []
  replyForm.status = row.enabled
  replyDialogVisible.value = true
}

const handleReplyDelete = async (index, shortcut) => {
  try {
    await ElMessageBox.confirm(
      '确认要删除快捷回复 <strong>「' + shortcut + '」</strong> 吗？<br/><span style="color: #909399; font-size: 13px;">删除后将无法恢复。</span>',
      '删除确认',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }
    )
    replyStore.deleteReply(index)
    ElMessage.success('删除成功')
  } catch {
  }
}

const handleReplySubmit = () => {
  const replyData = {
    shortcut: replyForm.shortcut,
    content: replyForm.content,
    timeType: replyForm.timeType,
    timeRange: replyForm.timeType === 'custom' ? replyForm.timeRange : [],
    enabled: replyForm.status
  }
  if (isReplyEditing.value) {
    replyStore.updateReply(currentReplyIndex.value, replyData)
    ElMessage.success('更新成功')
  } else {
    replyStore.addReply(replyData)
    ElMessage.success('新增成功')
  }
  replyDialogVisible.value = false
}

const openCapsuleDialog = (row, index) => {
  if (row && index !== undefined) {
    isCapsuleEditing.value = true
    currentCapsuleIndex.value = index
    capsuleForm.name = row.name
    capsuleForm.event = row.event
    capsuleForm.channels = [...row.channels]
    capsuleForm.timeType = row.timeType || 'permanent'
    capsuleForm.timeRange = row.timeRange || []
    capsuleForm.status = row.enabled
  } else {
    isCapsuleEditing.value = false
    currentCapsuleIndex.value = -1
    capsuleForm.name = ''
    capsuleForm.event = ''
    capsuleForm.channels = []
    capsuleForm.timeType = 'permanent'
    capsuleForm.timeRange = []
    capsuleForm.status = true
  }
  capsuleDialogVisible.value = true
}

const handleCapsuleDelete = async (index) => {
  try {
    await ElMessageBox.confirm(
      '确认要删除引导胶囊 <strong>「' + capsuleData[index]?.name + '」</strong> 吗？<br/><span style="color: #909399; font-size: 13px;">删除后将无法恢复。</span>',
      '删除确认',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }
    )
    capsuleData.splice(index, 1)
    ElMessage.success('删除成功')
  } catch {
  }
}

const handleCapsuleSubmit = () => {
  if (!capsuleForm.name || !capsuleForm.event) {
    ElMessage.warning('请填写完整的胶囊信息')
    return
  }
  const capsuleItem = {
    id: isCapsuleEditing.value ? capsuleData[currentCapsuleIndex.value].id : Date.now(),
    name: capsuleForm.name,
    event: capsuleForm.event,
    channels: [...capsuleForm.channels],
    timeType: capsuleForm.timeType,
    timeRange: capsuleForm.timeType === 'custom' ? capsuleForm.timeRange : [],
    enabled: capsuleForm.status
  }
  if (isCapsuleEditing.value) {
    capsuleData[currentCapsuleIndex.value] = capsuleItem
    ElMessage.success('更新成功')
  } else {
    capsuleData.push(capsuleItem)
    ElMessage.success('新增成功')
  }
  capsuleDialogVisible.value = false
  nextTick(() => {
    initSortable(capsuleTableRef.value, capsuleData)
  })
}
</script>

<template>
  <div class="knowledge-page">
    <el-card class="knowledge-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">知识与话术</span>
          <el-select v-model="channelFilter" placeholder="选择渠道" style="width: 180px">
            <el-option
              v-for="opt in channelOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card" class="knowledge-tabs">
        <el-tab-pane label="猜你想问" name="faq">
          <div class="action-bar">
            <el-button type="primary" @click="openDialog">
              <el-icon><Plus /></el-icon>
              新增问题
            </el-button>
          </div>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="💡 排序规则：列表优先级由高到低（自上而下），对应前端展示时也由上至下排列。"
            class="sort-tip"
          />
          <el-table ref="faqTableRef" :data="faqData" stripe class="data-table">
            <el-table-column label="" width="50" align="center" class-name="drag-handle">
              <template #default>
                <el-icon class="drag-icon"><Top /></el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="question" label="问题内容" min-width="200" />
            <el-table-column label="应用渠道" min-width="160">
              <template #default="{ row }">
                <el-tag
                  v-for="ch in row.channels"
                  :key="ch"
                  size="small"
                  style="margin-right: 4px"
                >{{ channelOptions.find(c => c.value === ch)?.label }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="有效期" width="220">
              <template #default="{ row }">
                {{ row.startDate }} 至 {{ row.endDate }}
              </template>
            </el-table-column>
            <el-table-column label="排序" width="130" align="center">
              <template #default="{ row, $index }">
                <el-button link title="置顶" @click="moveTop(faqData, $index)">
                  <el-icon><Top /></el-icon>
                </el-button>
                <el-button link title="上移" :disabled="$index === 0" @click="moveUp(faqData, $index)">
                  <el-icon><ArrowUp /></el-icon>
                </el-button>
                <el-button link title="下移" :disabled="$index === faqData.length - 1" @click="moveDown(faqData, $index)">
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="引导胶囊按钮" name="capsule">
          <template #label>
            引导胶囊按钮
            <InfoLabel dict-key="capsule_button_hint" />
          </template>
          <div class="action-bar">
            <el-button type="primary" @click="openCapsuleDialog()">
              <el-icon><Plus /></el-icon>
              新增胶囊
            </el-button>
          </div>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="💡 排序规则：列表优先级由高到低（自上而下），对应前端用户对话框展示时由左至右排列。"
            class="sort-tip"
          />
          <el-table ref="capsuleTableRef" :data="capsuleData" stripe class="data-table">
            <el-table-column label="" width="50" align="center" class-name="drag-handle">
              <template #default>
                <el-icon class="drag-icon"><Top /></el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="按钮名称" min-width="140" />
            <el-table-column prop="event" label="触发事件" min-width="160" />
            <el-table-column label="应用渠道" min-width="140">
              <template #default="{ row }">
                <el-tag
                  v-for="ch in row.channels"
                  :key="ch"
                  size="small"
                  style="margin-right: 4px"
                >{{ channelOptions.find(c => c.value === ch)?.label }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="排序" width="130" align="center">
              <template #default="{ row, $index }">
                <el-button link title="置顶" @click="moveTop(capsuleData, $index)">
                  <el-icon><Top /></el-icon>
                </el-button>
                <el-button link title="上移" :disabled="$index === 0" @click="moveUp(capsuleData, $index)">
                  <el-icon><ArrowUp /></el-icon>
                </el-button>
                <el-button link title="下移" :disabled="$index === capsuleData.length - 1" @click="moveDown(capsuleData, $index)">
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row, $index }">
                <el-button link type="primary" @click="openCapsuleDialog(row, $index)">编辑</el-button>
                <el-button type="danger" link @click="handleCapsuleDelete($index)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="客服快捷回复" name="reply">
          <template #label>
            客服快捷回复
            <InfoLabel dict-key="quick_reply_hint" />
          </template>
          <div class="action-bar">
            <el-button type="primary" @click="openReplyDialog">
              <el-icon><Plus /></el-icon>
              新增话术
            </el-button>
          </div>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="💡 排序规则：列表优先级由高到低（自上而下），对应前端展示时也由上至下排列。"
            class="sort-tip"
          />
          <el-table ref="replyTableRef" :data="replyStore.quickReplies" stripe class="data-table">
            <el-table-column label="" width="50" align="center" class-name="drag-handle">
              <template #default>
                <el-icon class="drag-icon"><Top /></el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="shortcut" label="触发词" width="120" align="center" />
            <el-table-column prop="content" label="回复内容" min-width="240" show-overflow-tooltip />
            <el-table-column label="排序" width="130" align="center">
              <template #default="{ row, $index }">
                <el-button link title="置顶" @click="moveTop(replyStore.quickReplies, $index)">
                  <el-icon><Top /></el-icon>
                </el-button>
                <el-button link title="上移" :disabled="$index === 0" @click="moveUp(replyStore.quickReplies, $index)">
                  <el-icon><ArrowUp /></el-icon>
                </el-button>
                <el-button link title="下移" :disabled="$index === replyStore.quickReplies.length - 1" @click="moveDown(replyStore.quickReplies, $index)">
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row, $index }">
                <el-button link type="primary" size="small" @click="handleReplyEdit(row, $index)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleReplyDelete($index, row.shortcut)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增 / 编辑 FAQ" width="800px">
      <el-form :model="editForm" label-position="right" label-width="130px">
        <el-form-item label="适用渠道">
          <el-select
            v-model="editForm.channels"
            multiple
            filterable
            placeholder="请选择适用渠道"
            style="width: 100%"
            @change="(val) => handleChannelChange(val, editForm)"
          >
            <el-option
              v-for="opt in channelOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="问题标题">
          <el-input v-model="editForm.question" placeholder="请输入用户可能问到的问题" />
        </el-form-item>
        <el-form-item label="答案内容">
          <div class="editor-wrapper">
            <QuillEditor
              v-model:content="editForm.answer"
              content-type="html"
              theme="snow"
              toolbar="minimal"
              placeholder="请输入答案内容，支持图文混排..."
              class="quill-editor"
              @text-change="onAnswerChange"
            />
            <div class="editor-footer">
              <span class="char-count" :class="{ 'over-limit': answerCharCount > MAX_ANSWER_LENGTH }">
                {{ answerCharCount }} / {{ MAX_ANSWER_LENGTH }}
              </span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="关联推荐问题">
          <template #label>
            <div style="display: inline-flex; align-items: center; gap: 4px;">
              <span>关联推荐问题</span>
              <el-tooltip content="AI 回复此答案后，将在底部展示这些关联问题，引导用户点击，最多推荐 3 个。" placement="top">
                <el-icon style="color: #909399; cursor: pointer;">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-select
            v-model="editForm.related_questions"
            multiple
            filterable
            :multiple-limit="3"
            placeholder="请搜索并选择关联问题"
            style="width: 100%"
          >
            <el-option
              v-for="opt in relatedQuestionsOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生效时间配置">
          <el-radio-group v-model="editForm.timeType">
            <el-radio value="permanent">永久有效</el-radio>
            <el-radio value="custom">自定义时段</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="editForm.timeType === 'custom'" label="时间范围">
          <el-date-picker
            v-model="editForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary">确认保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="replyDialogVisible"
      :title="isReplyEditing ? '编辑快捷回复' : '新增快捷回复'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="replyForm" label-position="right" label-width="120px">
        <el-form-item label="触发词" required>
          <template #label>
            <div style="display: inline-flex; align-items: center; gap: 4px;">
              <span>触发词</span>
              <el-tooltip content="客服在会话输入框键入 / 加上此触发词，即可快速检索并发送该话术。" placement="top">
                <el-icon style="color: #909399; cursor: pointer;">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input v-model="replyForm.shortcut" placeholder="如: tk 或 你好 (配合聊天框 / 使用)" />
        </el-form-item>

        <el-form-item label="回复内容" required>
          <el-input
            v-model="replyForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入回复内容"
          />
        </el-form-item>

        <el-form-item label="生效时间配置">
          <el-radio-group v-model="replyForm.timeType">
            <el-radio value="permanent">永久有效</el-radio>
            <el-radio value="custom">自定义时段</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="replyForm.timeType === 'custom'" label="时间范围">
          <el-date-picker
            v-model="replyForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="replyForm.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReplySubmit">确认保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="capsuleDialogVisible"
      :title="isCapsuleEditing ? '编辑胶囊' : '新增胶囊'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="capsuleForm" label-position="right" label-width="120px">
        <el-form-item label="胶囊名称" required>
          <el-input v-model="capsuleForm.name" placeholder="请输入胶囊按钮名称，如：价格咨询" />
        </el-form-item>

        <el-form-item label="触发事件" required>
          <el-select v-model="capsuleForm.event" placeholder="请选择触发事件" style="width: 100%">
            <el-option
              v-for="opt in capsuleEventOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="适用渠道">
          <el-select
            v-model="capsuleForm.channels"
            multiple
            filterable
            placeholder="请选择适用渠道"
            style="width: 100%"
            @change="(val) => handleChannelChange(val, capsuleForm)"
          >
            <el-option
              v-for="opt in channelOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="生效时间配置">
          <el-radio-group v-model="capsuleForm.timeType">
            <el-radio value="permanent">永久有效</el-radio>
            <el-radio value="custom">自定义时段</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="capsuleForm.timeType === 'custom'" label="时间范围">
          <el-date-picker
            v-model="capsuleForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="capsuleForm.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="capsuleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCapsuleSubmit">确认保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.knowledge-page {
  height: 100%;
}

.knowledge-card {
  border-radius: 8px;
  border: 1px solid #e4e4e7;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.knowledge-tabs {
  border: none;
  margin-top: 4px;
}

.knowledge-tabs :deep(.el-tabs__header) {
  background: #f4f5f7;
  border-radius: 6px;
  padding: 4px;
  margin: 0;
}

.knowledge-tabs :deep(.el-tabs__item) {
  border: none;
  height: 34px;
  line-height: 34px;
  font-size: 14px;
  background: transparent;
  color: #606266;
  font-weight: 400;
}

.knowledge-tabs :deep(.el-tabs__item.is-active) {
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.1);
  font-weight: 600;
  color: var(--el-color-primary);
}

.knowledge-tabs :deep(.el-tabs__content) {
  padding: 0;
}

.action-bar {
  margin-top: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.sort-tip {
  margin-bottom: 14px;
  border-radius: 6px;
}

.data-table {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.drag-icon {
  cursor: move;
  color: #909399;
  font-size: 16px;
  transition: color 0.2s;
}

.drag-icon:hover {
  color: #409eff;
}

.drag-handle {
  cursor: move;
}

.editor-wrapper {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  resize: vertical;
  min-height: 250px;
  display: flex;
  flex-direction: column;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  padding: 4px 12px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.char-count {
  font-size: 12px;
  color: #909399;
}

.char-count.over-limit {
  color: #f56c6c;
  font-weight: 600;
}

.quill-editor {
  flex: 1;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.quill-editor :deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  padding: 8px;
  flex-shrink: 0;
}

.quill-editor :deep(.ql-container) {
  border: none;
  font-size: 14px;
  flex: 1;
  overflow-y: auto;
}

.quill-editor :deep(.ql-editor) {
  min-height: 250px;
  color: #333;
}

.quill-editor :deep(.ql-editor.ql-blank::before) {
  color: #c0c4cc;
  font-style: normal;
}


</style>