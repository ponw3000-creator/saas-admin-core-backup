<template>
  <div class="enterprise-profile">
    <div class="page-header">
      <h2 class="page-title">企业资料</h2>
      <span class="page-desc">维护企业基本信息、品牌资产及订阅管理</span>
    </div>
    <el-divider />

    <el-form ref="formRef" :model="enterprise" :rules="formRules" label-width="140px" class="profile-form" label-position="left">
      <div class="form-section">
        <div class="section-title">基本信息</div>

        <el-form-item>
          <template #label>
            <span>企业唯一 ID<ProHelp content="系统自动分配的数字身份证，用于技术支持、接口对接及多租户数据隔离。" /></span>
          </template>
          <div class="form-item-content">
            <el-input v-model="enterprise.tenantId" readonly disabled />
            <div class="setting-tip">系统生成的唯一识别码，用于技术支持与数据隔离。</div>
          </div>
        </el-form-item>

        <el-form-item label="企业全称" required>
          <div class="form-item-content">
            <el-input v-model="enterprise.name" placeholder="请输入企业全称" />
          </div>
        </el-form-item>

        <el-form-item>
          <template #label>
            <span>社会信用代码<ProHelp content="18位统一社会信用代码，将作为合同开票、主体实名核验的唯一依据。" /></span>
          </template>
          <div class="form-item-content">
            <el-input v-model="enterprise.creditCode" placeholder="请输入统一社会信用代码" />
          </div>
        </el-form-item>
      </div>

      <div class="form-section">
        <div class="section-title">品牌资产</div>

        <el-form-item label="企业 Logo">
          <div class="form-item-content">
            <div class="avatar-upload-row">
              <el-upload
                class="avatar-uploader"
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                accept=".jpg,.jpeg,.png,.svg"
                :before-upload="beforeLogoUpload"
                :on-change="(file) => handleLogoChange(file)"
              >
                <img v-if="enterprise.logo" :src="enterprise.logo" class="logo-preview" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div v-if="enterprise.logo" class="avatar-clear">
                <el-button size="small" link type="danger" @click="handleLogoRemove">移除</el-button>
              </div>
            </div>
            <div class="setting-tip">建议尺寸 400×400px，将作为全站系统默认 Logo 及默认头像兜底。</div>
          </div>
        </el-form-item>
      </div>

      <div class="form-section readonly-section">
        <div class="section-title">管理与订阅</div>

        <el-form-item>
          <template #label>
            <span>主管理员 (Owner)<ProHelp content="企业的最高权限拥有者，拥有移交超管身份、管理底层安全策略的唯一权限。" /></span>
          </template>
          <div class="form-item-content">
            <el-input :model-value="enterprise.owner" readonly disabled class="readonly-input" />
          </div>
        </el-form-item>

        <el-form-item label="当前版本">
          <div class="form-item-content">
            <el-tag type="success" effect="dark" class="readonly-tag">企业旗舰版</el-tag>
          </div>
        </el-form-item>
      </div>

      <el-collapse v-model="activeCollapse" class="profile-collapse">
        <el-collapse-item title="企业联系人" name="contact">
          <div class="collapse-content">
            <el-form-item label="联系人姓名" prop="contactName" required>
              <div class="form-item-content">
                <el-input v-model="enterprise.contactName" placeholder="请输入企业指定的商务对接人" />
              </div>
            </el-form-item>

            <el-form-item label="联系电话" prop="contactPhone" required>
              <div class="form-item-content">
                <el-input v-model="enterprise.contactPhone" placeholder="请输入联系电话" />
              </div>
            </el-form-item>

            <el-form-item label="常用邮箱" prop="contactEmail" required>
              <div class="form-item-content">
                <el-input v-model="enterprise.contactEmail" placeholder="用于接收系统账单或重要通知" />
              </div>
            </el-form-item>
          </div>
        </el-collapse-item>

        <el-collapse-item title="发票抬头信息" name="invoice">
          <div class="collapse-content">
            <el-form-item label="发票抬头" prop="invoiceTitle">
              <div class="form-item-content">
                <div class="input-with-action">
                  <el-input v-model="enterprise.invoiceTitle" placeholder="请输入发票抬头" />
                  <el-button link type="primary" @click="syncInvoiceTitle">同企业全称</el-button>
                </div>
              </div>
            </el-form-item>

            <el-form-item prop="taxNumber" required>
              <template #label>
                <span>纳税人识别号<ProHelp content="通常与社会信用代码一致，用于自动生成电子发票及税务申报。" /></span>
              </template>
              <div class="form-item-content">
                <el-input v-model="enterprise.taxNumber" placeholder="请输入18位统一社会信用代码" maxlength="18" />
              </div>
            </el-form-item>

            <el-form-item label="单位注册地址" prop="registeredAddress">
              <div class="form-item-content">
                <el-input v-model="enterprise.registeredAddress" placeholder="请输入单位注册地址" />
              </div>
            </el-form-item>

            <el-form-item label="注册固定电话" prop="registeredPhone">
              <div class="form-item-content">
                <el-input v-model="enterprise.registeredPhone" placeholder="请输入注册固定电话" />
              </div>
            </el-form-item>

            <el-form-item label="开户银行" prop="bankName">
              <div class="form-item-content">
                <el-input v-model="enterprise.bankName" placeholder="请输入开户银行" />
              </div>
            </el-form-item>

            <el-form-item label="银行账号" prop="bankAccount">
              <div class="form-item-content">
                <el-input v-model="enterprise.bankAccount" placeholder="请输入银行账号" />
              </div>
            </el-form-item>
          </div>
        </el-collapse-item>
      </el-collapse>

      <el-form-item style="margin-top: 32px;">
        <el-button type="primary" :loading="saving" @click="handleSave">保存修改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const saving = ref(false)
const formRef = ref(null)
const activeCollapse = ref([])

const formRules = {
  invoiceTitle: [
    { required: true, message: '发票抬头不能为空', trigger: 'blur' },
    { min: 2, message: '发票抬头长度不能少于2个字符', trigger: 'blur' },
    { pattern: /^[^0-9]+$/, message: '发票抬头不能为纯数字', trigger: 'blur' }
  ],
  taxNumber: [
    { required: true, message: '纳税人识别号不能为空', trigger: 'blur' },
    { pattern: /^[A-Z0-9]{15,18}$/, message: '请输入15-18位有效的纳税人识别号（大写字母或数字）', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '联系电话不能为空', trigger: 'blur' },
    { pattern: /^((0\d{2,3}-\d{7,8})|(1[3-9]\d{9}))$/, message: '请输入有效的手机号或座机号', trigger: 'blur' }
  ],
  contactEmail: [
    { required: true, message: '常用邮箱不能为空', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入有效的电子邮箱地址', trigger: 'blur' }
  ],
  registeredAddress: [
    { min: 5, message: '单位注册地址长度不能少于5个字符', trigger: 'blur' }
  ],
  registeredPhone: [
    { pattern: /^((0\d{2,3}-\d{7,8})|(1[3-9]\d{9}))$/, message: '请输入有效的手机号或座机号（如 010-12345678 或 13812345678）', trigger: 'blur' }
  ],
  bankName: [
    { pattern: /^[\u4e00-\u9fa5()（）]+$/, message: '开户银行必须包含中文字符，禁止纯数字或纯拼音', trigger: 'blur' }
  ],
  bankAccount: [
    { pattern: /^\d{10,30}$/, message: '银行账号只能包含数字，长度10-30位', trigger: 'blur' }
  ],
  contactName: [
    { required: true, message: '联系人姓名不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '联系人姓名长度需在 2 到 20 个字符之间', trigger: 'blur' }
  ]
}

const enterprise = reactive({
  tenantId: 'T-8801-2026',
  name: '',
  creditCode: '',
  logo: '',
  owner: '超级管理员 (admin@company.com)',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  invoiceTitle: '',
  taxNumber: '',
  registeredAddress: '',
  registeredPhone: '',
  bankName: '',
  bankAccount: ''
})

const beforeLogoUpload = (rawFile) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml']
  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('Logo 图片只能是 JPG、PNG 或 SVG 格式!')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Logo 图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleLogoChange = (file) => {
  const url = URL.createObjectURL(file.raw)
  enterprise.logo = url
}

const handleLogoRemove = () => {
  enterprise.logo = ''
}

const syncInvoiceTitle = () => {
  enterprise.invoiceTitle = enterprise.name
}

const handleSave = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('企业资料已保存')
  }, 800)
}
</script>

<style scoped>
.enterprise-profile {
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

.profile-form {
  max-width: 600px;
  margin-top: 30px;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.form-item-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.setting-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 8px;
}

.avatar-upload-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-uploader {
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  overflow: hidden;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 24px;
  color: #8c8c8c;
}

.logo-preview {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.avatar-clear {
  display: flex;
  flex-direction: column;
}

.readonly-section {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px 16px 8px;
  margin-left: -16px;
  margin-right: -16px;
}

.readonly-section .section-title {
  color: #909399;
}

.readonly-section .form-item-content {
  color: #909399;
}

.readonly-input {
  opacity: 0.7;
}

.readonly-input :deep(.el-input__wrapper) {
  background-color: #f0f2f5;
  box-shadow: none;
  border-color: #e8e8e8;
}

.readonly-tag {
  opacity: 0.7;
}

.profile-collapse {
  border: none;
  background: transparent;
}

.profile-collapse :deep(.el-collapse-item__header) {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  background: transparent;
  border-bottom: 1px solid #f0f0f0;
  padding-left: 10px;
}

.profile-collapse :deep(.el-collapse-item__header::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background: #409eff;
  border-radius: 2px;
}

.profile-collapse :deep(.el-collapse-item__wrap) {
  background: transparent;
  border: none;
}

.profile-collapse :deep(.el-collapse-item__content) {
  padding: 20px 0 8px;
}

.collapse-content {
  padding-left: 10px;
}

.input-with-action {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.input-with-action .el-input {
  flex: 1;
}
</style>
