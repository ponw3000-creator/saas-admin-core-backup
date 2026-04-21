<script setup>
import { ref, inject, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { ChatDotRound, User, CircleCheck, Promotion, ArrowUp, Lightning } from '@element-plus/icons-vue'
import { buildChatPrompt, generateRealSummary, chatWithRealAI } from '@/utils/llmContext'
import InfoLabel from '@/components/InfoLabel.vue'
import { useAppStore } from '@/store/app'
import { useChatStore } from '@/store/chatStore'
import { useReplyStore } from '@/store/replyStore'
import { chatSessionsMockData, chatSortingConfig } from '@/mock/index.js'
import { useChannelStore } from '@/store/channelStore'

const trackEvent = inject('trackEvent', () => {})
const appStore = useAppStore()
const chatStore = useChatStore()
const replyStore = useReplyStore()
const channelStore = useChannelStore()

const themeColor = computed(() => appStore.themeColor)
const animDuration = computed(() => `${appStore.aiAnimSpeed}s`)
const quickReplies = computed(() => replyStore.quickReplies)

const sessions = ref([...chatSessionsMockData])
const activeSessionId = ref(1)
const messageInput = ref('')
const isAiThinking = ref(false)
const isSummarizing = ref(false)
const summaryData = ref(null)
const chatScrollRef = ref(null)

const sessionCache = ref(new Map())
const MAX_CACHE_SIZE = 10

const CAPACITY = 5
const REFILL_RATE = 0.5
let tokens = CAPACITY
let lastRefill = Date.now()

const checkSentinel = () => {
  const now = Date.now()
  const elapsed = (now - lastRefill) / 1000
  tokens = Math.min(CAPACITY, tokens + elapsed * REFILL_RATE)
  lastRefill = now
  if (tokens >= 1) {
    tokens -= 1
    return true
  }
  return false
}

const isLocked = ref(false)

// [API-Ready] 动态排序权重配置 - 模拟从系统配置接口异步获取
// TODO: [API对接] 未来将下面这行替换为: const res = await api.getSystemConfig('chat_sorting'); activeWeights.value = res.data
const activeWeights = ref({ ...chatSortingConfig })

const onlyUnread = ref(false)

let msgIdCounter = 100

const activeSession = computed(() => {
  if (sessionCache.value.has(activeSessionId.value)) {
    return sessionCache.value.get(activeSessionId.value)
  }
  return sessions.value.find(s => s.id === activeSessionId.value) || sessions.value[0]
})

/**
 * === 动态会话优先级调度引擎 (Priority Scheduling Engine) ===
 * [数据链路] 排序权重参数 (timeWeight, levelWeight, urgencyWeight) 从 systemConfig 动态读取，实现业务配置完全解耦。
 * - [因子解析]
 * 1. 时间分 (Time Score): 基础底线。基于 (当前时间 - 进线时间)，确保所有客户最终都能被接待。
 * 2. 等级分 (Level Score): 商业价值。赋予 VIP 或高优先等级客户更高的插队权重。
 * 3. 紧急分 (Urgency Score): 情绪兜底。基于内容紧急度评分进行微调。
 * - [排序逻辑] 综合以上因子计算总分，并按降序排列，确保高优会话强制置顶。
 */
const processedSessions = computed(() => {
  // 1. 过滤逻辑：根据"仅看未读"开关筛选数据
  const filtered = onlyUnread.value
    ? sessions.value.filter(s => s.unreadCount > 0)
    : sessions.value

  // 2. 打分逻辑：遍历会话，计算加权总分
  const scored = filtered.map(session => {
    const maxWaitSeconds = 30 * 60
    const waitSeconds = (Date.now() - session.createdAt) / 1000
    const timeScore = Math.max(0, 1 - waitSeconds / maxWaitSeconds)

    const levelScore = (session.priorityLevel - 1) / 4

    const urgencyScore = session.urgencyScore || 0

    const totalScore =
      activeWeights.value.timeWeight * timeScore +
      activeWeights.value.levelWeight * levelScore +
      activeWeights.value.urgencyWeight * urgencyScore

    return { ...session, _score: totalScore }
  })

  // 3. 排序逻辑：按总分降序排列
  return scored.sort((a, b) => b._score - a._score)
})

const selectSession = async (id) => {
  activeSessionId.value = id

  if (sessionCache.value.has(id)) {
    console.log('Cache Hit: 命中缓存')
    const data = sessionCache.value.get(id)
    sessionCache.value.delete(id)
    sessionCache.value.set(id, data)
  } else {
    console.log('Cache Miss: 模拟从后端/Redis加载')
    const sessionData = sessions.value.find(s => s.id === id)

    if (sessionCache.value.size >= MAX_CACHE_SIZE) {
      const oldestKey = sessionCache.value.keys().next().value
      sessionCache.value.delete(oldestKey)
    }
    sessionCache.value.set(id, sessionData)
  }

  messageInput.value = ''
  summaryData.value = null
  isAiThinking.value = false
  trackEvent('select_session', { sessionId: id })
  setTimeout(scrollToBottom, 100)
}

const quickQuestions = ref([
  '企业版价格是多少？',
  '如何申请试用？',
  '有哪些功能模块？',
  '数据安全保障有哪些？'
])

const showQuickReplyPopup = ref(false)
const quickReplyListRef = ref(null)
const selectedQuickReplyIndex = ref(0)

const handleInput = (e) => {
  const value = e.target.value

  if (value.endsWith('/')) {
    showQuickReplyPopup.value = true
    selectedQuickReplyIndex.value = 0
  } else if (!value.includes('/')) {
    showQuickReplyPopup.value = false
  }
}

const handleKeyup = (e) => {
  if (e.key === '/' && messageInput.value.endsWith('/')) {
    showQuickReplyPopup.value = true
    selectedQuickReplyIndex.value = 0
  }
}

const handleQuickReplySelect = (reply) => {
  const inputEl = document.querySelector('.chat-input-area .el-input__inner')
  if (!inputEl) return
  const value = inputEl.value
  const cursorPos = inputEl.selectionStart
  const newValue = value.substring(0, cursorPos - 1) + reply.content
  messageInput.value = newValue
  showQuickReplyPopup.value = false
  nextTick(() => {
    inputEl.focus()
    const len = newValue.length
    inputEl.setSelectionRange(len, len)
  })
}

const handleQuickReplyKeydown = (e, reply) => {
  if (e.key === 'Enter' && showQuickReplyPopup.value) {
    e.preventDefault()
    handleQuickReplySelect(reply)
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (selectedQuickReplyIndex.value < quickReplies.value.length - 1) {
      selectedQuickReplyIndex.value++
    }
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (selectedQuickReplyIndex.value > 0) {
      selectedQuickReplyIndex.value--
    }
  }
}

const scrollToBottom = () => {
  setTimeout(() => {
    if (!chatScrollRef.value) return
    if (chatScrollRef.value.setScrollTop) {
      const wrap = chatScrollRef.value.wrapRef
      if (wrap) chatScrollRef.value.setScrollTop(wrap.scrollHeight)
    } else {
      chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
    }
  }, 50)
}

const renderMessage = (content) => {
  if (!content) return ''
  return marked.parse(content)
}

const sendMessage = async () => {
  if (isLocked.value || !checkSentinel()) {
    ElMessage.warning('系统正忙，请稍等片刻再发送')
    return
  }
  if (isAiThinking.value) {
    ElMessage.warning('请等待 AI 回复完成后再发送新消息')
    return
  }
  if (!messageInput.value.trim()) return
  const userText = messageInput.value.trim()
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  activeSession.value.fullHistory.push({ id: ++msgIdCounter, role: 'user', text: userText, time: timeStr })
  scrollToBottom()

  const payload = buildChatPrompt(activeSession.value.fullHistory)
  console.log('【发送给大模型的真实报文】:', payload)

  messageInput.value = ''
  trackEvent('send_message', { content: userText })

  isAiThinking.value = true
  try {
    if (chatStore.activeModelId === 1) {
      console.log('[路由模拟] 请求外部 API...')
      await new Promise(resolve => setTimeout(resolve, 500))
    } else {
      console.log('[路由模拟] 请求本地私有模型...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
    const realAnswer = await chatWithRealAI(userText, activeSession.value.fullHistory)
    const aiTime = new Date()
    const aiTimeStr = `${aiTime.getHours().toString().padStart(2, '0')}:${aiTime.getMinutes().toString().padStart(2, '0')}`
    activeSession.value.fullHistory.push({
      id: ++msgIdCounter,
      role: 'assistant',
      text: realAnswer,
      time: aiTimeStr
    })
  } finally {
    isAiThinking.value = false
    scrollToBottom()
  }
}

const handleQuickQuestion = (q) => {
  messageInput.value = q
  sendMessage()
}

const handleTransfer = () => {
  trackEvent('click_transfer_human', { sessionId: activeSessionId.value })
}

const handleGenerateSummary = async () => {
  if (isSummarizing.value) return
  isSummarizing.value = true
  summaryData.value = null
  try {
    const result = await generateRealSummary(activeSession.value.fullHistory)
    summaryData.value = result
  } finally {
    isSummarizing.value = false
  }
}
</script>

<template>
  <div class="chat-workspace">
    <Splitpanes class="default-theme" @resize="e => {}">
      <Pane :size="18" :min-size="12" :max-size="30">
        <div class="session-list">
      <div class="session-header">
        <div class="session-header-left">
          <span class="session-title">会话列表</span>
          <el-badge :value="3" type="primary" />
        </div>
        <div class="session-header-right">
          <span class="unread-label">仅看未读</span>
          <el-switch v-model="onlyUnread" size="small" />
        </div>
      </div>
      <div
        v-for="s in processedSessions"
        :key="s.id"
        class="session-item"
        :class="{ active: activeSessionId === s.id }"
        @click="selectSession(s.id)"
      >
        <div class="session-avatar">
          <el-icon :size="24"><User /></el-icon>
        </div>
        <div class="session-info">
          <div class="session-name-row">
            <span class="session-name">{{ s.name }}</span>
            <span class="session-status" :class="s.status === '在线' ? 'online' : 'offline'">{{ s.status }}</span>
          </div>
          <div class="session-msg">{{ s.lastMsg }}</div>
          <div class="session-time">{{ s.time }}</div>
        </div>
      </div>
        </div>
      </Pane>
      <Pane :size="52" :min-size="35">
        <div class="chat-panel">
      <div class="chat-header">
        <div class="chat-info">
          <el-icon :size="20"><User /></el-icon>
          <span class="chat-username">{{ activeSession.name }}</span>
          <el-tag size="small" type="success">在线</el-tag>
        </div>
        <div class="chat-actions">
          <el-button type="danger" @click="handleTransfer">
            <el-icon><Promotion /></el-icon>
            转人工
          </el-button>
        </div>
      </div>

      <div ref="chatScrollRef" class="chat-messages">
        <div
          v-for="msg in activeSession.fullHistory"
          :key="msg.id"
          class="message-row"
          :class="msg.role"
        >
          <div class="message-bubble">
            <span class="message-text" v-html="renderMessage(msg.text)"></span>
            <span class="message-time">{{ msg.time }}</span>
          </div>
        </div>
        <div v-if="isAiThinking" class="message-row ai">
          <div class="message-bubble thinking">
            <div class="typing-indicator">
              <span class="thinking-icon">✦</span>
            </div>
            <span class="thinking-text">AI正在查询中...</span>
          </div>
        </div>
      </div>

      <div class="quick-questions">
        <div class="quick-title">
          <el-icon><Lightning /></el-icon>
          <span>猜你想问</span>
        </div>
        <div class="quick-tags">
          <el-tag
            v-for="q in quickQuestions"
            :key="q"
            class="quick-tag"
            @click="handleQuickQuestion(q)"
          >
            {{ q }}
          </el-tag>
        </div>
      </div>

      <div class="chat-input-area">
        <div class="quick-reply-popup" v-if="showQuickReplyPopup">
          <div class="popup-header">快捷回复</div>
          <div
            ref="quickReplyListRef"
            class="popup-list"
            @keydown="handleQuickReplyKeydown"
          >
            <div
              v-for="(reply, index) in quickReplies"
              :key="reply.shortcut"
              class="popup-item"
              :class="{ selected: index === selectedQuickReplyIndex }"
              @click="handleQuickReplySelect(reply)"
              @mouseenter="selectedQuickReplyIndex = index"
            >
              <span class="item-shortcut">{{ reply.shortcut }}</span>
              <span class="item-content">{{ reply.content }}</span>
            </div>
          </div>
        </div>
        <el-input
          v-model="messageInput"
          placeholder="输入消息..."
          @input="handleInput"
          @keyup="handleKeyup"
          @keydown="handleQuickReplyKeydown"
          @keyup.enter="sendMessage"
        />
        <el-button type="primary" :disabled="isLocked" @click="sendMessage">
          <el-icon><ArrowUp /></el-icon>
          发送
        </el-button>
      </div>
        </div>
      </Pane>
      <Pane :size="30" :min-size="20">
        <div class="user-profile">
      <el-card shadow="hover" class="summary-card">
        <template #header>
          <div class="summary-header">
            <span class="summary-title">AI 智能摘要</span>
            <el-button
              type="primary"
              size="small"
              :loading="isSummarizing"
              @click="handleGenerateSummary"
            >
              一键生成
            </el-button>
          </div>
        </template>

        <div v-if="isSummarizing" class="summary-loading">
          <el-skeleton :rows="4" animated />
        </div>

        <div v-else-if="summaryData" class="summary-result">
          <div class="summary-row">
            <span class="summary-label">客户情绪</span>
            <el-tag type="info" size="small">{{ summaryData.emotion }}</el-tag>
          </div>
          <div class="summary-row">
            <span class="summary-label">意图标签</span>
            <div class="summary-tags">
              <el-tag
                v-for="tag in summaryData.tags"
                :key="tag"
                size="small"
                type="warning"
                style="margin-right: 4px; margin-bottom: 4px;"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
          <div class="summary-row">
            <span class="summary-label">核心诉求</span>
            <p class="summary-content">{{ summaryData.content }}</p>
          </div>
          <div class="summary-action-box">
            <span class="summary-label">AI 建议动作</span>
            <p class="summary-action-text">{{ summaryData.suggestedAction }}</p>
          </div>
        </div>

        <div v-else class="summary-empty">
          <el-icon :size="32" class="summary-empty-icon"><ChatDotRound /></el-icon>
          <p>点击上方「一键生成」</p>
          <p>AI 将阅读全量会话记录</p>
          <p>自动生成结构化摘要</p>
        </div>
      </el-card>

      <el-divider />

      <div class="profile-section">
        <div class="profile-label">基本信息</div>
        <div class="profile-row">
          <span class="label">来源渠道</span>
          <span class="value">{{ activeSession.sourceDetail || channelStore.getChannelName(activeSession.channel_id) }}</span>
        </div>
        <div class="profile-row">
          <span class="label">当前页面</span>
          <a class="value page-link" :href="activeSession.currentPageDetail ? 'javascript:void(0)' : '#'">{{ activeSession.currentPageDetail || '暂无页面信息' }}</a>
        </div>
        <div class="profile-row session-duration-row">
          <span class="label">会话时长</span>
          <div class="duration-with-tooltip">
            <InfoLabel dict-key="session_duration" />
            <span class="value">5分20秒</span>
          </div>
        </div>
      </div>
      <el-divider />
      <div class="profile-section">
        <div class="profile-label">
          意向标签
          <InfoLabel dict-key="intent_tags" />
        </div>
        <div class="profile-tags">
          <el-tag size="small" type="warning">高意向</el-tag>
          <el-tag size="small" type="info">价格敏感</el-tag>
        </div>
      </div>
      <el-divider />
      <div class="profile-section">
        <div class="profile-label">历史记录</div>
        <div class="profile-history">
          <div class="history-item">
            <el-icon><CircleCheck /></el-icon>
            <span>2024-01-15 咨询报价，已成单</span>
          </div>
          <div class="history-item">
            <el-icon><CircleCheck /></el-icon>
            <span>2024-01-20 退款咨询，已解决</span>
          </div>
        </div>
      </div>
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>

<style scoped>
.chat-workspace {
  display: flex;
  height: calc(100vh - 56px);
  background-color: #f0f2f5;
  overflow: hidden;
}

.session-list {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.session-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
}

.session-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.session-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.session-header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.unread-label {
  font-size: 12px;
  color: #909399;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #fafafa;
  transition: background-color 0.2s;
}

.session-item:hover {
  background-color: #f5f7fa;
}

.session-item.active {
  background-color: #ecf5ff;
}

.session-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e6e8eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.session-info {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.session-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.session-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.session-status {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 10px;
}

.session-status.online {
  background-color: #e8f8e8;
  color: #52c41a;
}

.session-status.offline {
  background-color: #f5f5f5;
  color: #999;
}

.session-msg {
  font-size: 12px;
  color: #999;
  white-space: normal;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  margin-top: 4px;
}

.session-time {
  font-size: 11px;
  color: #bbb;
  margin-top: 2px;
}

.chat-panel {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.chat-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-username {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-row {
  display: flex;
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.ai .message-bubble {
  background-color: #f0f2f5;
  color: #333;
}

.message-row.ai .message-bubble.thinking {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
}

.message-row.ai .message-bubble.thinking {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  min-height: 44px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.thinking-icon {
  font-size: 20px;
  color: v-bind(themeColor);
  display: inline-block;
  animation: tech-star-breathe v-bind(animDuration) ease-in-out infinite alternate;
  text-shadow: 0 0 8px v-bind(themeColor);
}

.thinking-text {
  font-size: 13px;
  color: #909399;
  letter-spacing: 0.5px;
}

@keyframes tech-star-breathe {
  0% {
    opacity: 0.5;
    transform: scale(0.9);
    text-shadow: 0 0 4px color-mix(in srgb, v-bind(themeColor) 30%, transparent);
  }
  100% {
    opacity: 1;
    transform: scale(1.15);
    text-shadow: 0 0 12px color-mix(in srgb, v-bind(themeColor) 90%, transparent);
  }
}

.message-row.user .message-bubble {
  background-color: v-bind(themeColor);
  color: #fff;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-text {
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.message-text :deep(p) {
  margin: 0 0 4px;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

.message-text :deep(strong) {
  color: #1a1a1a;
  font-weight: 700;
}

.splitpanes.default-theme .splitpanes__pane {
  background-color: transparent;
}

.splitpanes.default-theme .splitpanes__splitter {
  background-color: #f0f2f5 !important;
  border: none;
  min-width: 12px !important;
  cursor: col-resize;
  transition: background-color 0.2s;
}

.splitpanes.default-theme .splitpanes__splitter:hover {
  background-color: #dcdfe6 !important;
}

.message-time {
  font-size: 11px;
  opacity: 0.6;
  align-self: flex-end;
}

.quick-questions {
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.quick-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-tag {
  cursor: pointer;
}

.chat-input-area {
  padding: 12px 20px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
  position: relative;
}

.quick-reply-popup {
  position: absolute;
  bottom: 60px;
  left: 20px;
  width: 320px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.08);
  z-index: 9999;
  overflow: hidden;
}

.popup-header {
  padding: 10px 14px;
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 500;
}

.popup-list {
  max-height: 200px;
  overflow-y: auto;
}

.popup-item {
  padding: 10px 14px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  transition: background-color 0.15s;
}

.popup-item:hover,
.popup-item.selected {
  background-color: #ecf5ff;
}

.popup-item .item-shortcut {
  font-size: 13px;
  font-weight: 500;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  min-width: 48px;
  text-align: center;
}

.popup-item .item-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  word-break: break-all;
}

.user-profile {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
  box-sizing: border-box;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
}

.profile-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.profile-section {
  margin-bottom: 8px;
}

.profile-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  font-weight: 500;
}

.profile-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 6px;
}

.profile-row .label {
  color: #666;
}

.profile-row .value {
  color: #333;
  font-weight: 500;
}

.profile-row .value.page-link {
  color: #409eff;
  text-decoration: underline;
  cursor: pointer;
  font-size: 13px;
}

.profile-row.session-duration-row {
  align-items: center;
}

.profile-row.session-duration-row .label {
  line-height: normal;
}

.duration-with-tooltip {
  display: flex;
  align-items: center;
  gap: 4px;
}

.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.profile-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.summary-card {
  margin-bottom: 0;
}

.summary-card :deep(.el-card__header) {
  padding: 12px 16px;
  background: #f5f7fa;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.summary-loading {
  padding: 8px 0;
}

.summary-result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.summary-label {
  font-size: 12px;
  color: #909399;
  min-width: 56px;
  line-height: 22px;
}

.summary-tags {
  display: flex;
  flex-wrap: wrap;
}

.summary-content {
  font-size: 13px;
  color: #333;
  margin: 0;
  line-height: 1.6;
}

.summary-action-box {
  background: #ecf5ff;
  border-radius: 6px;
  padding: 8px 10px;
}

.summary-action-text {
  font-size: 13px;
  color: #409eff;
  margin: 4px 0 0;
  font-weight: 500;
  line-height: 1.6;
}

.summary-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  color: #909399;
  font-size: 13px;
  text-align: center;
  gap: 4px;
}

.summary-empty-icon {
  color: #dcdfe6;
  margin-bottom: 8px;
}
</style>