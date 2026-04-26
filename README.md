# SaaS Admin Workbench

> AI 驱动的 SaaS 客服 / 管理双模工作台 —— 前端架构设计与研发规范文档。

[![Vercel](https://img.shields.io/badge/Vercel-CI%2FCD-brightgreen?style=flat-square)](https://vercel.com)
[![Vue](https://img.shields.io/badge/Vue-3.5-green?style=flat-square&logo=vue.js)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8.0-blue?style=flat-square&logo=vite)](https://vitejs.dev)
[![ElementPlus](https://img.shields.io/badge/Element%20Plus-2.13-brightgreen?style=flat-square)](https://element-plus.org)

---

## 一、项目定位与愿景

`saas-admin-workbench` 是一款面向企业客服场景的 **SaaS 多租户管理后台**。其核心职责是为客服人员提供一个高效、可扩展的「**一站式接待工作台**」，涵盖客户会话管理、工单流转、AI 辅助回复、数据看板与系统配置等完整链路。

**业务价值**：

- **提升接待效率**：通过动态优先级调度引擎，确保高优客户优先被接待，避免低优客户长期霸占资源。
- **降低客服认知负担**：所有技术配置项均配备业务化解释气泡，面向非技术背景的运营人员友好。
- **前后端分离开发**：通过 Mock 数据与 API-Ready 注释规范，实现前端独立开发、后端随时无缝接入。

---

## 二、快速开始 / 演示入口

### 2.1 演示环境

本项目提供**一键演示模式**，无需任何后端配置即可体验完整功能。

#### 演示账号

| 模式 | 账号 | 密码 | 说明 |
|------|------|------|------|
| **超管体验** | `admin` | `admin123` | 具备最高权限，可访问全部 15 个功能模块 |
| 客服模式 | `agent001` | `123456` | 客服角色，可体验接待工作台 |

#### 如何进入演示

1. 启动开发服务器：`npm run dev`
2. 打开浏览器访问 `http://localhost:5173`
3. 点击登录页底部的 **「超管体验」** 按钮
4. 系统将自动填充账号密码并登录，跳转至工作台

#### 超管模式可访问的核心模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 实时大屏 | `/dashboard/realtime` | AI 效能实时数据可视化 |
| AI 效能分析 | `/dashboard/performance` | 转化率/满意度深度分析 |
| AI 模型配置 | `/setting/ai` | Dify / OpenAI 等模型接入 |
| LLM 基座配置 | `/setting/llm` | 大模型推理参数配置 |
| 团队与权限 | `/setting/team` | 组织架构与人员管理 |
| 角色管理 | `/setting/role` | RBAC 权限矩阵配置 |
| 操作日志 | `/setting/oplog` | 全量操作行为审计 |
| 渠道接入 | `/setting/channel` | 多渠道统一接入管理 |

---

## 三、技术栈选型

| 层级 | 技术选型 | 版本 |
|------|----------|------|
| 前端框架 | **Vue 3** (Composition API + `<script setup>`) | ^3.5.30 |
| 构建工具 | **Vite** | ^8.0.1 |
| UI 组件库 | **Element Plus** | ^2.13.6 |
| 状态管理 | **Pinia** | ^3.0.4 |
| 路由管理 | **Vue Router** | ^5.0.4 |
| 国际化 | **Vue I18n** | ^11.3.2 |
| 富文本渲染 | **Marked** + **VueQuill** | ^18.0.0 / ^1.2.0 |
| 图表 | **ECharts** | ^6.0.0 |
| 网络请求 | **原生 Fetch**（无 axios） | — |

**关键约束**：

- 项目**不使用 axios**，所有网络请求均通过原生 `fetch` 封装于 `src/utils/llmContext.js`。
- 所有 API 调用均遵循 `.rules/02-api-contract.md` 定义的统一响应体结构 `{ code, message, data, trace_id }`。
- 前端**未配置跨域代理**（`vite.config.js` 仅含基础 alias），生产环境需后端配置 CORS 或 Nginx 反向代理。

**动态路由与角色鉴权（RBAC）**：

系统内置四层角色体系（`super_admin > admin > leader > agent`），通过 `ROLE_WEIGHT_MAP` 与 `ROLE_PERMISSIONS_MAP` 实现**职责权重 + 菜单权限双重隔离**：

```javascript
// src/store/chatStore.js
const ROLE_WEIGHT_MAP = {
  super_admin: 100,   // 可管理所有角色
  admin: 80,          // 可管理 admin/leader/agent
  leader: 50,         // 可管理 leader/agent
  agent: 10           // 仅可操作自己
}

const ROLE_PERMISSIONS_MAP = {
  super_admin: ['*'],  // 通配符 = 全量权限 bypass
  admin: ['menu:ai', 'menu:llm', 'menu:team', ...],
  leader: ['menu:preferences', 'menu:knowledge', ...],
  agent: ['menu:preferences', 'menu:knowledge', ...]
}
```

路由守卫 `router.beforeEach` 在用户访问任意业务页面前校验 Token，Layout 侧边栏通过 `visibleMenus` computed 根据当前角色动态渲染菜单项。

**部署与 CI/CD**：

项目已接入 **Vercel CI/CD** 流水线：所有代码推送至 `origin main` 后，自动触发 Vercel Build 并部署至生产环境。

---

## 三、核心架构设计

### 3.1 API-Ready 防腐层

项目实现了**前端先行、接口后置**的防腐层策略，确保前端开发完全不依赖后端，并能随时平滑切换至真实接口。

**实现机制**：

1. **Mock 数据隔离**：所有业务数据定义在 `src/mock/` 目录下，以纯函数形式返回结构化对象。
2. **API-Ready 注释锚点**：每个 Mock 函数上方均标注 `TODO: [API对接]` 注释，标注对应的真实接口路径和 HTTP 方法。
3. **try-catch 异步包裹**：所有异步操作（无论是 Mock 调用还是真实 API）均被 `try...catch` 包裹，确保 Loading/Disabled 状态正确解锁。

**示例**（`src/mock/userMock.js`）：

```javascript
// [API-Ready] 获取用户个人中心数据
// TODO: [API对接] 未来将下面替换为: const res = await api.get('/user/profile'); return res.data
export const getUserProfile = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return { ...userProfileMockData }
}
```

**切换至真实接口仅需**：删除 `await new Promise(...)`，替换为真实 `fetch` 调用，所有调用方代码**零改动**。

---

### 3.2 业务解耦引擎 —— 动态会话优先级调度

**场景**：左侧会话列表需根据时间、优先级、紧急度三个维度动态排序，且排序权重由运营人员在后台配置。

**架构设计**：权重参数（`timeWeight`, `levelWeight`, `urgencyWeight`）以**纯数据对象**形式存储于 `src/mock/configMock.js`，与视图组件 `src/views/Chat/index.vue` 完全解耦。

**核心代码**（`src/mock/configMock.js`）：

```javascript
// [业务规范] 系统配置数据 - 集中管理全局权重参数
export const chatSortingConfig = {
  timeWeight: 0.6,
  levelWeight: 0.3,
  urgencyWeight: 0.1
}
```

**核心调度逻辑**（`src/views/Chat/index.vue`）：

```javascript
/**
 * === 动态会话优先级调度引擎 (Priority Scheduling Engine) ===
 * [数据链路] 排序权重参数 (timeWeight, levelWeight, urgencyWeight) 从 systemConfig 动态读取，实现业务配置完全解耦。
 * - [因子解析]
 * 1. 时间分 (Time Score): 基础底线。基于 (当前时间 - 进线时间)，确保所有客户最终都能被接待。
 * 2. 等级分 (Level Score): 商业价值。赋予 VIP 或高优先等级客户更高的插队权重。
 * 3. 紧急分 (Urgency Score): 情绪兜底。基于 AI 意图识别，优先处理投诉或急躁情绪。
 * - [排序逻辑] 综合以上因子计算总分，并按降序排列，确保高优会话强制置顶。
 */
const processedSessions = computed(() => {
  const scored = filtered.map(session => {
    const timeScore = Math.max(0, 1 - (Date.now() - session.createdAt) / (30 * 60 * 1000))
    const levelScore = (session.priorityLevel - 1) / 4
    const urgencyScore = session.urgencyScore || 0
    const totalScore =
      activeWeights.value.timeWeight * timeScore +
      activeWeights.value.levelWeight * levelScore +
      activeWeights.value.urgencyWeight * urgencyScore
    return { ...session, _score: totalScore }
  })
  return scored.sort((a, b) => b._score - a._score)
})
```

**解耦价值**：权重配置可随时从后端 `GET /system/config/chat_sorting` 接口动态下发，前端无需修改任何视图代码。

---

### 3.3 权限体系 —— Role-Weight 双层控制

项目实现了**角色权重（Role-Weight）**与**菜单权限（Permission）**两层隔离的权限体系。

**角色权重**（`src/store/chatStore.js`）：

```javascript
const ROLE_WEIGHT_MAP = {
  super_admin: 100,
  admin: 80,
  leader: 50,
  agent: 10
}
```

**权限校验**（`src/utils/permission.js`）：

```javascript
export function checkPermission(currentUser, targetUser) {
  if (currentUser.role === 'super_admin') return true
  const currentWeight = ROLE_WEIGHT_MAP[currentUser.role] || 0
  const targetWeight = ROLE_WEIGHT_MAP[targetUser.role] || 0
  if (currentWeight <= targetWeight) return false
  return targetUser.path.startsWith(currentUser.path)
}

export function hasMenuPermission(permissionCode) {
  if (chatStore.currentUserRole === 'super_admin') return true
  if (chatStore.currentUserPermissions.includes('*')) return true
  return chatStore.currentUserPermissions.includes(permissionCode)
}
```

---

### 3.4 架构思想：高内聚、低耦合与可插拔设计

本项目在架构设计中系统性践行了软件工程的三大核心思想：**高内聚**（职责内聚，不该管的不要管）、**低耦合**（依赖反转，数据生产者与消费者互不相识）、**可插拔**（热拔插，业务模块可独立替换而不影响系统）。

#### 3.4.1 高内聚：自包含的「单一职责单元」

**案例 1：`ProAvatar` 组件 —— 头像渲染的完全自封装**

文件：[`src/components/ProAvatar/index.vue`](file:///Users/mac/Desktop/saas-admin-workbench/src/components/ProAvatar/index.vue)

`ProAvatar` 组件实现了头像显示的**三级兜降逻辑**，完全不暴露内部决策细节给调用方：

```javascript
const avatarLevel = computed(() => {
  if (props.src) return 'personal'    // 优先用传入的图片URL
  if (appStore.globalFallbackAvatar) return 'global'  // 其次用全局兜底图
  return 'initial'                    // 最终用名字首字母+颜色哈希
})
```

调用方只需 `<ProAvatar :name="currentUserName" />`，无需关心"有没有图片URL"、"全局兜底图是什么"、"名字颜色怎么算"——所有决策和渲染逻辑封堵在组件内部。**单一职责：只管头像怎么显示**。

**案例 2：`InfoLabel` 组件 —— 字典文案渲染的完全自封装**

文件：[`src/components/InfoLabel.vue`](file:///Users/mac/Desktop/saas-admin-workbench/src/components/InfoLabel.vue)

`InfoLabel` 组件只做一件事：根据传入的 `dictKey` 从 `globalStore.metricsDict` 读取文案并渲染问号气泡。它不依赖任何业务状态，不关心数据从哪来。调用方只需 `<InfoLabel dict-key="session_duration" />`，传入 key 即可获得带解释气泡的标准 UI。

**案例 3：`useReplyStore` —— 快捷回复数据的自闭环**

文件：[`src/store/replyStore.js`](file:///Users/mac/Desktop/saas-admin-workbench/src/store/replyStore.js)

快捷回复的增删改查（`updateReply`/`addReply`/`deleteReply`/`toggleReply`）全部封装在 Pinia Store 内部。`Chat/index.vue` 通过 `replyStore.quickReplies` 直接读取数组，Store 内部维护数组的不变性（`splice`/`push` 操作均对数组副本进行）。Store 自己是数据的唯一主人，外部只能读值，不能直接修改内部结构。

---

#### 3.4.2 低耦合：View ↔ Data 的双向依赖解耦

**案例 1：Mock 层与视图层的完全解耦**

文件：[`src/mock/chatMock.js`](file:///Users/mac/Desktop/saas-admin-workbench/src/mock/chatMock.js) → [`src/views/Chat/index.vue`](file:///Users/mac/Desktop/saas-admin-workbench/src/views/Chat/index.vue)

`Chat/index.vue` 的会话列表数据来源是：

```javascript
import { chatSessionsMockData, chatSortingConfig } from '@/mock/index.js'
const sessions = ref([...chatSessionsMockData])
```

视图组件**不直接依赖任何 API 函数**，它只依赖一个**纯数据对象** `chatSessionsMockData`。当后端 API ready 时，只需在 `src/mock/index.js` 中将 `chatSessionsMockData` 的导出替换为真实 API 调用返回值，**视图层零改动**。

同样，`chatSortingConfig` 作为纯配置对象注入 `activeWeights`，视图只读取权重值，**不关心权重值来自 Mock 还是来自 `GET /system/config` 接口**。

**案例 2：`channelStore` —— 渠道数据的单向依赖解耦**

文件：[`src/store/channelStore.js`](file:///Users/mac/Desktop/saas-admin-workbench/src/store/channelStore.js)

`channelStore` 内部维护 `channelList`，并暴露 `getChannelName(id)` / `getChannelTypeLabel(code)` 等**查询只读接口**。数据的增删改（`addChannel`/`updateChannel`/`deleteChannel`）也封装在 Store 内部，外部调用方无需知道数据结构是什么、有哪些字段。

关键是：**Store 不依赖任何 Vue 组件**，它是完全独立的响应式数据单元。任何组件需要查询渠道信息，只需 `import { useChannelStore }` 并调用 `getChannelName(id)`，组件本身与数据存储结构**零耦合**。

**案例 3：`buildChatPrompt` 与 `chatWithRealAI` 的职责分离**

文件：[`src/utils/llmContext.js`](file:///Users/mac/Desktop/saas-admin-workbench/src/utils/llmContext.js)

```
buildChatPrompt() —— 只负责"裁剪对话历史，构建 prompt 结构"
chatWithRealAI() —— 只负责"携带 prompt 发送网络请求，获取 AI 回复"
```

两个函数**各自独立，无相互调用**，各自可独立测试、独立替换。若未来将 Dify AI 替换为其他 LLM 提供方，只需修改 `chatWithRealAI` 内部 `fetch` 逻辑，**上游的 `buildChatPrompt` 及其调用方完全不受影响**。

---

#### 3.4.3 可插拔：业务模块的即插即用设计

**案例 1：动态会话优先级调度引擎的「热拔插权重」**

文件：[`src/mock/configMock.js`](file:///Users/mac/Desktop/saas-admin-workbench/src/mock/configMock.js) → [`src/views/Chat/index.vue`](file:///Users/mac/Desktop/saas-admin-workbench/src/views/Chat/index.vue#L56-L58)

权重参数（`timeWeight: 0.6, levelWeight: 0.3, urgencyWeight: 0.1`）以纯 JS Object 形式存在于 `configMock.js`，注入方式为：

```javascript
// TODO: [API对接] 未来将下面这行替换为: const res = await api.getSystemConfig('chat_sorting'); activeWeights.value = res.data
const activeWeights = ref({ ...chatSortingConfig })
```

注释清晰地标注了"未来替换路径"。当后端 `GET /system/config/chat_sorting` 接口 ready 时，只需：① 在 `src/api/` 下实现该接口；② 取消注释并填入真实调用——**调度引擎的核心算法完全不改动**，因为它只读 `activeWeights.value`。

**案例 2：角色权限体系的「策略可替换性」**

文件：[`src/store/chatStore.js`](file:///Users/mac/Desktop/saas-admin-workbench/src/store/chatStore.js) → [`src/utils/permission.js`](file:///Users/mac/Desktop/saas-admin-workbench/src/utils/permission.js)

角色权限校验的**策略函数**完全抽离在 `utils/permission.js` 中：

```javascript
export function hasMenuPermission(permissionCode) {
  const chatStore = useChatStore()
  if (chatStore.currentUserRole === 'super_admin') return true  // 超级管理员 bypass
  if (chatStore.currentUserPermissions.includes('*')) return true  // 通配符权限
  return chatStore.currentUserPermissions.includes(permissionCode)
}
```

若未来业务需要从"角色权限"切换为"基于 RBAC 的细粒度权限"或"ABAC 策略"，**只需重写 `permission.js` 中的函数签名和判断逻辑，调用方（`Layout.vue`、`router/index.js`）的代码无需任何改动**——因为它们只调用 `hasMenuPermission(code)` 这个接口。

**案例 3：`avatar.js` 颜色哈希算法的「算法可替换性」**

文件：[`src/utils/avatar.js`](file:///Users/mac/Desktop/saas-admin-workbench/src/utils/avatar.js)

头像背景色的生成算法（基于名字的 hash + 取模选色）以**纯函数**形式导出：

```javascript
export function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}
```

该函数**无任何外部依赖**（不读 store、不读 localStorage、不发请求），输入 `name` 输出 `color`。若未来产品需要从"哈希配色"切换为"基于品牌的固定色板"或"从后端下发头像配色"，**只需修改 `avatar.js`，`ProAvatar` 组件和所有调用方零感知**。

---

#### 3.4.4 架构思想总览

| 思想 | 核心要义 | 落地案例 | 文件 |
|------|----------|----------|------|
| **高内聚** | 一个模块只做一件事，做到极致 | `ProAvatar` 三级兜降逻辑封装 | `src/components/ProAvatar/index.vue` |
| **高内聚** | 一个 Store 自治数据增删改查 | `useReplyStore` 快捷回复的 CRUD | `src/store/replyStore.js` |
| **低耦合** | 视图只读数据，不关心数据从哪来 | `Chat/index.vue` 依赖 `chatSessionsMockData` 纯对象 | `src/mock/chatMock.js` |
| **低耦合** | Store 与组件双向无感知 | `channelStore` 提供查询接口，不暴露结构 | `src/store/channelStore.js` |
| **低耦合** | 工具函数无外部依赖，可独立测试 | `buildChatPrompt` 与 `chatWithRealAI` 职责分离 | `src/utils/llmContext.js` |
| **可插拔** | 配置数据可热替换为 API 返回 | 调度引擎权重参数 `chatSortingConfig` | `src/mock/configMock.js` |
| **可插拔** | 权限策略可整体替换 | `hasMenuPermission` 函数可独立演进 | `src/utils/permission.js` |
| **可插拔** | 纯函数算法可随时替换实现 | `getAvatarColor` 哈希算法可替换 | `src/utils/avatar.js` |

---

## 四、工程目录拓扑

```
saas-admin-workbench/
├── .rules/                          # 研发法典（4大规范文件）
│   ├── 01-dev-spirit.md             # 开发纪律：注释规范、边界防御、交付验证
│   ├── 02-api-contract.md           # API 契约：统一响应体、错误矩阵、快照原则
│   ├── 03-ui-style.md               # UI 样式：栅格系统、响应式、防撞规范
│   └── 04-security.md               # 安全规范：租户风控、凭证生命周期
├── src/
│   ├── api/                         # 真实 API 封装（目前仅 dict/log）
│   │   ├── dict.js
│   │   └── log.js
│   ├── assets/                      # 静态资源（图片、SVG）
│   ├── components/                  # 公共组件
│   │   ├── ProAvatar/               # 头像组件（支持 initials 回退 + 全局兜底图）
│   │   ├── ProHelp/                 # 业务解释气泡组件
│   │   ├── HelloWorld.vue
│   │   ├── InfoLabel.vue            # 字典解释标签（依赖 i18n）
│   │   └── Watermark.vue            # 全局水印指令
│   ├── config/                      # 全局配置常量
│   │   ├── constants.js
│   │   └── theme.js                 # 主题色变量定义
│   ├── directives/                  # Vue 指令（权限指令等）
│   │   └── permission.js
│   ├── mock/                        # Mock 数据层（API-Ready 核心）
│   │   ├── index.js                 # 统一导出入口
│   │   ├── chatMock.js              # 会话列表/历史 Mock
│   │   ├── configMock.js             # 业务配置参数（排序权重等）
│   │   ├── roleMock.js               # 角色/权限树 Mock
│   │   ├── teamMock.js               # 团队成员 Mock
│   │   └── userMock.js               # 用户 Profile Mock
│   ├── router/
│   │   └── index.js                 # 路由定义（含权限 meta）
│   ├── store/                       # Pinia 状态管理
│   │   ├── app.js                   # 全局主题/语言状态
│   │   ├── chatStore.js             # 角色权重/权限状态
│   │   ├── channelStore.js          # 渠道配置状态
│   │   ├── global.js                # 全局共享状态
│   │   └── replyStore.js            # 快捷回复状态
│   ├── styles/                      # 全局 SCSS
│   │   ├── global.scss
│   │   └── pro-design.scss
│   ├── utils/                       # 工具函数
│   │   ├── auditLogger.js           # 审计日志
│   │   ├── avatar.js                # 头像颜色/文字生成
│   │   ├── llmContext.js            # LLM 对话上下文构建 + Fetch 调用
│   │   ├── monitor.js              # 前端监控
│   │   ├── permission.js           # 权限校验函数
│   │   ├── theme.js                # 主题色应用
│   │   └── useConfirmDelete.js     # 删除确认 Hook
│   ├── views/                       # 页面视图
│   │   ├── Auth.vue                 # 认证入口
│   │   ├── Chat/                   # 客户会话工作台（核心）
│   │   │   └── index.vue
│   │   ├── Dashboard/              # 数据看板
│   │   │   ├── AIPerformance.vue   # AI 效能分析
│   │   │   └── Realtime.vue        # 实时大屏
│   │   ├── Login.vue                # 登录页
│   │   ├── Layout.vue               # 全局布局框架
│   │   ├── Profile/                 # 个人中心
│   │   │   └── index.vue
│   │   ├── Ticket/                  # 工单系统
│   │   │   └── index.vue
│   │   └── Setting/                 # 系统配置模块
│   │       ├── AiConfig.vue         # AI 模型配置
│   │       ├── Channel.vue          # 渠道接入
│   │       ├── Dictionary.vue       # 字典管理
│   │       ├── Enterprise.vue       # 企业资料
│   │       ├── Knowledge.vue        # 知识库
│   │       ├── LLMConfig.vue        # LLM 基座配置
│   │       ├── OpLog.vue            # 操作日志
│   │       ├── Preferences.vue      # 基础偏好
│   │       ├── Role.vue             # 角色管理
│   │       ├── Security.vue         # 安全中心
│   │       ├── Team.vue             # 团队管理
│   │       └── index.vue            # 设置首页
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
└── vite.config.js
```

**各顶层目录职责边界**：

| 目录 | 职责边界 |
|------|----------|
| `api/` | 真实后端接口的封装层（目前为预置结构，实际请求暂走 Mock） |
| `mock/` | **数据隔离层**，所有业务数据的 Mock 实现，注释标注真实接口路径 |
| `store/` | Pinia 响应式状态，不承载业务逻辑，仅做状态读写 |
| `views/` | 页面组件，承载业务逻辑，通过调用 `mock/` 或 `utils/` 完成功能 |
| `components/` | 原子/分子级 UI 组件，无业务依赖，可跨项目复用 |
| `utils/` | 纯函数工具，不涉及 Vue 响应式，如权限校验、主题色应用、LLM 上下文构建 |

---

## 五、核心业务板块

### 5.1 客户会话工作台（Chat）

**产品形态**：三栏式 Splitpanes 布局 —— 左侧会话列表 → 中间聊天窗口 → 右侧客户画像。

**左侧会话列表设计要点**：

- **动态优先级排序**：会话根据 `timeWeight`（时间）、`levelWeight`（优先级）、`urgencyWeight`（紧急度）三维权值动态排序，权重由 `chatSortingConfig` 集中配置。
- **仅看未读过滤器**：`onlyUnread` 开关控制列表过滤。
- **会话缓存**：基于 Map 的 LRU 缓存（`MAX_CACHE_SIZE = 10`），避免重复拉取历史记录。
- **防抖发包控制**：Token Bucket 限流算法（`CAPACITY = 5`，`REFILL_RATE = 0.5`），防止高频发包。

**中间聊天窗口设计要点**：

- **防视口劫持**：AI 思考状态通过 CSS animation 实现，不阻塞主线程。
- **Markdown 渲染**：使用 `marked` 将 AI 返回的 Markdown 内容渲染为 HTML。
- **快捷回复触发**：输入 `/` 触发快捷回复浮层，支持键盘导航（↑↓ 选择，Enter 确认）。
- **AI 摘要生成**：调用 `generateRealSummary()` 读取全量会话历史，生成结构化摘要（情绪、意图标签、核心诉求、建议动作）。

**右侧客户画像设计要点**：

- **快照存储**：客户基本信息（来源渠道、当前页面、历史记录）以快照形式展示，不依赖实时联表查询。
- **AI 智能摘要卡片**：一键生成结构化摘要，帮助客服快速掌握会话上下文。

### 5.2 个人中心（Profile）

**接待状态联动**：客服切换接待状态（在线/离线/忙碌/离开）后，通过 `updateReceptionStatus()` 同步至后端，决定路由引擎的派单行为。

**断网/弱网防御**（以 `handleStatusChange` 为例）：

```javascript
const handleStatusChange = async (newStatus) => {
  isSaving.value = true          // 第一层防御：立即锁定 UI
  try {
    await updateReceptionStatus(newStatus)
    profile.receptionStatus = newStatus
    ElMessage.success('接待状态更新成功')
  } catch (error) {
    ElMessage.error('网络异常，请重试')  // 严禁静默失败
  } finally {
    isSaving.value = false        // finally 确保无论成功/失败均解锁
  }
}
```

**防重复提交**：所有变更操作（改密、注销设备等）均配备 `isSaving` 锁 + `ElMessageBox.confirm()` 二次确认。

### 5.3 全局导航（Layout/Header）

**极简设计**：Header 仅包含品牌名称 + 用户头像下拉，不做任何复杂交互。

**头像下拉菜单**：

- 显示当前用户名 + 角色标签（超级管理员 / 管理员 / 主管 / 客服）
- 「个人中心」跳转至 `/profile`
- 「退出登录」执行 `ElMessage.success()` 提示（实际注销逻辑待后端接入）

**菜单权限剥离**：通过 `visibleMenus` computed 根据 `chatStore.currentUserPermissions` 动态控制菜单项显示，无需后端参与即可验证前端权限隔离是否正确。

### 5.4 身份鉴权与安全登录（Auth）

**产品形态**：左右分栏布局 —— 左侧品牌展示区，右侧登录/注册表单。

**UI 与交互现状**：

- 使用 Element Plus 组件：`el-form`、`el-input`（password/show-password）、`el-checkbox`、`el-button`（loading/disabled 状态）
- 提交按钮绑定了 `loading` + `disabled` 双保险状态（`isSubmitDisabled` computed）
- **验证码倒计时**：独立的 `countdown` + `countdownTimer` 状态，防止用户在倒计时期间重复触发
- **蜜包字段（Honeypot）**：隐藏的 `honeypot` 字段用于反爬虫检测
- **快捷登录按钮**：登录表单下方新增「快捷体验」入口，支持 [管理员模式]（账号：admin，密码：admin123）和 [客服模式]（账号：agent001，密码：123456），点击后自动填充并触发登录流程

**表单校验现状**：

- 使用 `el-form` 的 `:rules` 属性，定义了 `loginRules` / `registerRules` / `resetFormRules` 三套规则
- 自定义 `validator` 函数实现了账号格式校验（手机号/邮箱二选一）、密码强度校验（8位+字母+数字）、企业名称异步防重复校验
- `handleSubmit` 中调用 `loginFormRef.value.validate()` 进行提交前拦截

**数据流与 API 现状（Mock 阶段）**：

- Token 存储：使用 `localStorage`（记住密码 / 7天有效期）或 `sessionStorage`（单次会话）
- `executeLogin()` 使用 `setTimeout` 模拟 1.5s 异步请求，返回 `mock_token_` + 时间戳
- `onMounted` 时从 `localStorage` 恢复企业代码（`auth_data` + `auth_expiry` 双重过期校验）
- **暂无真实后端 API 调用**，所有登录逻辑为纯前端 Mock

**异常防御现状**：

- `handleSubmit` 内部有 `lastSubmitTime` 节流（2秒内防重复提交）
- `executeLogin` 外层有 `try...catch...finally`（但实际为 Mock 延时，未捕获真实错误）
- 登录成功/失败通过 `ElMessage.success()` / `ElMessage.error()` 反馈用户
- **无网络超时兜底**（当前为 `setTimeout` 模拟，未配置真实接口超时）

**当前待优化项（TODO）**：

- 接入真实登录 API（替换 `setTimeout` 为 `fetch` 调用）—— 接入后需补充完整 `try...catch` 错误处理
- 登录失败重试次数限制（当前仅靠 `lastSubmitTime` 节流，无最大重试次数）—— 建议增加 5 次失败后锁定机制

**✅ 已修复项（本次迭代）**：

- ✅ **强制路由守卫**：已实现 `router.beforeEach`，所有非 `/login` 路径在无 Token 时强制跳转至登录页
- ✅ **退出登录清理**：已完善 `handleLogout`，精确清除 `auth_token` / `auth_data` / `auth_expiry`，并重定向至 `/login`
- ✅ **表单脏数据清理**：已在 `toggleMode` / `toggleToResetMode` / `toggleToLoginMode` 中补充 `loginFormRef.value?.resetFields()` 调用
- ✅ **协议死链修复**：已将 `href="#"` 替换为 `href="javascript:void(0)"`，确保链接可点击不跳页

**安全规范与表单校验分值提升**：

| 维度 | 修复前 | 修复后 |
|------|--------|--------|
| **安全规范** | ⭐⭐ 较弱 | ⭐⭐⭐⭐ 良好 |
| **表单校验** | ⭐⭐⭐⭐⭐ 完善 | ⭐⭐⭐⭐⭐ 完善 |

---

## 六、研发军规与 AI 协作契约

### 6.1 四大法典核心精神

| 规范文件 | 核心精神 |
|----------|----------|
| `01-dev-spirit.md` | **外科手术式修改 + 交付可验证**。严禁全盘重写，每行改动必须有业务解释；交付物不是代码，是**可运行的功能**。 |
| `02-api-contract.md` | **统一响应体 + 快照存储原则**。所有 API 必须返回 `{ code, message, data, trace_id }`；历史流水数据必须快照冗余存储，切断"当前状态"对"历史事实"的干扰。 |
| `03-ui-style.md` | **零妥协 UI/UX + 激活态三合一原则**。Active 状态必须同时满足：字体加粗 + 背景色/投影 + 底部高亮线。危险操作（Danger）必须：图标 + type="danger" + ElMessageBox.confirm 三重防护。 |
| `04-security.md` | **数值边界锁死 + 凭证生命周期管理**。所有数字输入必须配置 `min/max`；初始密码必须过期机制；高危操作必须 1.5s 摩擦延迟 + `localStorage.clear()` 强制重新认证。 |

### 6.2 注释规范底线

**四类必须添加 `[业务规范]` 注释的场景**：

1. **状态机与权限锁**：任何阻断操作的判断逻辑。
2. **数据底线操作**：逻辑删除、唯一键释放等。
3. **反直觉的妥协**：为绕过组件缺陷或兼容历史遗留问题而写的 Hack。
4. **资金与安全**：计费限制、有效期计算、凭证下发等。

**核心算法注释三要素**（以调度引擎为例）：

1. **模块定性**：这是什么引擎/算法？
2. **数据链路**：核心参数从哪里动态获取？
3. **因子解析**：每个计算因子的业务含义？

### 6.3 边界异常防御底线

- **严禁静默失败**：所有 `catch` 块必须 `ElMessage.error()` 人类可读提示。
- **严禁幽灵数据**：表单关闭必须 `resetFields()` + 手动清空 `reactive` 对象。
- **严禁只绑不安禁**：`loading` 状态必须同时配合 `disabled`，防止键盘回车误触发。
- **严禁空状态白屏**：所有表格/列表必须配置 `empty` 插槽。

---

## 七、API-Ready 接口对接指南

### 7.1 统一响应体规范

所有后端接口必须遵循以下 JSON 结构：

```json
{
  "code": "SUCCESS",
  "message": "操作成功",
  "data": {},
  "trace_id": "uuid-v4"
}
```

| code | 含义 | AI 动作 |
|------|------|---------|
| `SUCCESS` | 成功 | 解析 data，继续执行 |
| `BIZ_ERROR` | 业务拦截 | 停止，将 message 原样告知用户 |
| `PARAM_INVALID` | 参数校验失败 | 停止，检查传参格式 |
| `AUTH_DENIED` | 权限不足 | 停止，引导联系管理员 |
| `SYS_ERROR` | 系统异常 | 停止，告知"服务繁忙" |

### 7.2 Mock → 真实 API 切换路径

| 模块 | Mock 文件 | 待接入接口 |
|------|-----------|------------|
| 用户 Profile | `src/mock/userMock.js` | `GET /user/profile`, `PUT /user/preferences` |
| 会话列表 | `src/mock/chatMock.js` | `GET /chat/sessions` |
| 排序配置 | `src/mock/configMock.js` | `GET /system/config/chat_sorting` |
| 角色权限 | `src/mock/roleMock.js` | `GET /roles`, `GET /permissions` |
| LLM 对话 | `src/utils/llmContext.js` | `POST /api/v1/chat` |

**切换步骤**：

1. 在 `src/api/` 目录下创建对应的 API 封装文件。
2. 将 Mock 函数上方的 `TODO: [API对接]` 注释替换为真实 `fetch` 调用。
3. 全局搜索 `from '@/mock/index.js'` 的引用路径，替换为 `from '@/api/xxx.js'`。
4. 确保所有网络请求的错误处理遵循 `.rules/02-api-contract.md` 的统一响应体解析逻辑。

# Latest Update: Mon Apr 27 00:46:32 CST 2026
