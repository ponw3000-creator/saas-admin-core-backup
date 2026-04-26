export const DEFAULT_ROUND = 4

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

    const data = await response.json()
    return data.reply_text || '抱歉，服务未返回有效回复。'
  } catch (error) {
    console.error('自研 Agent 接口报错:', error)
    return `【系统提示】网络连接异常，未能获取回复。错误详情：${error.message}`
  }
}

export const generateRealSummary = async (chatHistory) => {
  const apiKey = import.meta.env.VITE_DIFY_SUMMARY_API_KEY
  const apiUrl = import.meta.env.VITE_DIFY_SUMMARY_API_URL

  const historyText = chatHistory
    .map((msg) => `${msg.role === 'user' ? '客户' : '客服'}: ${msg.text || msg.content}`)
    .join('\n')

  const queryText = `请作为客服质量分析专家，阅读以下记录，并严格按照 JSON 格式输出结果（包含 tags, emotion, content, suggestedAction 四个字段，不要有 Markdown 标记）：\n\n${historyText}`

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: { text: historyText },
        response_mode: 'blocking',
        user: 'admin-summary'
      })
    })

    if (!response.ok) {
      throw new Error(`Dify 摘要接口请求失败: ${response.status}`)
    }

    const data = await response.json()
    const resultString = data.answer || data.text || JSON.stringify(data)

    console.log('【Dify 摘要原始返回字符串】:', resultString)

    const cleanJsonString = resultString.replace(/```json\n?|\n?```/g, '').trim()

    try {
      return JSON.parse(cleanJsonString)
    } catch (parseError) {
      console.error('JSON 解析彻底失败！清洗后的字符串为:', cleanJsonString)
      console.error('解析错误详情:', parseError)
      return {
        tags: ['生成截断/解析失败'],
        emotion: '未知',
        content: `大模型返回的数据格式不完整或非 JSON 格式。原始返回片断：${resultString.substring(0, 50)}...`,
        suggestedAction:
          '请按 F12 查看 Console 中的原始返回字符串，并检查 Dify 后台的 Max Tokens 设置是否过小。'
      }
    }
  } catch (error) {
    console.error('Dify 摘要接口报错:', error)
    return {
      tags: ['接口对接异常'],
      emotion: '未知',
      content: `无法连接到 Dify 后端，错误信息：${error.message}`,
      suggestedAction:
        '请检查 Summary API Key 是否正确，以及跨域(CORS)设置是否放行。'
    }
  }
}
