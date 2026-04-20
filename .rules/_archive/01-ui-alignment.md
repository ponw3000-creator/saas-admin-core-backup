# 表单与图标交互协议
1. **标签物理锁死**：所有 `el-form-item__label` 必须强制使用 `display: inline-flex; align-items: center;`，严禁使用 Baseline 对齐。
2. **防折行底线**：包含帮助图标 (`ProHelp`) 的标签必须附加 `white-space: nowrap` 与 `flex-shrink: 0`，宁可容器溢出也绝不允许图标单独折行。
3. **统一调用**：任何字段解释必须使用 `<ProHelp content="..." />` 原子组件，严禁手写 `el-tooltip`。

## 表单宏观排版规范 (Form Layout)
1. **严禁参差不齐**：所有包含多个输入项的 `<el-form>`，在桌面端（`sm` 及以上断点）必须显式设定 `label-position="right"` 和统一的 `label-width`（如 `100px` 或 `120px`），确保所有输入框的左侧边缘形成一条绝对垂直的基准线。
2. **标签宽度自适应禁区**：严禁在标准表单中使用 `label-width="auto"`，除非是在极其狭窄的特殊面板中。
3. **响应式表单折叠**：在移动端断点（`xs`），必须强制覆盖为 `label-position="top"`，让标签与输入框上下堆叠排列。