# 演示体验规范（Demo Experience）

> 本规范定义了 SaaS Admin Workbench 在演示环境下的交互标准，旨在确保演示流程的专业性、稳定性和用户感知质量。

---

## 一、演示账号校验豁免

### 1.1 白名单账号

以下账号为系统内置演示账号，在登录校验时享有豁免权：

| 账号 | 角色 | 密码 | 校验豁免项 |
|------|------|------|-----------|
| `admin` | 超级管理员 | `admin123` | 账号格式正则、密码强度正则 |
| `agent001` | 客服 | `123456` | 账号格式正则、密码强度正则 |

### 1.2 豁免实现规范

```javascript
// ✅ 正确实现：使用常量数组 + includes 判断
const DEMO_ACCOUNTS = ['admin', 'agent001']
const isDemoAccount = (account) => DEMO_ACCOUNTS.includes(account)

// ❌ 错误实现：使用 any 类型或硬编码字符串比较
// const isDemo = (account) => account === 'admin'  // 不可扩展
```

### 1.3 校验豁免原则

- **仅豁免格式校验**：账号格式（邮箱/手机号）和密码强度（8位+字母+数字）可被豁免
- **不豁免必填校验**：`required: true` 的非空校验不可豁免
- **不豁免一致性校验**：两次密码输入一致性、验证码长度等业务一致性校验不可豁免

---

## 二、强制交互延迟

### 2.1 登录跳转延迟

所有登录成功操作（包括演示账号登录）必须经过以下感知延迟链：

```
用户点击登录 → 1.5s Loading → ElMessage.success() → 1.2s 过渡延迟 → 跳转业务页
```

### 2.2 延迟常量定义

```javascript
// 必须使用命名常量，禁止硬编码数字
const DEMO_DELAY = 1200  // 单位：ms
const LOADING_DELAY = 1500

// ✅ 正确使用
await new Promise(resolve => setTimeout(resolve, DEMO_DELAY))
router.push('/chat')

// ❌ 错误使用
setTimeout(() => { router.push('/chat') }, 1500)  // 语义不清晰
```

### 2.3 延迟目的

- 让用户感知"系统正在处理"的真实时长
- 避免快速跳转给用户带来"页面卡了一下"的负面感知
- 为 ElMessage.success() 留足展示时间

---

## 三、错误兜底策略

### 3.1 async/await 错误处理

所有异步操作必须使用 try-catch-finally 包裹：

```javascript
// ✅ 正确实现
const executeLogin = async () => {
  loading.value = true
  try {
    await someAsyncOperation()
    ElMessage.success('操作成功')
  } catch (error) {
    ElMessage.error(error.message || '系统异常，请稍后重试')
  } finally {
    loading.value = false  // 必须解锁 UI 状态
  }
}

// ❌ 错误实现：无 catch，Promise 拒绝会导致页面卡死
const executeLogin = async () => {
  loading.value = true
  await someAsyncOperation()  // 如果这里报错，loading 永远无法释放
  loading.value = false
}
```

### 3.2 兜底消息规范

错误消息必须为用户可理解的自然语言：

```javascript
// ✅ 正确
ElMessage.error('网络异常，请检查网络连接后重试')

// ❌ 错误
ElMessage.error('Network request failed')
ElMessage.error(error)  // 暴露原始错误对象
```

### 3.3 状态锁死防御

所有 `loading` / `disabled` / `isSaving` 等 UI 锁状态，必须在 `finally` 块中解锁：

```javascript
try {
  isSubmitDisabled.value = true
  // 异步操作...
} catch (error) {
  ElMessage.error('操作失败')
} finally {
  isSubmitDisabled.value = false  // 无论成功或失败必须解锁
}
```

---

## 四、UI 极简原则

### 4.1 图标使用规范

- **禁止在业务主流程按钮中使用 Emoji 图标**
- 演示快捷按钮仅允许使用纯文字标签
- 图标使用场景仅限于：非核心入口、装饰性元素、品牌标识

```html
<!-- ✅ 正确：纯文字按钮 -->
<el-button>管理员模式</el-button>

<!-- ❌ 错误：Emoji 图标 -->
<el-button>👑 管理员模式</el-button>
```

### 4.2 CSS 变量优先

所有样式中的尺寸、颜色、间距必须优先使用 CSS 变量，并附 fallback 值：

```css
/* ✅ 正确 */
height: var(--btn-height-lg, 40px);
gap: var(--spacing-sm, 12px);
background: var(--color-primary, #409eff);

/* ❌ 错误：硬编码值 */
height: 40px;
gap: 12px;
background: #409eff;
```

### 4.3 交互反馈原则

- 所有可点击元素必须配备 hover / active / disabled 状态
- Loading 状态必须同时配合 disabled，防止重复提交
- 表单重置必须调用 `resetFields()`，禁止仅清空 v-model

---

## 五、代码规范检查清单

在提交代码前，必须确认以下条目：

- [ ] `DEMO_ACCOUNTS` 常量已定义，不可使用 `any` 类型
- [ ] `DEMO_DELAY` 已定义，所有跳转延迟使用该常量
- [ ] 所有 `async` 函数均有 `try-catch-finally` 包裹
- [ ] 所有 `loading` / `disabled` 状态在 `finally` 中解锁
- [ ] 快捷按钮无 Emoji 图标
- [ ] 样式使用 CSS 变量 + fallback
- [ ] 错误消息为用户可理解的中文自然语言
