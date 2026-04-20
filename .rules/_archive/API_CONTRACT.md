# SaaS AI API 接口契约 (V1.0)

> **声明**：本文件定义了本项目前后端通信的唯一合法结构。后端实现必须以此为准，前端调用必须以此为基。

## 1. 统一响应体 (Standard Response)
所有 API 接口返回必须使用以下 JSON 结构，严禁直接返回业务对象。

| 字段名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `code` | String | 是 | 业务状态码：SUCCESS, BIZ_ERROR, PARAM_INVALID, AUTH_DENIED, SYS_ERROR |
| `message` | String | 是 | 针对 code 的可读性说明，用于 UI 提示或 AI 报错分析 |
| `data` | Object | 是 | 业务数据对象，脱敏后的结果，无数据则返回 {} |
| `trace_id` | String | 是 | 请求唯一标识，用于全链路追踪排查 |
| `fallback` | String | 否 | 建议话术，后端预设给 AI 参考的兜底文案 |

## 2. 错误处理矩阵与 AI 行为指引
AI 必须根据 `code` 执行对应的交互动作，严禁产生幻觉：

| Code | 含义 | AI 动作 |
| :--- | :--- | :--- |
| **SUCCESS** | 成功 | 解析 data 字段，继续执行或向用户确认结果 |
| **BIZ_ERROR** | 业务逻辑拦截 | 停止尝试，将 `message` 原样告知用户（如：余额不足） |
| **PARAM_INVALID** | 参数校验失败 | 停止尝试，检查传参格式或向用户追问缺失信息 |
| **AUTH_DENIED** | 权限不足 | 停止尝试，告知用户无权访问，引导联系管理员 |
| **SYS_ERROR** | 系统级异常 | 停止尝试，告知用户“服务繁忙”，引导稍后重试 |

## 3. 防护与脱敏规范
1. **输入防御**：后端必须严格校验 DTO 类型，拦截 LLM 幻觉产生的所有未定义字段。
2. **敏感脱敏**：
   - 手机号：`138****5678`
   - 身份证：`4401**********1234`
   - 严禁在 data 中返回明文密码或 Secret。
3. **调用频率**：同一会话内，同一工具工具调用每分钟限制 10 次，防止死循环。

## 4. 业务字典 (Business Enums)
AI 必须遵守以下枚举，严禁自行发明：
- **渠道类型 (ChannelType)**: `WX_MINI`, `APP`, `WEB`, `H5`
- **会话状态 (TicketStatus)**: `WAITING` (排队), `ACTIVE` (接待中), `RESOLVED` (已解决), `CLOSED` (关闭)
- **客服状态 (AgentStatus)**: `ONLINE`, `BUSY`, `OFFLINE`