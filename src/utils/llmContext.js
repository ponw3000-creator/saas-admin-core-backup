export const DEFAULT_ROUND = 4

/**
 * @typedef {Object} ChatResponse
 * @property {string} reply_text          - AI 对话回复文本
 * @property {string} [summary_text]      - 会话摘要文本（可空）
 * @property {string[]} [intent_tags]    - 意向标签数组（可空）
 * @property {number} [sentiment_score]   - 情绪评分 0-1（可空）
 * @property {string} [suggested_action] - AI 建议动作（可空）
 */

/**
 * 构建对话上下文 prompt（截断至 round * 2 条消息）
 * @param {Array<{role: string, text?: string, content?: string}>} chatHistory
 * @param {number} [round]
 * @returns {Array<{role: string, content: string}>}
 */
export const buildChatPrompt = (chatHistory, round = DEFAULT_ROUND) => {
  if (!chatHistory || chatHistory.length === 0) {
    return []
  }
  const filtered = chatHistory.filter(
    (msg) => msg.role === 'user' || msg.role === 'assistant'
  )
  const keepCount = round * 2
  const truncated = filtered.slice(-keepCount)
  const payload = truncated.map((msg) => ({
    role: msg.role,
    content: msg.text || msg.content || ''
  }))
  return payload
}

/**
 * 统一聊天接口 — 调用后端 /api/v1/chat，SSOT 数据来源
 * 返回经过格式化的全量响应对象（reply_text / summary_text / intent_tags / sentiment_score）
 *
 * @param {string} message           - 用户发送的原始消息
 * @param {Object} sessionContext   - 会话上下文（需包含 id / source）
 * @param {number} [sessionContext.id]       - 会话 ID
 * @param {string} [sessionContext.source]    - 渠道来源
 * @returns {Promise<ChatResponse>}
 */
export const chatWithRealAI = async (message, sessionContext = {}) => {
  const apiUrl = '/api/v1/chat'

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tenant_id: 'tenant_001',
        channel_id: sessionContext.source || 'web',
        session_id: `sess_${sessionContext.id || Date.now()}`,
        user_message: message
      })
    })

    if (!response.ok) {
      throw new Error(`SaaS Agent 后端请求失败，状态码: ${response.status}`)
    }

    /** @type {ChatResponse} */
    const data = await response.json()

    return {
      reply_text: data.reply_text || '抱歉，服务未返回有效回复。',
      summary_text: data.summary_text || null,
      intent_tags: Array.isArray(data.intent_tags) ? data.intent_tags : [],
      sentiment_score: typeof data.sentiment_score === 'number' ? data.sentiment_score : null,
      suggested_action: data.suggested_action || null
    }
  } catch (error) {
    console.error('自研 Agent 接口报错:', error)
    return {
      reply_text: `【系统提示】网络连接异常，未能获取回复。错误详情：${error.message}`,
      summary_text: null,
      intent_tags: [],
      sentiment_score: null,
      suggested_action: null
    }
  }
}

/**
 * @deprecated 由 chatWithRealAI 统一返回，已废弃（仅作安全兜底保留）
 * 严禁在视图层直接调用此函数。
 *
 * @param {Array<{role: string, text?: string}>} _chatHistory
 * @returns {Promise<{tags: string[], emotion: string, content: string, suggestedAction: string}>}
 */
export const generateRealSummary = async (_chatHistory) => {
  console.warn('[DEPRECATED] generateRealSummary 已废弃，请勿调用。所有摘要数据由 chatWithRealAI 统一返回。')
  return {
    tags: [],
    emotion: '未知',
    content: '摘要生成功能已迁移至统一接口，刷新页面后自动更新。',
    suggestedAction: '请发送消息，右侧面板将自动同步最新摘要。'
  }
}
