<script setup>
import { reactive, ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ProHelp from '@/components/ProHelp/index.vue'

const router = useRouter()

const loading = ref(false)
const countdown = ref(0)
let countdownTimer = null

const formData = reactive({
  enterpriseCode: '',
  companyName: '',
  account: '',
  password: '',
  confirmPassword: '',
  verifyCode: '',
  rememberMe: false,
  agreeProtocol: false
})

const honeypot = ref('')
const verifyCodeLoading = ref(false)
const loginFormRef = ref(null)

const isLoginMode = ref(true)
const isResetMode = ref(false)

const resetFormData = reactive({
  enterpriseCode: '',
  account: '',
  verifyCode: '',
  newPassword: '',
  confirmPassword: ''
})

const resetVerifyCodeLoading = ref(false)
const resetCountdown = ref(0)
let resetCountdownTimer = null

const phoneRule = /^1[3-9]\d{9}$/
const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRule = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/

const validateAccount = (value) => {
  if (!value) return false
  return phoneRule.test(value) || emailRule.test(value)
}

const companyNameValidating = ref(false)

const validateCompanyName = async (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入企业名称'))
  }
  companyNameValidating.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  companyNameValidating.value = false
  const reservedNames = ['苹果公司', 'Apple']
  if (reservedNames.includes(value)) {
    return callback(new Error('该企业已开通工作台，请直接切换至登录页面'))
  }
  callback()
}

const validateAccountRule = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入登录账号'))
  }
  if (!validateAccount(value)) {
    return callback(new Error('账号必须为邮箱或手机号格式'))
  }
  callback()
}

const validatePasswordRule = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入密码'))
  }
  if (!validatePassword(value)) {
    return callback(new Error('密码至少8位，包含字母和数字'))
  }
  callback()
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请确认密码'))
  }
  if (value !== formData.password) {
    return callback(new Error('两次输入的密码不一致'))
  }
  callback()
}

const validateVerifyCode = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入验证码'))
  }
  if (value.length !== 6) {
    return callback(new Error('验证码必须为6位数字'))
  }
  callback()
}

const loginRules = {
  enterpriseCode: [
    { required: true, message: '请输入企业代码', trigger: ['blur', 'change'] }
  ],
  account: [
    { required: true, validator: validateAccountRule, trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, validator: validatePasswordRule, trigger: ['blur', 'change'] }
  ]
}

const registerRules = {
  companyName: [
    { required: true, message: '请输入企业名称', trigger: 'blur' },
    { validator: validateCompanyName, trigger: 'blur' }
  ],
  account: [
    { required: true, validator: validateAccountRule, trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, validator: validatePasswordRule, trigger: ['blur', 'change'] }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: ['blur', 'change'] }
  ],
  verifyCode: [
    { required: true, validator: validateVerifyCode, trigger: ['blur', 'change'] }
  ]
}

const getCurrentRules = computed(() => {
  return isLoginMode.value ? loginRules : registerRules
})

const validateResetConfirmPassword = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请确认新密码'))
  }
  if (value !== resetFormData.newPassword) {
    return callback(new Error('两次输入的密码不一致'))
  }
  callback()
}

const resetFormRules = {
  enterpriseCode: [
    { required: true, message: '请输入企业代码', trigger: ['blur', 'change'] }
  ],
  account: [
    { required: true, validator: validateAccountRule, trigger: ['blur', 'change'] }
  ],
  verifyCode: [
    { required: true, validator: validateVerifyCode, trigger: ['blur', 'change'] }
  ],
  newPassword: [
    { required: true, validator: validatePasswordRule, trigger: ['blur', 'change'] }
  ],
  confirmPassword: [
    { required: true, validator: validateResetConfirmPassword, trigger: ['blur', 'change'] }
  ]
}

const formRules = reactive({
  companyName: [
    { required: true, message: '请输入企业名称', trigger: 'blur' },
    { validator: validateCompanyName, trigger: 'blur' }
  ]
})

const passwordStrength = computed(() => {
  const pwd = formData.password
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++

  const levels = [
    { score: 0, label: '', color: '' },
    { score: 1, label: '弱', color: '#f56c6c' },
    { score: 2, label: '较弱', color: '#e6a23c' },
    { score: 3, label: '中等', color: '#409eff' },
    { score: 4, label: '强', color: '#67c23a' },
    { score: 5, label: '很强', color: '#67c23a' }
  ]
  return levels[Math.min(score, 5)]
})

const validateEmail = (value) => {
  if (!value) return false
  return emailRule.test(value)
}

const validatePassword = (value) => {
  if (!value) return false
  return passwordRule.test(value)
}

const isFormValid = computed(() => {
  if (!formData.agreeProtocol) return false
  if (!formData.enterpriseCode || !formData.account || !formData.password) return false
  if (!validateAccount(formData.account)) return false
  if (!validatePassword(formData.password)) return false
  if (!isLoginMode.value) {
    if (!formData.companyName) return false
    if (!formData.confirmPassword || formData.password !== formData.confirmPassword) return false
    if (!formData.verifyCode || formData.verifyCode.length !== 6) return false
  }
  return true
})

const isSubmitDisabled = computed(() => {
  if (loading.value) return true
  if (!formData.agreeProtocol) return true
  if (!formData.enterpriseCode || !formData.account || !formData.password) return true
  if (!validateAccount(formData.account)) return true
  if (!validatePassword(formData.password)) return true
  if (!isLoginMode.value) {
    if (!formData.companyName) return true
    if (!formData.confirmPassword || formData.password !== formData.confirmPassword) return true
    if (!formData.verifyCode || formData.verifyCode.length !== 6) return true
  }
  return false
})

const resetPasswordStrength = computed(() => {
  const pwd = resetFormData.newPassword
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++
  const levels = [
    { score: 0, label: '', color: '' },
    { score: 1, label: '弱', color: '#f56c6c' },
    { score: 2, label: '较弱', color: '#e6a23c' },
    { score: 3, label: '中等', color: '#409eff' },
    { score: 4, label: '强', color: '#67c23a' },
    { score: 5, label: '很强', color: '#67c23a' }
  ]
  return levels[Math.min(score, 5)]
})

const isResetFormValid = computed(() => {
  if (!resetFormData.enterpriseCode) return false
  if (!resetFormData.account) return false
  if (!validateAccount(resetFormData.account)) return false
  if (!resetFormData.verifyCode || resetFormData.verifyCode.length !== 6) return false
  if (!resetFormData.newPassword) return false
  if (!validatePassword(resetFormData.newPassword)) return false
  if (!resetFormData.confirmPassword) return false
  if (resetFormData.newPassword !== resetFormData.confirmPassword) return false
  return true
})

const isResetSubmitDisabled = computed(() => loading.value || !isResetFormValid.value)

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  isResetMode.value = false
  Object.keys(formData).forEach(key => {
    if (key !== 'rememberMe' && key !== 'agreeProtocol') {
      formData[key] = ''
    }
  })
  honeypot.value = ''
  countdown.value = 0
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  loginFormRef.value?.resetFields()
}

const toggleToResetMode = () => {
  isLoginMode.value = false
  isResetMode.value = true
  Object.keys(formData).forEach(key => {
    if (key !== 'rememberMe' && key !== 'agreeProtocol') {
      formData[key] = ''
    }
  })
  Object.keys(resetFormData).forEach(key => {
    resetFormData[key] = ''
  })
  countdown.value = 0
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  loginFormRef.value?.resetFields()
  resetFormRef.value?.resetFields()
}

const toggleToLoginMode = () => {
  isResetMode.value = false
  isLoginMode.value = true
  Object.keys(resetFormData).forEach(key => {
    resetFormData[key] = ''
  })
  loginFormRef.value?.resetFields()
  resetFormRef.value?.resetFields()
}

const handleQuickLogin = async (mode) => {
  if (loading.value) return
  isLoginMode.value = true
  isResetMode.value = false

  if (mode === 'admin') {
    formData.enterpriseCode = 'DEMO-ENTERPRISE'
    formData.account = 'admin'
    formData.password = 'admin123'
  } else {
    formData.enterpriseCode = 'DEMO-ENTERPRISE'
    formData.account = 'agent001'
    formData.password = '123456'
  }

  formData.agreeProtocol = true

  await nextTick()
  handleSubmit()
}

const handleVerifyCode = () => {
  if (countdown.value > 0 || verifyCodeLoading.value) return
  verifyCodeLoading.value = true
  setTimeout(() => {
    verifyCodeLoading.value = false
    const generatedCode = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('')
    formData.verifyCode = generatedCode
    ElMessage.success(`验证码已发送至您的邮箱：${generatedCode}`)
    countdown.value = 60
    if (countdownTimer) clearInterval(countdownTimer)
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    }, 1000)
  }, 800)
}

const handleResetVerifyCode = () => {
  if (resetCountdown.value > 0 || resetVerifyCodeLoading.value) return
  if (!resetFormData.account) {
    ElMessage.warning('请先输入登录账号')
    return
  }
  if (!validateAccount(resetFormData.account)) {
    ElMessage.error('账号必须为邮箱或手机号格式')
    return
  }
  resetVerifyCodeLoading.value = true
  setTimeout(() => {
    resetVerifyCodeLoading.value = false
    const generatedCode = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('')
    resetFormData.verifyCode = generatedCode
    ElMessage.success(`验证码已发送至您的${phoneRule.test(resetFormData.account) ? '手机' : '邮箱'}：${generatedCode}`)
    resetCountdown.value = 60
    if (resetCountdownTimer) clearInterval(resetCountdownTimer)
    resetCountdownTimer = setInterval(() => {
      resetCountdown.value--
      if (resetCountdown.value <= 0) {
        clearInterval(resetCountdownTimer)
        resetCountdownTimer = null
      }
    }, 1000)
  }, 800)
}

onMounted(() => {
  const savedAuth = localStorage.getItem('auth_data')
  if (savedAuth) {
    try {
      const authData = JSON.parse(savedAuth)
      const expiry = localStorage.getItem('auth_expiry')
      if (expiry && Date.now() < Number(expiry)) {
        formData.enterpriseCode = authData.enterpriseCode || ''
      }
    } catch {
      localStorage.removeItem('auth_data')
      localStorage.removeItem('auth_expiry')
    }
  }
})

let lastSubmitTime = 0

const handleSubmit = async () => {
  if (honeypot.value) {
    ElMessage.error('表单异常，请刷新页面重试')
    return
  }

  const now = Date.now()
  if (now - lastSubmitTime < 2000) {
    ElMessage.warning('操作过于频繁，请稍后再试')
    return
  }
  lastSubmitTime = now

  if (!formData.agreeProtocol) {
    ElMessage.warning('请先阅读并同意《服务协议》与《隐私政策》')
    return
  }

  try {
    await loginFormRef.value.validate()
  } catch {
    return
  }

  executeLogin()
}

const executeLogin = async () => {
  loading.value = true

  await new Promise(resolve => setTimeout(resolve, 1500))

  loading.value = false

  if (isLoginMode.value) {
    const token = 'mock_token_' + Date.now()
    const authData = {
      token,
      enterpriseCode: formData.enterpriseCode,
      account: formData.account,
      timestamp: Date.now()
    }

    if (formData.rememberMe) {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_data', JSON.stringify(authData))
      localStorage.setItem('auth_expiry', String(Date.now() + 7 * 24 * 60 * 60 * 1000))
    } else {
      sessionStorage.setItem('auth_token', token)
      sessionStorage.setItem('auth_data', JSON.stringify(authData))
    }

    ElMessage.success('登录成功，正在跳转...')
    setTimeout(() => {
      router.push('/chat')
    }, 1000)
    return
  }

  ElMessage.success('注册成功，正在跳转...')
  setTimeout(() => {
    router.push('/chat')
  }, 1000)
}

const handleResetSubmit = async () => {
  if (honeypot.value) {
    ElMessage.error('表单异常，请刷新页面重试')
    return
  }

  const now = Date.now()
  if (now - lastSubmitTime < 2000) {
    ElMessage.warning('操作过于频繁，请稍后再试')
    return
  }
  lastSubmitTime = now

  try {
    await resetFormRef.value.validate()
  } catch {
    return
  }

  executeReset()
}

const executeReset = async () => {
  loading.value = true

  await new Promise(resolve => setTimeout(resolve, 1500))

  loading.value = false

  ElMessage.success('密码重置成功，正在跳转登录...')
  setTimeout(() => {
    isResetMode.value = false
    isLoginMode.value = true
    formData.account = resetFormData.account
    formData.enterpriseCode = resetFormData.enterpriseCode
    Object.keys(resetFormData).forEach(key => {
      resetFormData[key] = ''
    })
  }, 800)
}
</script>

<template>
  <div class="login-page">
    <div class="login-left">
      <div class="brand-content">
        <div class="logo-wrapper">
          <svg class="brand-logo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="56" fill="url(#logoGradient)" />
            <path d="M40 70C40 70 48 78 60 78C72 78 80 70 80 70" stroke="white" stroke-width="4" stroke-linecap="round"/>
            <circle cx="45" cy="52" r="6" fill="white"/>
            <circle cx="75" cy="52" r="6" fill="white"/>
            <defs>
              <linearGradient id="logoGradient" x1="0" y1="0" x2="120" y2="120">
                <stop offset="0%" stop-color="#409EFF"/>
                <stop offset="100%" stop-color="#337ecc"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 class="brand-title">Enterprise SaaS</h1>
        <p class="brand-slogan">新一代智能客服工作台<br/>让服务更高效，让连接更简单</p>
        <div class="brand-features">
          <div class="feature-item">
            <span class="feature-icon">⚡</span>
            <span>AI 智能驱动</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔒</span>
            <span>企业级安全</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span>数据洞察</span>
          </div>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="form-container">
        <div class="form-header" v-if="!isResetMode">
          <h2 class="form-title">{{ isLoginMode ? '欢迎回来' : '开通企业工作台' }}</h2>
          <p class="form-subtitle">{{ isLoginMode ? '登录您的企业账号' : '创建您专属的智能客服体系' }}</p>
        </div>

        <el-form
          v-if="!isResetMode"
          ref="loginFormRef"
          class="login-form"
          :model="formData"
          :rules="getCurrentRules"
          :hide-required-asterisk="true"
          label-position="right"
          label-width="100px"
          @submit.prevent="handleSubmit"
        >
          <el-form-item v-if="isLoginMode" label="企业代码" prop="enterpriseCode">
            <template #label>
              <span>企业代码<ProHelp content="请输入您企业的唯一标识码" /></span>
            </template>
            <el-input
              v-model="formData.enterpriseCode"
              placeholder="请输入企业代码"
              prefix-icon="OfficeBuilding"
              size="large"
              @input="() => loginFormRef?.clearValidate('enterpriseCode')"
            />
          </el-form-item>

          <el-form-item v-if="!isLoginMode" label="企业名称" prop="companyName">
            <template #label>
              <span>企业名称<ProHelp content="请输入您企业的全称" /></span>
            </template>
            <el-input
              v-model="formData.companyName"
              placeholder="请输入企业完整名称"
              prefix-icon="OfficeBuilding"
              size="large"
              :loading="companyNameValidating"
            />
            <span v-if="!isLoginMode && formData.companyName && !['苹果公司', 'Apple'].includes(formData.companyName)" class="form-tip">将作为您企业的展示名称，用于客户端界面显示</span>
          </el-form-item>

          <el-form-item label="登录账号" prop="account">
            <template #label>
              <span>登录账号<ProHelp content="支持工作邮箱或手机号" /></span>
            </template>
            <el-input
              v-model="formData.account"
              placeholder="请输入工作邮箱或手机号"
              prefix-icon="Message"
              size="large"
              @input="() => loginFormRef?.clearValidate('account')"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <template #label>
              <span>密码<ProHelp content="至少8位，包含字母和数字" /></span>
            </template>
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              show-password
              @input="() => loginFormRef?.clearValidate('password')"
            />
            <div v-if="formData.password && !isLoginMode" class="password-strength">
              <div class="strength-bar">
                <div
                  class="strength-fill"
                  :style="{
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: passwordStrength.color
                  }"
                ></div>
              </div>
              <span class="strength-label" :style="{ color: passwordStrength.color }">
                {{ passwordStrength.label }}
              </span>
            </div>
          </el-form-item>

          <el-form-item v-if="!isLoginMode" label="确认密码" prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              prefix-icon="Lock"
              size="large"
              show-password
              @input="() => loginFormRef?.clearValidate('confirmPassword')"
            />
          </el-form-item>

          <el-form-item v-if="!isLoginMode" label="验证码" prop="verifyCode">
            <div class="verify-code-row">
              <el-input
                v-model="formData.verifyCode"
                placeholder="请输入6位验证码"
                size="large"
                maxlength="6"
                style="flex: 1"
                @input="() => loginFormRef?.clearValidate('verifyCode')"
              />
              <el-button
                type="primary"
                plain
                size="large"
                :loading="verifyCodeLoading"
                :disabled="countdown > 0"
                @click="handleVerifyCode"
              >
                {{ countdown > 0 ? `${countdown}s后重发` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <div class="honeypot-field">
            <input v-model="honeypot" tabindex="-1" autocomplete="off" />
          </div>

          <el-form-item v-if="isLoginMode && !isResetMode" class="remember-row">
            <el-checkbox v-model="formData.rememberMe">保持登录状态</el-checkbox>
            <a class="forgot-link" @click="toggleToResetMode">忘记密码？</a>
          </el-form-item>

          <el-form-item v-if="!isResetMode" class="protocol-row">
            <el-checkbox v-model="formData.agreeProtocol">
              我已阅读并同意
              <a class="protocol-link" href="javascript:void(0)">《服务协议》</a>
              与
              <a class="protocol-link" href="javascript:void(0)">《隐私政策》</a>
            </el-checkbox>
          </el-form-item>

          <el-form-item v-if="!isResetMode" class="submit-row">
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              :disabled="isSubmitDisabled"
              class="submit-btn"
              @click="handleSubmit"
            >
              {{ isLoginMode ? '登 录' : '创建企业账号' }}
            </el-button>
          </el-form-item>

          <div v-if="!isResetMode && isLoginMode" class="quick-login-section">
            <div class="quick-login-divider">
              <span class="divider-line"></span>
              <span class="divider-text">快捷体验</span>
              <span class="divider-line"></span>
            </div>
            <div class="quick-login-buttons">
              <el-button
                class="quick-login-btn admin-btn"
                size="large"
                :disabled="loading"
                @click="handleQuickLogin('admin')"
              >
                <span class="btn-icon">👑</span>
                <span class="btn-label">管理员模式</span>
              </el-button>
              <el-button
                class="quick-login-btn agent-btn"
                size="large"
                :disabled="loading"
                @click="handleQuickLogin('agent')"
              >
                <span class="btn-icon">💬</span>
                <span class="btn-label">客服模式</span>
              </el-button>
            </div>
          </div>
        </el-form>

        <div v-if="isResetMode" class="reset-form">
          <div class="reset-header">
            <h3 class="reset-title">重置密码</h3>
            <p class="reset-subtitle">通过企业代码+账号验证身份后重置密码</p>
          </div>

          <el-form
            ref="resetFormRef"
            class="login-form"
            :model="resetFormData"
            :rules="resetFormRules"
            :hide-required-asterisk="true"
            label-position="right"
            label-width="100px"
            @submit.prevent="handleResetSubmit"
          >
            <el-form-item label="企业代码" prop="enterpriseCode">
              <template #label>
                <span>企业代码<ProHelp content="请输入您企业的唯一标识码" /></span>
              </template>
              <el-input
                v-model="resetFormData.enterpriseCode"
                placeholder="请输入企业代码"
                prefix-icon="OfficeBuilding"
                size="large"
                @input="() => resetFormRef?.clearValidate('enterpriseCode')"
              />
            </el-form-item>

            <el-form-item label="登录账号" prop="account">
              <template #label>
                <span>登录账号<ProHelp content="请输入绑定的邮箱或手机号" /></span>
              </template>
              <el-input
                v-model="resetFormData.account"
                placeholder="请输入工作邮箱或手机号"
                prefix-icon="Message"
                size="large"
                @input="() => resetFormRef?.clearValidate('account')"
              />
            </el-form-item>

            <el-form-item label="验证码" prop="verifyCode">
              <div class="verify-code-row">
                <el-input
                  v-model="resetFormData.verifyCode"
                  placeholder="请输入6位验证码"
                  size="large"
                  maxlength="6"
                  style="flex: 1"
                  @input="() => resetFormRef?.clearValidate('verifyCode')"
                />
                <el-button
                  type="primary"
                  plain
                  size="large"
                  :loading="resetVerifyCodeLoading"
                  :disabled="resetCountdown > 0"
                  @click="handleResetVerifyCode"
                >
                  {{ resetCountdown > 0 ? `${resetCountdown}s后重发` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <template #label>
                <span>新密码<ProHelp content="至少8位，包含字母和数字" /></span>
              </template>
              <el-input
                v-model="resetFormData.newPassword"
                type="password"
                placeholder="请输入新密码"
                prefix-icon="Lock"
                size="large"
                show-password
                @input="() => resetFormRef?.clearValidate('newPassword')"
              />
              <div v-if="resetFormData.newPassword" class="password-strength">
                <div class="strength-bar">
                  <div
                    class="strength-fill"
                    :style="{
                      width: `${(resetPasswordStrength.score / 5) * 100}%`,
                      backgroundColor: resetPasswordStrength.color
                    }"
                  ></div>
                </div>
                <span class="strength-label" :style="{ color: resetPasswordStrength.color }">
                  {{ resetPasswordStrength.label }}
                </span>
              </div>
            </el-form-item>

            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="resetFormData.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                prefix-icon="Lock"
                size="large"
                show-password
                @input="() => resetFormRef?.clearValidate('confirmPassword')"
              />
            </el-form-item>

            <el-form-item class="submit-row">
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                :disabled="isResetSubmitDisabled"
                class="submit-btn"
                @click="handleResetSubmit"
              >
                重置并登录
              </el-button>
            </el-form-item>

            <div class="reset-footer">
              <span class="reset-hint">记起密码了？</span>
              <a class="reset-back-link" @click="toggleToLoginMode">返回登录</a>
            </div>
          </el-form>
        </div>

        <div v-if="!isResetMode" class="form-footer">
          <span class="toggle-text">
            {{ isLoginMode ? '还没有账号？' : '已有账号？' }}
          </span>
          <a class="toggle-link" @click="toggleMode">
            {{ isLoginMode ? '立即注册' : '立即登录' }}
          </a>
        </div>
      </div>
    </div>


  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background: #fff;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #1e222d 0%, #2a303c 50%, #1a1f28 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.15) 0%, transparent 70%);
  top: -200px;
  left: -200px;
}

.login-left::after {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.1) 0%, transparent 70%);
  bottom: -100px;
  right: -100px;
}

.brand-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px;
}

.logo-wrapper {
  margin-bottom: 32px;
}

.brand-logo {
  width: 100px;
  height: 100px;
  filter: drop-shadow(0 8px 24px rgba(64, 158, 255, 0.4));
}

.brand-title {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 16px;
  letter-spacing: 2px;
}

.brand-slogan {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 48px;
  line-height: 1.8;
}

.brand-features {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
}

.feature-icon {
  font-size: 20px;
}

.login-right {
  width: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  background: #fff;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-header {
  margin-bottom: 40px;
  text-align: center;
}

.form-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
}

.form-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-form-item__label) {
  display: inline-flex !important;
  align-items: center !important;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  flex-shrink: 0;
}

.login-form :deep(.el-form-item__label span) {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.input-error :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset;
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.5;
  display: block;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-label {
  font-size: 12px;
  font-weight: 500;
  min-width: 40px;
}

.verify-code-row {
  display: flex;
  gap: 12px;
}

.honeypot-field {
  position: absolute;
  left: -9999px;
  opacity: 0;
  pointer-events: none;
}

.honeypot-field input {
  width: 1px;
  height: 1px;
  border: none;
  background: transparent;
}

.remember-row {
  margin-top: -8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.remember-row :deep(.el-form-item__label) {
  display: none;
}

.remember-row :deep(.el-checkbox) {
  flex-shrink: 0;
}

.forgot-link {
  font-size: 14px;
  color: var(--el-color-primary);
  text-decoration: none;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: auto;
}

.forgot-link:hover {
  color: var(--el-color-primary-light-2);
  text-decoration: underline;
}

.protocol-row :deep(.el-form-item__label) {
  display: none;
}

.protocol-row :deep(.el-checkbox__label) {
  font-size: 13px;
  color: #606266;
  white-space: normal;
  line-height: 1.5;
}

.protocol-link {
  color: var(--el-color-primary);
  text-decoration: none;
}

.protocol-link:hover {
  text-decoration: underline;
}

.submit-row {
  margin-top: 8px;
}

.submit-row :deep(.el-form-item__label) {
  display: none;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 32px;
  text-align: center;
}

.toggle-text {
  font-size: 14px;
  color: #909399;
}

.toggle-link {
  font-size: 14px;
  color: var(--el-color-primary);
  cursor: pointer;
  text-decoration: none;
  margin-left: 4px;
}

.toggle-link:hover {
  text-decoration: underline;
}

.reset-form {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e4e7;
}

.reset-header {
  text-align: center;
  margin-bottom: 24px;
}

.reset-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
}

.reset-subtitle {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.reset-footer {
  text-align: center;
  margin-top: 16px;
}

.reset-hint {
  font-size: 14px;
  color: #909399;
}

.reset-back-link {
  font-size: 14px;
  color: var(--el-color-primary);
  cursor: pointer;
  text-decoration: none;
  margin-left: 4px;
}

.reset-back-link:hover {
  text-decoration: underline;
}

@media (max-width: 991px) {
  .login-left {
    display: none;
  }

  .login-right {
    width: 100%;
    padding: 20px;
  }

  .form-container {
    max-width: 100%;
  }

  .brand-features {
    gap: 20px;
  }

  .feature-item {
    font-size: 13px;
  }
}

@media (max-width: 767px) {
  .login-page {
    flex-direction: column;
  }

  .login-right {
    min-height: 100vh;
  }

  .form-header {
    margin-bottom: 24px;
  }

  .form-title {
    font-size: 24px;
  }

  .login-form :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  .submit-btn {
    height: 44px;
  }

  .verify-code-row {
    flex-direction: column;
  }

  .reset-form {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e4e4e7;
  }

  .reset-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .reset-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px;
  }

  .reset-subtitle {
    font-size: 13px;
    color: #909399;
    margin: 0;
  }

  .reset-footer {
    text-align: center;
    margin-top: 16px;
  }

  .reset-hint {
    font-size: 14px;
    color: #909399;
  }

  .reset-back-link {
    font-size: 14px;
    color: var(--el-color-primary);
    cursor: pointer;
    text-decoration: none;
    margin-left: 4px;
  }

  .reset-back-link:hover {
    text-decoration: underline;
  }
}

.quick-login-section {
  margin-top: 16px;
}

.quick-login-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e4e4e7;
}

.divider-text {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.quick-login-buttons {
  display: flex;
  gap: 12px;
}

.quick-login-btn {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
}

.admin-btn {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  border: none;
  color: #fff;
}

.admin-btn:hover {
  background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
}

.agent-btn {
  background: #f0f2f5;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.agent-btn:hover {
  background: #e4e8ec;
  border-color: #c0c4cc;
}

.btn-icon {
  font-size: 16px;
}

.btn-label {
  font-weight: 500;
}
</style>
