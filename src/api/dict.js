export function fetchMetricsDict() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        total_inbound: {
          title: '今日总进线量',
          desc: '统计周期内从各渠道（网页/小程序/App）进入客服系统的来访总人数，反映业务流量规模。'
        },
        token_cost: {
          title: '今日 Token 消耗',
          desc: '每次 AI 对话消耗的 Token 数量（含 Input 与 Output），按量计费，Input 通常占总消耗 60-70%。'
        },
        ai_fee_est: {
          title: '预估 AI 费用',
          desc: '基于 Token 消耗量与模型单价估算的当日 AI 服务成本，用于成本核算与预算控制。'
        },
        avg_session_cost: {
          title: '单均会话成本',
          desc: '总 AI 费用 ÷ 总会话数，代表每场对话的平均成本，目标值通常 ≤ ¥0.05/次。'
        },
        ai_resolution: {
          title: 'AI 独立解决率',
          desc: '无需人工介入、由 AI 独立完成回答的会话占比，是衡量 AI 智能程度与运营效率的核心指标。'
        },
        aht_time: {
          title: '平均处理时长（AHT）',
          desc: 'Average Handling Time，从用户发起到问题解决的平均总时长（含 AI 回复与人工处理），单位为秒。'
        },
        csat_score: {
          title: '满意度评分（CSAT）',
          desc: 'Customer Satisfaction，用户在会话结束后对服务质量的评分（好评/中评/差评），通常要求 ≥ 85% 好评率。'
        },
        intent_tags: {
          title: '意向标签',
          desc: '基于用户行为和对话内容打上的兴趣/意图标识，如"高意向"、"价格敏感"，用于精准运营与分层服务。'
        },
        session_duration: {
          title: '会话时长',
          desc: '从用户发起咨询到会话结束的总时长，过长可能意味着问题未能在首次响应中解决，需关注优化。'
        },
        avg_first_response: {
          title: '平均首次响应耗时',
          desc: '从用户发出第一条消息，到系统（AI 或人工）给出首次回复的时间差，越短说明响应越及时。'
        },
        avg_ai_response: {
          title: '平均 AI 回复耗时',
          desc: '大语言模型生成并返回完整文本的平均耗时，用于监控大模型 API 延迟，目标通常 ≤ 3 秒。'
        },
        kb_hit_rate: {
          title: '知识库命中率',
          desc: 'AI 回复内容中，成功匹配并引用现有知识库或快捷问答的会话占比，命中率越高说明知识库覆盖越全。'
        },
        chat_completion_rate: {
          title: '对话完成率',
          desc: '用户得到明确答复且正常结束对话（未中途断线或愤怒离开）的会话比例，是服务质量的重要衡量指标。'
        },
        dict_key_hint: {
          title: '字典 Key 使用说明',
          desc: '字典 Key 全局唯一，修改前请务必咨询开发确认代码中是否存在引用，避免因 Key 变更导致页面提示失效。'
        },
        system_prompt_hint: {
          title: 'System Prompt 说明',
          desc: 'System Prompt 决定了 AI 的行为边界与回复风格，直接影响 Token 消耗量和回复质量，修改前建议在测试环境验证效果。'
        },
        capsule_button_hint: {
          title: '胶囊按钮说明',
          desc: '胶囊按钮在不同渠道（小程序/App/PC）展示样式不同，PC 端最多显示 4 个字符，小程序端建议不超过 6 个字符。'
        },
        quick_reply_hint: {
          title: '快捷回复说明',
          desc: '快捷回复通过快捷键（如 Ctrl+1）触发，供客服一键发送。建议单条不超过 200 字，超长内容请拆分为多条。'
        }
      })
    }, 100)
  })
}