<template>
  <div class="security-center">
    <div class="page-header">
      <h2 class="page-title">安全中心</h2>
      <span class="page-desc">管理登录安全策略、账号策略及高危操作审计</span>
    </div>
    <el-divider />

    <div class="security-cards">
      <el-card class="security-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">登录安全</span>
          </div>
        </template>

        <el-form label-width="200px" label-position="left" class="security-form">
          <el-form-item>
            <template #label>
              <span>双重身份验证 (MFA)<ProHelp content="MFA (Multi-Factor Authentication) 多重身份验证。开启后，除密码外还需输入手机动态验证码方可登录，为您的账号提供银行级安全防护。" /></span>
            </template>
            <div class="form-item-row">
              <el-switch v-model="security.mfaEnabled" />
              <span class="form-tip switch-tip">启用后，管理员登录需额外输入手机验证码</span>
            </div>
          </el-form-item>

          <el-form-item>
            <template #label>
              <span>IP 白名单<ProHelp content="【高危配置】仅允许来自指定 IP 的访问请求。请确保您的当前 IP 已包含在内，否则将导致无法登录。" :danger="true" /></span>
            </template>
            <div class="form-item-column">
              <el-switch v-model="security.ipWhitelistEnabled" />
              <div class="ip-list" v-if="security.ipWhitelistEnabled">
                <el-input
                  v-model="security.ipWhitelist"
                  type="textarea"
                  :rows="3"
                  placeholder="每行一个 IP 地址，例如：192.168.1.1"
                />
                <span class="form-tip">留空表示仅允许当前 IP</span>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="security-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">账号策略</span>
          </div>
        </template>

        <el-form label-width="140px" label-position="left" class="security-form">
          <el-form-item label="密码有效期">
            <div class="form-item-column">
              <el-radio-group v-model="security.passwordExpiry">
                <el-radio :value="0">永不过期</el-radio>
                <el-radio :value="30">30 天</el-radio>
                <el-radio :value="60">60 天</el-radio>
                <el-radio :value="90">90 天</el-radio>
              </el-radio-group>
              <span class="form-tip">过期后需强制修改密码</span>
            </div>
          </el-form-item>

          <el-form-item>
            <template #label>
              <span>闲置自动登出<ProHelp content="为防止办公位人员走动导致的数据泄露，系统在设定时间内未检测到操作将自动退出登录。（支持设置范围：5 ~ 120 分钟）" /></span>
            </template>
            <div class="form-item-row">
              <el-input-number
                v-model="security.idleTimeout"
                :min="5"
                :max="120"
                :step="5"
                controls-position="right"
                style="width: 120px"
              />
              <span class="form-tip-inline">分钟无操作后自动登出</span>
            </div>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="security-card danger-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title danger-title">
              <el-icon class="danger-icon"><WarningFilled /></el-icon>
              危险操作区
            </span>
          </div>
        </template>

        <div class="danger-zone">
          <div class="danger-item">
            <div class="danger-info">
              <div class="danger-label">超级管理员权限移交</div>
              <div class="danger-desc">将您的超级管理员权限移交给其他管理员/主管。移交后您将自动降级为普通管理员。</div>
            </div>
            <el-button type="danger" @click="showTransferDialog">权限移交</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <el-dialog
      v-model="transferDialogVisible"
      title="超级管理员权限移交"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div v-if="transferStep === 1" class="transfer-step">
        <div class="step-indicator">
          <span class="step active">1</span>
          <span class="step-line"></span>
          <span class="step">2</span>
          <span class="step-line"></span>
          <span class="step">3</span>
        </div>
        <el-form label-width="100px" label-position="left">
          <el-form-item label="选择受让人">
            <el-select v-model="transferData.toUser" placeholder="请选择管理员或主管" style="width: 100%">
              <el-option
                v-for="member in eligibleAssignees"
                :key="member.id"
                :label="`${member.name} (${member.account})`"
                :value="member.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="transferStep === 2" class="transfer-step">
        <div class="step-indicator">
          <span class="step finished">✓</span>
          <span class="step-line finished"></span>
          <span class="step active">2</span>
          <span class="step-line"></span>
          <span class="step">3</span>
        </div>
        <div class="risk-confirm">
          <div class="risk-warning">
            <el-icon class="risk-icon"><Warning /></el-icon>
            <div class="risk-text">
              <div class="risk-title">此操作不可逆</div>
              <div class="risk-desc">移交后，您的账号将自动降级为普通管理员，并被强制登出。当前会话将立即终止。</div>
            </div>
          </div>
          <el-checkbox v-model="transferData.riskConfirmed">
            我已充分阅读并理解上述风险，确认执行此操作
          </el-checkbox>
        </div>
      </div>

      <div v-if="transferStep === 3" class="transfer-step">
        <div class="step-indicator">
          <span class="step finished">✓</span>
          <span class="step-line finished"></span>
          <span class="step finished">✓</span>
          <span class="step-line finished"></span>
          <span class="step active">3</span>
        </div>
        <div class="verify-section">
          <div class="verify-tip">
            为了您的账号安全，请获取并输入发送至您当前绑定邮箱
            <span class="masked-email">adm***@company.com</span>
            的 6 位验证码。
          </div>
          <div class="verify-hint">若邮箱已不可用，请先前往 <span class="link-text">个人中心</span> 修改绑定。</div>
          <el-form label-width="100px" label-position="left">
            <el-form-item label="验证码">
              <div class="code-input-row">
                <el-input
                  v-model="transferData.verifyCode"
                  placeholder="请输入 6 位验证码"
                  maxlength="6"
                  @input="handleCodeInput"
                />
                <el-button
                  type="primary"
                  plain
                  :loading="sendCodeLoading"
                  :disabled="countdown > 0"
                  @click="sendVerifyCode"
                >
                  {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="transferStep > 1" @click="prevStep">上一步</el-button>
          <el-button v-if="transferStep < 3" type="primary" :disabled="!canNext" @click="nextStep">下一步</el-button>
          <el-button v-if="transferStep === 3" :disabled="transferFinalLoading" @click="transferDialogVisible = false">取消</el-button>
          <el-button v-if="transferStep === 3" type="danger" :loading="transferFinalLoading" :loading-icon="null" :disabled="!canConfirm" @click="confirmTransfer">
            {{ transferLoadingText }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { WarningFilled, Warning } from '@element-plus/icons-vue'

const router = useRouter()

const security = reactive({
  mfaEnabled: false,
  ipWhitelistEnabled: false,
  ipWhitelist: '',
  passwordExpiry: 0,
  idleTimeout: 30
})

const transferDialogVisible = ref(false)
const transferStep = ref(1)
const transferLoading = ref(false)
const transferFinalLoading = ref(false)
const transferLoadingText = ref('正在提交...')
const sendCodeLoading = ref(false)
const countdown = ref(0)
let countdownTimer = null

const transferData = reactive({
  toUser: '',
  riskConfirmed: false,
  verifyCode: ''
})

const allTeamMembers = [
  { id: 'u001', name: '张明', account: 'zhang@company.com', role: 'admin' },
  { id: 'u002', name: '李娜', account: 'li@company.com', role: 'supervisor' },
  { id: 'u003', name: '王浩', account: 'wang@company.com', role: 'admin' },
  { id: 'u004', name: '赵雪', account: 'zhao@company.com', role: 'agent' },
  { id: 'u005', name: '陈思', account: 'chen@company.com', role: 'agent' },
  { id: 'u006', name: '刘强', account: 'liu@company.com', role: 'supervisor' }
]

const eligibleAssignees = computed(() => {
  return allTeamMembers.filter(member => member.role === 'admin' || member.role === 'supervisor')
})

const canNext = computed(() => {
  if (transferStep.value === 1) {
    return !!transferData.toUser
  }
  if (transferStep.value === 2) {
    return transferData.riskConfirmed
  }
  return true
})

const canConfirm = computed(() => {
  return transferData.verifyCode === '123456'
})

const showTransferDialog = () => {
  transferStep.value = 1
  transferData.toUser = ''
  transferData.riskConfirmed = false
  transferData.verifyCode = ''
  transferDialogVisible.value = true
}

const prevStep = () => {
  if (transferStep.value > 1) {
    transferStep.value--
  }
}

const nextStep = () => {
  if (transferStep.value < 3) {
    transferStep.value++
  }
}

const confirmTransfer = () => {
  if (!transferData.verifyCode) {
    ElMessage.warning('请先输入验证码')
    return
  }
  if (transferData.verifyCode !== '123456') {
    ElMessage.error('验证码错误，请重新输入')
    return
  }

  transferFinalLoading.value = true
  transferLoadingText.value = '正在核验当前超管身份...'

  // 故意增加延迟，通过"摩擦感"提升用户对后台严密校验的安全感知
  const loadingMessages = [
    '正在生成安全移交密钥...',
    '正在同步全局访问策略...'
  ]
  let msgIndex = 0
  const loadingTimer = setInterval(() => {
    if (msgIndex < loadingMessages.length) {
      transferLoadingText.value = loadingMessages[msgIndex]
      msgIndex++
    }
  }, 500)

  setTimeout(() => {
    clearInterval(loadingTimer)

    // 强制清除凭证
    localStorage.clear()
    sessionStorage.clear()

    transferFinalLoading.value = false
    transferDialogVisible.value = false

    ElNotification({
      title: '权限移交成功',
      message: '基于安全合规要求，系统将强制登出，请使用新身份重新登录。',
      type: 'success',
      duration: 2500
    })

    // 强行重定向至登录页
    setTimeout(() => {
      window.location.href = '/login'
    }, 2500)
  }, 1500)
}

const sendVerifyCode = () => {
  sendCodeLoading.value = true
  setTimeout(() => {
    sendCodeLoading.value = false
    ElMessage.success('验证码已发送至您的绑定邮箱')
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

const handleCodeInput = () => {
}
</script>

<style scoped>
.security-center {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: 100%;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.page-desc {
  font-size: 13px;
  color: #909399;
}

.security-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 700px;
}

.security-card {
  border-radius: 8px;
}

.danger-card {
  background: #fff1f0;
  border: 1px solid #ffccc7;
}

.danger-card :deep(.el-card__header) {
  background: #fff1f0;
  border-bottom: 1px solid #ffccc7;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.danger-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #cf1322;
}

.danger-icon {
  font-size: 16px;
}

.security-form {
  padding-top: 8px;
}

.security-form .el-form-item {
  margin-bottom: 28px;
}

.form-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-item-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.form-tip {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  line-height: 1.5;
}

.switch-tip {
  margin-left: 12px;
}

.form-tip-inline {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.ip-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.danger-zone {
  padding: 8px 0;
}

.danger-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.danger-info {
  flex: 1;
}

.danger-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.danger-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}

.transfer-step {
  padding: 16px 8px;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 28px;
}

.step {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.step.active {
  background: #409eff;
  color: #fff;
}

.step.finished {
  background: #67c23a;
  color: #fff;
}

.step-line {
  width: 60px;
  height: 2px;
  background: #f0f0f0;
}

.step-line.finished {
  background: #67c23a;
}

.risk-confirm {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.risk-warning {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
}

.risk-icon {
  font-size: 24px;
  color: #cf1322;
  flex-shrink: 0;
}

.risk-text {
  flex: 1;
}

.risk-title {
  font-size: 14px;
  font-weight: 600;
  color: #cf1322;
  margin-bottom: 6px;
}

.risk-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.verify-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.verify-tip {
  font-size: 13px;
  color: #666;
  text-align: center;
  line-height: 1.6;
}

.verify-hint {
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.masked-email {
  font-weight: 600;
  color: #409eff;
}

.link-text {
  color: #409eff;
  cursor: pointer;
}

.code-input-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.code-input-row .el-input {
  flex: 1;
}

.verify-code {
  font-weight: 600;
  color: #409eff;
  font-size: 15px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
