# UI 样式综合规范 (UI Style Consolidated Rules)

> 本文件统一了表单布局、响应式降级与界面交互的核心约束，是一份纯粹的视觉与界面规范。

---

## 【1. 基础布局规范】

### 1.1 栅格系统配置

- 使用 Element Plus 的 `el-row` 和 `el-col` 组件
- 默认 gutter 间距：**24px**（表单场景）或 **20px**（紧凑列表场景）
- 响应式断点标准：

| 断点 | 设备类型 | 宽度范围 |
|------|----------|----------|
| xs | 移动端 | < 768px |
| sm | 平板 | ≥ 768px |
| md | 小桌面 | ≥ 992px |
| lg | 标准桌面 | ≥ 1200px |

### 1.2 表单宏观排版

1. **严禁参差不齐**：所有包含多个输入项的 `<el-form>`，在桌面端（`sm` 及以上断点）必须显式设定 `label-position="right"` 和统一的 `label-width`，确保所有输入框的左侧边缘形成一条绝对垂直的基准线。
2. **标签宽度默认值**：`label-width` 默认使用 **100px**；对于"对外昵称"等长文本标签（超过 5 个汉字），允许放宽至 **120px**。
3. **标签宽度自适应禁区**：严禁在标准表单中使用 `label-width="auto"`，除非是在极其狭窄的特殊面板中。
4. **两列布局**：`el-col :span="12"`，栅格间距 `:gutter="24"`。

### 1.3 Flex 与对齐法则

- Flex 布局用于**单行内元素对齐**（`justify-content`, `align-items`）
- 栅格布局用于**多行列式布局**（`el-row` + `el-col`）
- **标签物理锁死**：所有 `el-form-item__label` 必须强制使用 `display: inline-flex; align-items: center;`，严禁使用 Baseline 对齐。
- **防折行底线**：包含帮助图标的标签必须附加 `white-space: nowrap` 与 `flex-shrink: 0`，宁可容器溢出也绝不允许图标单独折行。

### 1.4 卡片与容器规范

- 卡片内使用 `el-row` 时，gutter 通过 CSS margin 负值实现
- 确保子元素间距统一，避免内容贴边
- 桌面端可使用左右分栏、卡片栅格等复杂布局

### 1.5 表单标签与提示图标对齐规范 (Label & Tooltip Alignment)

> **核心原则**：当表单项的 Label 旁需要跟随解释型气泡（如全局问号图标或 el-tooltip）时，严禁将图标放置在默认的表单控件区域。

**强制使用具名插槽**

必须且只能使用 Element Plus 的 `<template #label>` 具名插槽来组织标签区域：

```vue
<el-form-item>
  <template #label>
    <span style="display: inline-flex; align-items: center; gap: 4px;">
      系统提示词
      <InfoLabel dict-key="system_prompt_hint" /> ← 问号图标必须在插槽内
    </span>
  </template>
  <el-input ... /> ← 表单控件不受影响
</el-form-item>
```

**Flexbox 居中对齐约束**

插槽内部的包裹层**必须**使用以下样式组合：

```css
display: inline-flex;   /* 水平排列 */
align-items: center;   /* 垂直居中对齐 */
gap: 4px;             /* 文字与图标间距 */
```

**绝对禁止的行为**

| 错误做法 | 说明 |
|---------|------|
| 将图标放在 `el-input` 上方或与 input 同级 | 图标会混入控件区域，导致视觉错位 |
| 使用 `display: flex` 而非 `inline-flex` | 可能导致标签区域高度异常 |
| 不使用 `#label` 插槽，直接写 `label="文字"` | Label 属性无法携带复杂结构 |
| 使用 `align-items: baseline` | 图标与中文无法垂直居中 |

---

## 【2. CSS 命名与变量】

### 2.1 样式作用域

- 组件级样式必须使用 `scoped` 限制作用域
- 避免全局污染，优先使用 CSS 自定义属性（变量）管理主题色

### 2.2 Element Plus 主题覆盖

- 通过 CSS 变量覆盖 Element Plus 默认主题色
- 长文本气泡必须加上 `popper-class="pro-tooltip"`，依赖全局样式定义的最大宽度 280px、允许换行、增大行高 `line-height: 1.6`

### 2.3 统一调用规范

- 任何字段解释必须使用 `<ProHelp content="..." />` 原子组件，**严禁手写 `el-tooltip`**

---

## 【3. 响应式与防塌陷】

### 3.1 桌面端布局（md 及以上）

- 允许使用多栏 Flex/Grid 布局
- 可使用左右分栏、卡片栅格等复杂布局
- 侧边栏、装饰性元素可正常展示

### 3.2 移动端强制降级（xs 和 sm）

- **强制转为单列上下堆叠布局**（`flex-direction: column`）
- **隐藏非核心视觉装饰元素**（品牌展示区、装饰性图形、侧边栏）
- **表单容器宽度必须设为 100%**
- **保留适度内边距**（如 `padding: 20px`）
- 按钮和输入框需占满可用宽度

### 3.3 表单响应式折叠

- **桌面端（sm 及以上）**：默认使用 `label-position="right"`，配合固定 `label-width`（默认 100px，长标签 120px）形成整齐的垂直基准线。
- **移动端（xs 窄屏）**：必须强制覆盖为 `label-position="top"`，让标签与输入框上下堆叠排列，宽度自适应 100%。
- **超长标签例外**：对于"对外昵称"等超长标签（含问号图标提示），允许局部切换为 `label-position="top"`，但同一表单内必须保持统一。
- 按钮宽度在移动端应占满容器（`width: 100%`）。

### 3.4 登录页专项

#### 桌面端（md 及以上）
- 采用左右双栏布局
- 左侧占 50%（品牌展示、Slogan，主色调背景）
- 右侧占 50%（纯白背景居中表单，最大宽度 400px）

#### 移动端（sm 及以下）
- 自动隐藏左侧品牌展示区
- 右侧表单区占满屏幕 100%
- 表单居中显示，表单元素占满可用宽度

### 3.5 CSS 媒体查询模板

```scss
/* 移动端优先：默认单列布局 */
.container {
  padding: 20px;
  width: 100%;
}

/* 平板及以上（sm, md, lg） */
@media (min-width: 768px) {
  .container {
    padding: 40px;
  }
}

/* 桌面端（md 及以上）允许多栏布局 */
@media (min-width: 992px) {
  .container {
    display: flex;
  }
}
```

### 3.6 Element Plus 响应式辅助类

- `hidden-xs-only` / `hidden-sm-and-up` 等辅助类控制元素显示隐藏
- 布局容器使用 `el-container`、`el-aside`、`el-main`

---

## 【4. 交互细节】

### 4.1 复杂字段校验

- 凡是遇到"登录账号"、"联系方式"等允许混填的字段（如手机号/邮箱二选一），禁止使用简单的单条正则表达式
- 必须在底层抽离出独立的 `validator` 校验函数，同时兼容手机号（`/^1[3-9]\d{9}$/`）和标准邮箱正则，并在校验失败时给出精确的红字报错引导

### 4.2 业务语言化法则

- 前端展示文案（Label）严禁暴露纯技术名词（如"最大并发"、"字段上限"）
- 必须转化为 C 端直觉文案（如"接待上限"、"同时处理人数"），并在右侧附带小问号图标（Tooltip）做具体机制的解释

---

## 【5. 通用业务字段校验规范 (Standard Form Validation)】

> 所有涉及数据录入的业务表单，必须严格遵循以下正则校验标准，不得私自定制或放宽。

### 5.1 标准正则字典库

| 字段类型 | 正则表达式 | 说明 |
|----------|------------|------|
| **联系电话** | `/^((0\d{2,3}-\d{7,8})|(1[3-9]\d{9}))$/` | 支持中国大陆手机号（1开头11位）与带区号固话（010-12345678） |
| **电子邮箱** | `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` | 标准 Email 格式 |
| **纳税人识别号** | `/^[A-Z0-9]{15,18}$/` | 15-18位大写字母加数字 |
| **银行账号** | `/^\d{10,30}$/` | 10-30位纯数字 |

### 5.2 校验函数抽离原则

- 所有正则必须抽离为独立的校验函数（如 `validatePhone`、`validateEmail`），禁止在模板中内联正则字符串
- 校验函数必须同步返回 `boolean` 与错误文案，供 `validator` 回调使用

### 5.3 表单提交拦截纪律

1. **强制使用 `:rules` 绑定**：所有业务表单必须通过 Element Plus 的 `:rules` 属性绑定校验规则
2. **提交前必须拦截**：在执行 `submit` 保存前，必须且只能调用 `formRef.value.validate()` 进行拦截
3. **严禁脏数据发请求**：未通过 `validate()` 的表单严禁携带任何字段发起网络请求
4. **统一错误展示**：校验失败时，错误信息通过 Element Plus 自动渲染红字提示，不得自行实现错误 DOM

### 5.4 绝对禁令

- **禁止手写正则**：严禁在业务代码中硬编码正则字符串，所有正则必须来源于本规范库
- **禁止绕过验证**：禁止使用 `disabled` 或 `readonly` 替代前端校验，所有非只读字段必须可被校验
- **禁止静默提交**：禁止在无 `loading` 状态的情况下静默提交，必须配备防并发节流

### 5.5 高级业务场景：发票与财务信息校验

> 以下规则适用于「企业资料 → 发票抬头信息」及其他财务录入场景。

| 字段 | 必填 | 校验规则 | 正则 / 约束 |
|------|------|----------|-------------|
| **发票抬头** | 必填 | 长度 ≥ 2 个字符，且严禁为纯数字 | `min: 2` + `pattern: /^[^0-9]+$/` |
| **纳税人识别号** | 必填 | 强制 15-18 位大写字母与数字 | `/^[A-Z0-9]{15,18}$/` |
| **单位注册地址** | 非必填 | 若填写，长度必须 ≥ 5 个字符（防止"无"等无效单字） | `min: 5`（仅在有值时触发） |
| **注册固定电话** | 非必填 | 若填写，必须符合电话正则（支持手机或座机） | `/^((0\d{2,3}-\d{7,8})|(1[3-9]\d{9}))$/` |
| **开户银行** | 非必填 | 若填写，必须包含中文字符，严禁纯数字或纯拼音 | `/^[\u4e00-\u9fa5()（）]+$/` |
| **银行账号** | 非必填 | 若填写，必须为 10-30 位纯数字 | `/^\d{10,30}$/` |

#### 非必填字段的校验触发条件

- 非必填字段的 `required: true` 规则**不得设置**
- `pattern` 或 `min` 规则正常配置，Element Plus 默认在字段**有值时**才触发非空校验；若字段为空则跳过该规则
- 若需更精确的"有值才校验"行为，推荐使用自定义 `validator` 函数实现

#### UI 标识规范

- 必填项的 `el-form-item` 必须设置 `required` 属性，Element Plus 会自动在标签旁渲染红色星号 `*`
- 触发方式（`trigger`）统一设置为 `blur`（失焦时校验），与后端接口提交前的 `formRef.value.validate()` 双重保障

---

## 【6. B端系统可用性规范 (B2B Usability Standards)】

> 目标：降低非技术人员（运营、客服主管等）的认知负担，避免因误解字段含义导致的错误配置。

### 6.1 技术名词大白话原则

凡是表单或列表中出现纯技术名词（如：API、Token、Webhook、密钥、基座模型、Session、Callback 等），**必须**在其 Label 右侧使用 `<InfoLabel>` 或 `<el-tooltip>` 追加解释气泡。

#### 气泡文案规范

- 严禁仅做字面翻译或堆砌技术术语
- 气泡文案必须包含两部分：
  1. **业务作用**：该字段在业务流程中解决什么问题
  2. **填写示例**：告诉用户"应该填什么"或"填错了会怎样
- 文风要求：说人话、接地气，面向完全不懂技术的业务人员

#### 示例对比

| ❌ 错误示例（字面翻译） | ✅ 正确示例（业务导向） |
|-------------------------|------------------------|
| "API Key：用于API调用的密钥" | "API 凭证：系统后台通信的"身份证"，由字母数字组成，用于第三方系统对接。填写后对方系统才能访问您的数据，切勿泄露给他人。" |
| "Webhook 地址：用于接收回调的 URL" | "回调地址：对方系统推送消息的目标地址。一般由对方技术提供，格式如 `https://your-domain.com/callback`，填写错误将导致消息推送失败。" |
| "Token：访问令牌" | "访问令牌：相当于"一次性入场券"，用于验证请求是否合法。令牌过期后需重新获取，否则接口调用会报"无权限"错误。" |

### 6.2 技术名词速查清单

以下名词在本系统中均视为**必须附气泡**的技术术语：

| 技术名词 | 业务解释方向 |
|----------|-------------|
| API Key / Secret | 第三方系统对接的"账号密码" |
| Token / Access Token | 接口通信的"入场券"，有过期时间 |
| Webhook | 对方系统主动推送消息的"门牌号" |
| 密钥 / SecretKey | 比密码更复杂的"锁"，丢失后风险极高 |
| Callback | 支付或事件完成后的"回执通知" |
| 基座模型 | AI 回复的"大脑"，决定回答质量 |
| 会话超时 | 多久不操作会被系统"踢出"重新登录 |
| 闲置登出 | 多长时间无操作后自动退出，保障安全 |

### 6.3 气泡组件使用规范

- **推荐使用 `<InfoLabel dict-key="..." />`**（优先），依赖全局 i18n 翻译
- **备选使用 `<el-tooltip>`**，需搭配 `popper-class="pro-tooltip"`
- 气泡最大宽度不超过 280px，行高 1.6，允许文字换行
- 气泡内容不得包含任何敏感信息（如完整密钥、真实手机号）

### 6.4 导航与选中态视觉规范 (Clear Active States)

> **核心原则**：在任何涉及模块切换的场景（如 Tab 标签页、分段控制器 Segmented Control、左侧菜单等），处于激活（Active）状态的项必须具备极强的视觉显著性。严禁仅通过微弱的颜色变化来区分。

#### 激活态必须满足的组合条件

必须同时采取以下**至少两种**组合手段来强化当前状态：

| 手段 | 实现方式 | 示例 |
|------|----------|------|
| **字体加粗** | `font-weight: 600` 或 `bold` | 当前页菜单项文字加粗 |
| **底部高亮下划线** | `border-bottom: 2px solid var(--el-color-primary)` | 激活 Tab 底部出现品牌色线条 |
| **强对比背景色** | `background` 配合 `border-radius` 形成色块 | 胶囊按钮激活态使用填充色 |
| **投影/阴影** | `box-shadow` 制造立体感 | 卡片式导航激活态带投影 |

#### 达标示例

```scss
// ✅ 达标：同时使用了 加粗 + 底部高亮
.menu-item.active {
  font-weight: 600;
  color: var(--el-color-primary);
  border-bottom: 2px solid var(--el-color-primary);
}

// ✅ 达标：同时使用了 强对比背景 + 投影
.tab-button.active {
  background: var(--el-color-primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}
```

#### 严禁做法

| ❌ 错误做法 | 问题 |
|-------------|------|
| 仅用 `#999` vs `#333` 灰色区分 | 色差太小，0.1 秒内无法识别 |
| 仅用下划线 1px | 线条过细，视觉显著性不足 |
| 仅改变文字颜色 | 缺少结构线索，不够直觉 |
| 激活与非激活态无任何差异 | 用户完全无法判断当前位置 |

#### 响应式要求

- 在移动端（sm 及以下），由于屏幕空间有限，**更应该依赖**背景色填充 + 白色文字的高对比组合
- 底部标签栏（TabBar）激活态建议同时使用：图标填充色变化 + 文字加粗 + 顶部高亮线

#### 背景色差过小的实体层级约束（胶囊/分段控制器场景）

> **特别警告**：当使用背景色块（如胶囊按钮、分段控制器 Segmented Control）来区分 Tab 状态时，严禁使用对比度极低的方案（如纯白背景 `#fff` 与浅灰背景 `#f5f5f5` 的平面对比）。这种做法在同一颜色体系内无法形成视觉高度差，等同于"无设计"。

**必须采用实体物理层级设计（Floating Card Pattern）**：

| 层级 | 样式属性 | 说明 |
|------|----------|------|
| **外层灰槽容器** | `background-color: #f0f2f5; padding: 4px; border-radius: 6px;` | 充当"底座"，形成物理凹陷感 |
| **非激活态按钮** | `background: transparent; color: #666;` | 透明背景，融入灰槽，不抢占视觉 |
| **激活态按钮 (Active)** | `background: #fff; color: var(--el-color-primary); box-shadow: 0 2px 6px rgba(0,0,0,0.12); border-radius: 4px;` | 白色背景 + 投影制造"浮起"高度感，字号加粗 `font-weight: 600` |

**达标代码示例**：

```scss
// ✅ 外层灰槽容器
.segmented-control {
  background-color: #f0f2f5;
  padding: 4px;
  border-radius: 8px;
  display: inline-flex;
  gap: 4px;
}

// ✅ 激活态：白底 + 投影浮起 + 品牌色文字
.segmented-control .segment-btn.active {
  background: #fff;
  color: var(--el-color-primary);
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

// ✅ 非激活态：透明底 + 暗灰字
.segmented-control .segment-btn {
  background: transparent;
  color: #666;
  font-weight: 400;
  border-radius: 4px;
  padding: 6px 16px;
}
```

**设计原理**：通过投影（Box Shadow）在扁平背景上制造出"卡片悬浮"的高度差，激活态看起来像一张放在灰槽上的白色纸片，与周围的灰底形成3层物理层级对比。这种方案远胜于单纯依赖颜色色值差异。

**严禁做法对照**：

| ❌ 错误方案 | 为何错误 |
|-------------|----------|
| `#fff` vs `#f8f8f8` 背景对比 | 差异过小（仅 0.3% 色差），肉眼几乎无法区分 |
| `#409eff` 浅蓝 vs `#53a8ff` 深蓝 | 同色系递进，在小尺寸胶囊按钮上无法形成激活态标识 |
| 纯白激活态无投影 | 缺少高度信号，仅依赖颜色区分，物理层级感为零 |

### 6.5 高危操作与主题防撞规范 (Destructive Actions & Theme Collision)

> **背景**：SaaS 系统允许客户自定义全局主题色（如客户可能将主色调设置为红色或橙色），此时若"危险/删除"的语义色（Danger Color）与之混淆，将导致误操作风险。

#### 多维语义与二次拦截策略

> **背景**：考虑到客户自定义主题色可能与系统的危险色（Danger Red）发生视觉混淆，所有列表/表格中的高危操作（删除、清空、注销）必须遵循以下双层防护规范。

**策略核心：颜色 + 图标 + 气泡拦截，三者缺一不可**

| 防护层级 | 实现要求 | 说明 |
|-----------|----------|------|
| **第一层：图标防撞** | 必须使用 `type="danger" link`，并在文字前附带危险语义图标 `<el-icon><Delete /></el-icon>` | 通过图形（垃圾桶）打破纯文字带来的颜色混淆 |
| **第二层：中心化弹窗拦截** | 必须使用 `ElMessageBox.confirm()` 独立遮罩弹窗，`confirm-button-type="danger"` | 遮罩层提供充足展示空间和严肃的视觉聚焦，避免表格边缘挤压变形 |

**弹窗文案黄金公式**：警告信息必须严格遵循以下结构：

> **动作 + 对象类型 + 具体名称 + ？ + 严重后果**

- ✅ 正确示范：`确认要删除模型「qwen:14b」吗？删除后数据将无法恢复。`
- ✅ 正确示范：`确认要删除话术「企业版定价」吗？删除后将无法恢复。`
- ❌ 错误示范：`确定要删除该项吗？删除后无法恢复。`（使用模糊代词"该项"，用户无法确认目标）
- ❌ 错误示范：`您确定要执行删除操作吗？此操作不可逆，请三思而后行。`（过于啰嗦，缺乏具体对象名称）

**代码实现要求**：必须使用模板字符串（Template Literals）动态代入具体名称，严禁写死模糊文案。

**视觉强化标准**：弹窗警告文案中的「具体对象名称」必须在视觉上做强对比处理（加粗加黑），以增强用户的警觉性：

- 必须开启 `dangerouslyUseHTMLString: true` 属性
- 具体对象名称使用 `<strong>` 标签包裹，形成视觉焦点
- 严重后果可使用 `<br/>` 换行，增强压迫感

```js
await ElMessageBox.confirm(
  `确认要删除模型 <strong>「${modelName}」</strong> 吗？<br/>删除后配置将无法恢复。`,
  '危险操作确认',
  {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    confirmButtonType: 'danger',
    type: 'warning',
    dangerouslyUseHTMLString: true,  // 必须开启以支持 <strong> 和 <br/>
    closeOnClickModal: false
  }
)
```

**达标代码示例**：

```vue
<!-- ✅ 多维语义：type="danger" + Delete 图标 + ElMessageBox.confirm 中心化弹窗拦截 -->
<el-button link type="danger" size="small" @click="handleDelete(row)">
  <el-icon><Delete /></el-icon>
  删除
</el-button>
```

```js
// ✅ 在对应事件处理函数中调用 ElMessageBox.confirm
import { ElMessageBox } from 'element-plus'

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认要删除客服「${row.name}」吗？删除后数据将无法恢复。`,
      '危险操作确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        confirmButtonType: 'danger',
        type: 'warning',
        closeOnClickModal: false
      }
    )
    // 通过确认后执行删除 API
    await deleteApi(row.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消，不做任何操作
  }
}
```

```vue
<!-- ✅ 多维语义：清空操作同样适用 -->
<el-button link type="danger" size="small" @click="handleClearAll">
  <el-icon><Delete /></el-icon>
  清空
</el-button>
```

#### 主题防撞色值规范

| 场景 | 推荐做法 |
|------|----------|
| 自定义主题为暖色系（红/橙） | 危险操作图标 + `type="danger"` + `ElMessageBox.confirm()` 三重组合，通过图形和结构区分，不依赖单一颜色 |
| 深色背景模板 | Danger Color 需配合高对比度白色文字 + 红色图标，确保在深色背景下依然可辨 |
| 主色即为红色（如双11营销主题） | 仍然必须使用 `type="danger" + Delete 图标 + ElMessageBox.confirm()`，图形化语义是防撞的核心手段 |

#### 绝对禁令

| ❌ 严禁做法 | 后果 |
|-------------|------|
| 仅使用纯文字 `type="danger" link` 无图标 | 在红色主题下与主色混为一体，用户无法快速识别 |
| 高危操作直接触发 API 而不经过任何确认拦截 | 点击即执行，零摩擦，误操作风险极高 |
| 使用 `el-popconfirm` 在表格最右侧触发删除确认 | 气泡弹出方向不受控，易被屏幕边缘切割，且与周边操作按钮产生布局干扰 |
| ElMessageBox 确认按钮使用 `type="primary"` 而非 `type="danger"` | 失去最后一道拦截线的语义，用户可能误判为普通操作 |
