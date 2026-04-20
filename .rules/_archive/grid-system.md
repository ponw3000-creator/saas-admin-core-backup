# 栅格系统规范 (Grid System Rules)

## 1. 基础栅格配置

- 使用 Element Plus 的 `el-row` 和 `el-col` 组件
- 默认 gutter 间距：24px（表单场景）或 20px（紧凑列表场景）
- 响应式断点：xs(<768px), sm(768px-992px), md(992px-1200px), lg(>1200px)

## 2. 表单栅格规范

- 表单项标签宽度：label-width="100px"
- 标签位置：label-position="top"（推荐，用于长标签）
- 两列布局：el-col :span="12"
- 栅格间距：:gutter="24"

## 3. 卡片内栅格

- 卡片内使用 `el-row` 时，gutter 通过 CSS margin 负值实现
- 确保子元素间距统一，避免内容贴边

## 4. 栅格与间距配合

- flex 布局用于单行内元素对齐（justify-content, align-items）
- 栅格布局用于多行列式布局（el-row + el-col）