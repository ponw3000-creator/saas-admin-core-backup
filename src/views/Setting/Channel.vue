<template>
  <div class="channel-setting-page">
    <div class="page-header">
      <div class="header-top">
        <div>
          <h2>渠道实例管理</h2>
          <p class="subtitle">为不同业务线绑定独立的渠道实例，实现精细化运营。</p>
        </div>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          新增渠道
        </el-button>
      </div>
    </div>

    <el-card shadow="never" class="channel-card">
      <el-table :data="channelStore.channelList" v-loading="loading" style="width: 100%">
        <el-table-column label="渠道名称" min-width="180">
          <template #default="{ row }">
            <div class="channel-info">
              <el-icon class="channel-icon" :size="20"><Platform /></el-icon>
              <span class="channel-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="渠道类型" width="140">
          <template #default="{ row }">
            <el-tag size="small" :type="getChannelTagType(row.code)">
              {{ channelStore.getChannelTypeLabel(row.code) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="唯一标识" min-width="200">
          <template #default="{ row }">
            <span class="identifier-text">{{ getChannelIdentifier(row) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" prop="createTime" width="180" />

        <el-table-column label="启用状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              :loading="statusLoading[row.id]"
              :disabled="statusLoading[row.id]"
              @before-change="() => handleBeforeStatusChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑渠道' : '新增渠道'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="form" :rules="formRules" ref="formRef" label-position="top">
        <el-form-item label="渠道名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：男装小程序、女装小程序" clearable />
        </el-form-item>

        <el-form-item label="渠道类型" prop="code">
          <el-select
            v-model="form.code"
            placeholder="请选择渠道类型"
            style="width: 100%;"
            :disabled="isEdit"
            @change="handleChannelTypeChange"
          >
            <el-option label="微信小程序" value="WX_MINI" />
            <el-option label="Web 网页端" value="WEB" />
            <el-option label="APP 原生端" value="APP" />
            <el-option label="H5 移动端" value="H5" />
            <el-option label="抖音客服" value="DOUYIN" />
            <el-option label="小红书店铺" value="XHS" />
            <el-option label="微信公众号" value="WX_GZH" />
          </el-select>
        </el-form-item>

        <template v-if="form.code === 'WX_MINI'">
          <el-form-item label="AppID (小程序ID)" prop="appId">
            <el-input v-model="form.appId" placeholder="请输入 wx 开头的 AppID" clearable />
          </el-form-item>
          <el-form-item label="AppSecret (小程序密钥)" prop="appSecret">
            <el-input v-model="form.appSecret" type="password" show-password placeholder="请输入密钥" />
          </el-form-item>
        </template>

        <template v-else-if="form.code === 'WEB'">
          <el-form-item label="网站域名" prop="domain">
            <el-input v-model="form.domain" placeholder="例如: https://www.yoursite.com" clearable />
          </el-form-item>
          <el-form-item label="主题颜色" prop="themeColor">
            <el-color-picker v-model="form.themeColor" />
          </el-form-item>
        </template>

        <template v-else-if="form.code === 'APP'">
          <el-form-item label="App Package Name" prop="packageName">
            <el-input v-model="form.packageName" placeholder="例如: com.yourcompany.app" clearable />
          </el-form-item>
          <el-form-item label="App Secret" prop="appSecret">
            <el-input v-model="form.appSecret" type="password" show-password placeholder="请输入密钥" />
          </el-form-item>
        </template>

        <template v-else-if="form.code === 'H5'">
          <el-form-item label="H5 域名" prop="domain">
            <el-input v-model="form.domain" placeholder="例如: https://m.yoursite.com" clearable />
          </el-form-item>
          <el-form-item label="H5 Secret" prop="h5Secret">
            <el-input v-model="form.h5Secret" type="password" show-password placeholder="请输入密钥" />
          </el-form-item>
        </template>

        <template v-else-if="form.code === 'DOUYIN'">
          <el-form-item label="Shop ID (店铺ID)" prop="shopId">
            <el-input v-model="form.shopId" placeholder="请输入抖音店铺ID" clearable />
          </el-form-item>
          <el-form-item label="App Key" prop="appKey">
            <el-input v-model="form.appKey" type="password" show-password placeholder="请输入 App Key" />
          </el-form-item>
          <el-form-item label="App Secret" prop="appSecret">
            <el-input v-model="form.appSecret" type="password" show-password placeholder="请输入 App Secret" />
          </el-form-item>
        </template>

        <template v-else-if="form.code === 'XHS'">
          <el-form-item label="Merchant ID (商家ID)" prop="merchantId">
            <el-input v-model="form.merchantId" placeholder="请输入小红书商家ID" clearable />
          </el-form-item>
          <el-form-item label="App Secret" prop="appSecret">
            <el-input v-model="form.appSecret" type="password" show-password placeholder="请输入 App Secret" />
          </el-form-item>
        </template>

        <template v-else-if="form.code === 'WX_GZH'">
          <el-form-item label="AppID" prop="appId">
            <el-input v-model="form.appId" placeholder="请输入微信公众号 AppID" clearable />
          </el-form-item>
          <el-form-item label="AppSecret" prop="appSecret">
            <el-input v-model="form.appSecret" type="password" show-password placeholder="请输入 AppSecret" />
          </el-form-item>
          <el-form-item label="Token" prop="token">
            <el-input v-model="form.token" type="password" show-password placeholder="请输入验证 Token" />
          </el-form-item>
          <el-form-item label="EncodingAESKey" prop="encodingAESKey">
            <el-input v-model="form.encodingAESKey" type="password" show-password placeholder="请输入 EncodingAESKey" />
          </el-form-item>
        </template>

        <el-form-item label="启用状态">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Platform } from '@element-plus/icons-vue'
import { useChannelStore } from '@/store/channelStore'

const channelStore = useChannelStore()

const loading = ref(false)
const statusLoading = reactive({})
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  name: '',
  code: '',
  isActive: true,
  appId: '',
  appSecret: '',
  domain: '',
  themeColor: '#409EFF',
  packageName: '',
  h5Secret: '',
  shopId: '',
  appKey: '',
  merchantId: '',
  token: '',
  encodingAESKey: ''
})

const formRules = {
  name: [{ required: true, message: '请输入渠道名称', trigger: 'blur' }],
  code: [{ required: true, message: '请选择渠道类型', trigger: 'change' }]
}

const getChannelTagType = (code) => {
  const map = { WX_MINI: 'success', WEB: 'primary', APP: 'warning', H5: 'info' }
  return map[code] || 'info'
}

const getChannelIdentifier = (row) => {
  if (row.code === 'WX_MINI') return row.appId || '未配置'
  if (row.code === 'WEB') return row.domain || '未配置'
  if (row.code === 'APP') return row.packageName || '未配置'
  if (row.code === 'H5') return row.domain || '未配置'
  return '未知'
}

const handleChannelTypeChange = () => {
  form.appId = ''
  form.appSecret = ''
  form.domain = ''
  form.themeColor = '#409EFF'
  form.packageName = ''
  form.h5Secret = ''
  form.shopId = ''
  form.appKey = ''
  form.merchantId = ''
  form.token = ''
  form.encodingAESKey = ''
}

const openAddDialog = () => {
  isEdit.value = false
  Object.keys(form).forEach(key => {
    if (key === 'isActive') form[key] = true
    else if (key === 'themeColor') form[key] = '#409EFF'
    else form[key] = ''
  })
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    isActive: row.isActive,
    appId: row.appId || '',
    appSecret: row.appSecret || '',
    domain: row.domain || '',
    themeColor: row.themeColor || '#409EFF',
    packageName: row.packageName || '',
    h5Secret: row.h5Secret || ''
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (isEdit.value) {
    channelStore.updateChannel(form.id, { ...form })
    ElMessage.success('渠道已更新')
  } else {
    channelStore.addChannel({ ...form })
    ElMessage.success('渠道已新增')
  }
  dialogVisible.value = false
}

const handleBeforeStatusChange = async (row) => {
  statusLoading[row.id] = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    channelStore.updateChannel(row.id, { isActive: !row.isActive })
    const actionText = row.isActive ? '启用' : '禁用'
    ElMessage.success(`已${actionText}渠道：${row.name}`)
  } finally {
    statusLoading[row.id] = false
  }
}

const handleDelete = (row) => {
  channelStore.deleteChannel(row.id)
  ElMessage.success(`已删除渠道：${row.name}`)
}
</script>

<style scoped>
.channel-setting-page {
  padding: 24px;
}
.page-header {
  margin-bottom: 24px;
}
.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}
.subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}
.channel-card {
  border-radius: 8px;
}
.channel-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.channel-icon {
  color: #409EFF;
  background: #ecf5ff;
  padding: 6px;
  border-radius: 6px;
  flex-shrink: 0;
}
.channel-name {
  font-weight: 500;
  color: #303133;
}
.identifier-text {
  font-family: monospace;
  font-size: 13px;
  color: #606266;
}
</style>
