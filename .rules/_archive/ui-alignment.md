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

## 6. 全局主题色约束 (Theme Color)

### 单一色彩来源

系统中任何涉及到品牌主色调切换、默认色板的地方，**严禁**在 Vue 组件内自行写死 Hex 色值。必须统一从 `src/config/theme.js` 的 `THEME_COLORS` 中读取。

```js
import { THEME_COLORS } from '@/config/theme'

<el-color-picker :predefine="THEME_COLORS" />
```

### 色阶生成原则

- **严禁**手动计算浅色背景或悬浮色，必须依赖 `src/utils/theme.js` 中的色彩算法引擎自动生成 Element Plus 所需的 9 级 Light 变量
- 主题色切换函数 `setGlobalThemeColor()` 会自动注入以下 CSS 变量：
  - `--el-color-primary`：主色
  - `--el-color-primary-light-1~9`：1-9 级浅色阶（与白色混合生成）
  - `--el-color-primary-dark-2`：深色阶（与黑色混合生成）

### 配置导出规范

所有预设色值统一在 `src/config/theme.js` 中定义并导出：
```js
export const THEME_COLORS = [
  '#4F46E5', // 科技蓝（默认）
  '#059669', // 翡翠绿
  '#EA580C', // 活力橙
  '#E11D48', // 玫瑰红
  '#0284C7', // 海洋蓝
  '#475569'  // 极客灰
]
```

## 7. 帮助气泡规范 (Help Tooltip Rules)

### 底层实现规矩

- **禁止在 Tooltip 中使用内联样式**。所有帮助图标必须统一使用 `.help-icon` 类，严禁随意调整图标位置
- 气泡内容如超过 15 字，必须确保全局样式已支持自动换行（`word-break: break-word; white-space: normal;`）
- Tooltip 统一采用 `effect="dark"`，`placement="top"`

### ProHelp 原子组件规范

**凡是涉及字段解释的帮助图标，必须且只能使用 ProHelp 组件，严禁自行组装 el-tooltip + QuestionFilled 结构。**

#### ProHelp 组件使用方式

```vue
<template #label>
  字段名称
  <ProHelp content="这是气泡帮助文案。" />
</template>

// 高危配置（红色图标）
<ProHelp content="【高危配置】警告信息。" :danger="true" />
```

#### Props 接口

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| content | String | required | 气泡显示的帮助文案 |
| danger | Boolean | false | 是否为高危配置（图标变红） |

### 全局防御样式

```scss
// src/styles/global.scss
.help-icon {
  vertical-align: -0.125em;
  margin-left: 4px;
}

.pro-help-popper {
  max-width: 260px !important;
  line-height: 1.5 !important;
  word-break: break-word;
  white-space: normal;
  text-align: center;
}
```

### 组件注册

```js
// main.js
import ProHelp from '@/components/ProHelp/index.vue'
app.component('ProHelp', ProHelp)
```

### 布局协议（Flex 物理对齐）

**严禁在业务页面手动调整帮助图标位置。所有对齐必须依赖 ProHelp 组件与全局 Flex 协议。如有偏移，应修正底层 CSS 协议而非局部补丁。**

#### 全局 CSS 协议（src/styles/global.scss）

```scss
/* 协议：强制表单标签进入弹性居中模式 */
.el-form-item {
  .el-form-item__label {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: flex-start;
    line-height: normal !important;
    white-space: nowrap !important;

    span {
      display: inline-flex;
      align-items: center;
    }
  }
}

/* 协议：原子组件触发器标准 */
.pro-help-trigger {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  flex-shrink: 0;
  height: 1em;
}
```

#### 业务组件标准结构

```vue
<el-form-item>
  <template #label>
    <span>字段名称<ProHelp content="帮助文案" /></span>
  </template>
</el-form-item>
```

#### 错误案例（禁止）

```vue
<!-- ❌ 禁止：手动添加 vertical-align / transform 微调 -->
<el-icon class="help-icon" style="vertical-align: -2px;">...</el-icon>

<!-- ❌ 禁止：在业务组件中覆盖 icon 样式 -->
<style scoped>
  .help-icon { transform: translateY(1px); }
</style>

<!-- ❌ 禁止：使用内联 style 强行对齐 -->
<span style="display: inline-flex; align-items: center;">
  文字<ProHelp />
</span>
```

### 旧规范（已废弃）

以下写法**禁止使用**，历史代码需逐步迁移：

```vue
<!-- ❌ 禁止：手写 el-tooltip 结构 -->
<el-tooltip content="帮助文案" placement="top" effect="dark">
  <el-icon class="help-icon"><QuestionFilled /></el-icon>
</el-tooltip>

<!-- ✅ 推荐：使用 ProHelp 组件 -->
<ProHelp content="帮助文案" />
```