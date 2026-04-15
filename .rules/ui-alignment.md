# UI 对齐规范 (UI Alignment Rules)

作为前端开发 Agent，在生成或修改任何 Vue/Element Plus 代码时，必须严格遵守以下对齐规范：

## 1. 全局字号基准

- 基础字号必须为 14px（正文、表格数据、表单输入框等）
- 仅 Tag 标签和极其次要的辅助提示词允许使用 12px

## 2. 表格列对齐规范 (Table Alignment Rules)

- **数据/文本列**（如名称、账号、邮箱等长文本），必须左对齐（默认或设置 `align="left"`）
- **状态/交互列**（如标签 Tag、单选/开关、以及所有"操作"列），必须强制居中对齐（设置 `align="center"`）
- **货币/统计数字列**，必须右对齐（设置 `align="right"`）

## 3. 居中对齐的复合组件

- 凡是居中对齐的列内部存在 flex 布局时，必须配合 `justify-content: center;` 确保复合组件整体居中

## 4. 高危操作视觉规范

- 所有语义为"删除、移除、注销、废弃"的操作按钮，必须强制且唯一地使用 `<el-button type="danger" link>`
- 严禁在局部 `<style>` 中私自覆盖高危按钮的颜色或大小

## 5. 表格操作列按钮规范

- 严禁在 `<el-button link>` 或 `<el-button text>` 上添加 `size="small"` 或 `size="mini"` 属性
- 必须保持组件的默认尺寸，确保其与表格正文的 14px 完美对齐