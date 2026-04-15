<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Download, RefreshRight } from '@element-plus/icons-vue'
import { fetchOperationLogs, MOCK_LOGS } from '@/api/log'

const MODULE_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'AI 模型配置', label: 'AI 模型配置' },
  { value: '字典管理', label: '字典管理' },
  { value: '知识与话术', label: '知识与话术' },
  { value: '团队与权限', label: '团队与权限' }
]

const MODULE_TAG_TYPE = {
  'AI 模型配置': 'success',
  '字典管理': 'warning',
  '知识与话术': 'info',
  '团队与权限': 'danger'
}

const operatorOptions = computed(() => {
  const seen = new Set()
  return MOCK_LOGS.filter((log) => {
    if (seen.has(log.operator)) return false
    seen.add(log.operator)
    return true
  }).map((log) => log.operator)
})

const queryParams = reactive({
  module: '',
  operator: '',
  dateRange: [],
  page: 1,
  pageSize: 10
})

const tableData = reactive({ list: [], total: 0 })
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchOperationLogs(queryParams)
    tableData.list = res.list
    tableData.total = res.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  loadData()
}

const handleReset = () => {
  queryParams.module = ''
  queryParams.operator = ''
  queryParams.dateRange = []
  queryParams.page = 1
  loadData()
}

const handlePageChange = (page) => {
  queryParams.page = page
  loadData()
}

const handleSizeChange = (size) => {
  queryParams.pageSize = size
  queryParams.page = 1
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="oplog-page">
    <el-card class="oplog-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">操作日志</span>
          <el-button size="small">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </template>

      <el-form :inline="true" class="filter-bar">
        <el-form-item label="操作模块">
          <el-select v-model="queryParams.module" placeholder="全部模块" filterable clearable style="width: 160px">
            <el-option
              v-for="opt in MODULE_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-select v-model="queryParams.operator" placeholder="全部展示" filterable clearable style="width: 140px">
            <el-option label="全部" value="" />
            <el-option
              v-for="op in operatorOptions"
              :key="op"
              :label="op"
              :value="op"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 340px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="tableData.list"
        stripe
        class="oplog-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#333' }"
      >
        <el-table-column prop="create_time" label="操作时间" width="170" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column label="模块" width="130">
          <template #default="{ row }">
            <el-tag :type="MODULE_TAG_TYPE[row.module] || 'info'" size="small">
              {{ row.module }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="动作" width="110" />
        <el-table-column label="变动前明细" min-width="180">
          <template #default="{ row }">
            <span class="cell-before">{{ row.detail_before }}</span>
          </template>
        </el-table-column>
        <el-table-column label="变动后明细" min-width="180">
          <template #default="{ row }">
            <span class="cell-after">{{ row.detail_after }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ip_address" label="IP 地址" width="130" />
      </el-table>

      <div class="pagination-bar">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          :page-size="queryParams.pageSize"
          :current-page="queryParams.page"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.oplog-page {
  height: 100%;
}

.oplog-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.filter-bar {
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 10px;
}

.filter-bar :deep(.el-form-item) {
  margin-bottom: 0;
}

.oplog-table {
  flex: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.cell-before {
  color: #f56c6c;
}

.cell-after {
  color: #67c23a;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0;
}
</style>
