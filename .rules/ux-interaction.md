# 全局交互与防呆体验规范 (UX & Interaction Rules)

在构建任何表单、输入框或文本提示组件时，必须严格遵守以下体验约束：

## 2.1 长文本气泡阅读法则 (Tooltip Max-Width)

- 任何超过 15 个字符的长文本提示（如 `<el-tooltip>` 的 content），禁止"一字长蛇阵"
- 必须统一加上 `popper-class="pro-tooltip"`（底层依赖 `pro-design.scss` 中定义的最大宽度 280px、允许换行、增大行高 `line-height: 1.6` 的全局样式）

## 2.2 数字输入防呆机制 (Number Input Idiot-proofing)

- 凡是涉及业务阈值的数字输入框（如 `<el-input-number>`），必须配置 `:min` 和 `:max`
- **绝对禁止手动输入穿透**：除了组件自带的 max/min 属性外，必须在 `<script setup>` 的 `rules` 表单校验中，追加兜底的强规则（如 `{ type: 'number', min: 1, max: 20, message: '超出限制' }`），彻底堵死键盘越界输入

## 2.3 复杂账号混合校验 (Hybrid Account Validation)

- 凡是遇到"登录账号"、"联系方式"等允许混填的字段（如手机号/邮箱二选一），禁止使用简单的单条正则表达式
- 必须在底层抽离出独立的 `validator` 校验函数，同时兼容手机号（`/^1[3-9]\d{9}$/`）和标准邮箱正则，并在校验失败时给出精确的红字报错引导

## 2.4 业务语言化法则 (Business Language Translation)

- 前端展示文案（Label）严禁暴露纯技术名词（如"最大并发"、"字段上限"）
- 必须转化为 C 端直觉文案（如"接待上限"、"同时处理人数"），并在右侧附带小问号图标（Tooltip）做具体机制的解释