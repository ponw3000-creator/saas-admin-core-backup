<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import InfoLabel from '@/components/InfoLabel.vue'

const trackEvent = (event, data) => console.log('[Monitor]', event, data)

const dateRange = ref([])
const chartLineRef = ref(null)
const chartBarRef = ref(null)
const chartPieRef = ref(null)

let lineChart = null
let barChart = null
let pieChart = null

const kpiCards = ref([
  { label: '今日总进线量', dictKey: 'total_inbound', value: '8,642', unit: '条', sub: '较昨日 +12.3%', trend: 'up', accent: '#409eff' },
  { label: 'Token 消耗', dictKey: 'token_cost', value: '284,592', unit: 'Tokens', sub: 'Input 61% / Output 39%', accent: '#e6a23c' },
  { label: '预估 AI 费用', dictKey: 'ai_fee_est', value: '¥45.20', unit: '', sub: '较昨日 -3.1%', trend: 'down', accent: '#67c23a' },
  { label: '单均会话成本', dictKey: 'avg_session_cost', value: '¥0.03', unit: '/次', sub: '目标 ≤ ¥0.05', trend: 'down', accent: '#f56c6c' }
])

const blindSpots = ref([
  { trigger: '发票什么时候能开好？', count: 142 },
  { trigger: '退款要几天到账？', count: 118 },
  { trigger: '怎么升级到高级版？', count: 97 },
  { trigger: '合同怎么下载？', count: 83 },
  { trigger: '数据能保留多久？', count: 71 }
])

const fetchDashboardData = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  trackEvent('dashboard_view', { range: dateRange.value })
}

const handleExport = () => {
  trackEvent('export_dashboard_data', { range: dateRange.value })
  ElMessage.success({ message: '报表生成中，预计 30 秒后自动下载...', grouping: true })
}

const initLineChart = () => {
  if (!chartLineRef.value) return
  lineChart = echarts.init(chartLineRef.value)
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['AI 独立解决率', '转人工率'], bottom: 0, icon: 'circle' },
    grid: { left: '3%', right: '4%', bottom: '14%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00']
    },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      {
        name: 'AI 独立解决率',
        type: 'line', smooth: true,
        data: [62, 75, 81, 78, 85, 80, 83, 88, 79, 68],
        lineStyle: { color: '#409eff', width: 2 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64,158,255,0.35)' },
          { offset: 1, color: 'rgba(64,158,255,0.05)' }
        ]) },
        itemStyle: { color: '#409eff' },
        symbol: 'circle', symbolSize: 6
      },
      {
        name: '转人工率',
        type: 'line', smooth: true,
        data: [38, 25, 19, 22, 15, 20, 17, 12, 21, 32],
        lineStyle: { color: '#f56c6c', width: 2 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(245,108,108,0.3)' },
          { offset: 1, color: 'rgba(245,108,108,0.05)' }
        ]) },
        itemStyle: { color: '#f56c6c' },
        symbol: 'circle', symbolSize: 6
      }
    ]
  }
  lineChart.setOption(option)
}

const initBarChart = () => {
  if (!chartBarRef.value) return
  barChart = echarts.init(chartBarRef.value)
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['AI 秒回', '人工处理'], bottom: 0, icon: 'circle' },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: { type: 'category', data: ['报价咨询', '退款处理', '故障申报', '账号问题', '功能建议'] },
    yAxis: { type: 'value', name: 'AHT (秒)', axisLabel: { formatter: '{value}s' } },
    series: [
      {
        name: 'AI 秒回',
        type: 'bar', barWidth: '35%',
        data: [4.2, 6.8, 3.5, 5.1, 2.9],
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#409eff' },
          { offset: 1, color: '#79bbff' }
        ]), borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '人工处理',
        type: 'bar', barWidth: '35%',
        data: [182, 324, 156, 248, 95],
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#f56c6c' },
          { offset: 1, color: '#faa8a8' }
        ]), borderRadius: [4, 4, 0, 0] }
      }
    ]
  }
  barChart.setOption(option)
}

const initPieChart = () => {
  if (!chartPieRef.value) return
  pieChart = echarts.init(chartPieRef.value)
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: '8%', top: 'center', icon: 'circle' },
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['35%', '50%'],
      label: { show: false },
      data: [
        { value: 3124, name: '好评', itemStyle: { color: '#67c23a' } },
        { value: 482, name: '中评', itemStyle: { color: '#e6a23c' } },
        { value: 136, name: '差评', itemStyle: { color: '#f56c6c' } }
      ]
    }]
  }
  pieChart.setOption(option)
}

const handleResize = () => {
  lineChart?.resize()
  barChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  fetchDashboardData()
  initLineChart()
  initBarChart()
  initPieChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  barChart?.dispose()
  pieChart?.dispose()
})
</script>

<template>
  <div class="dashboard-page">
    <div class="dashboard-toolbar">
      <div class="toolbar-left">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          range-separator="至"
          value-format="YYYY-MM-DD HH:mm:ss"
          :default-time="[new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]"
          style="width: 360px"
        />
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleExport">
          <svg width="14" height="14" viewBox="0 0 1024 1024" style="margin-right: 6px">
            <path fill="currentColor" d="M768 640v-384q0-16-12-28l-352-352q-12-12-28-12t-28 12l-352 352q-12 12-12 28v384q0 16 12 28t28 12h192v128h128V768h192q16 0 28-12t12-28zm384 0v-320l-320-320-64 64-28-28 352-352L960 64l-28 28 64 64-320 320v320z"/>
          </svg>
          导出报表
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="view-section">
      <el-col :span="6" v-for="(card, i) in kpiCards" :key="i">
        <el-card class="kpi-card" shadow="hover" :style="{ borderLeftColor: card.accent }">
          <div class="kpi-label">
            <span>{{ card.label }}</span>
            <InfoLabel v-if="card.dictKey" :dict-key="card.dictKey" />
          </div>
          <div class="kpi-value">
            {{ card.value }}
            <span class="kpi-unit" v-if="card.unit">{{ card.unit }}</span>
          </div>
          <div class="kpi-sub" :class="card.trend === 'up' ? 'trend-up' : 'trend-down'">
            <span class="trend-arrow">{{ card.trend === 'up' ? '↑' : '↓' }}</span>
            {{ card.sub }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                AI 独立解决率
                <InfoLabel dict-key="ai_resolution" />
                <span class="card-title-sep">vs</span>
                转人工率趋势
              </span>
              <el-tag type="info" size="small">近 24 小时</el-tag>
            </div>
          </template>
          <div ref="chartLineRef" class="chart-container" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <span class="card-title">知识库盲区 Top 5</span>
          </template>
          <el-table :data="blindSpots" size="small" class="blind-table" :show-header="true">
            <el-table-column type="index" label="#" width="36" align="center" />
            <el-table-column prop="trigger" label="触发原话" min-width="140" show-overflow-tooltip />
            <el-table-column prop="count" label="触发次数" width="72" align="center">
              <template #default="{ row }">
                <span class="count-badge">{{ row.count }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="blind-hint">建议优先补充以上知识条目</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                AI 秒回
                <InfoLabel dict-key="aht_time" />
                <span class="card-title-sep">vs</span>
                人工处理 AHT 对比
              </span>
              <el-tag type="warning" size="small">按意图类型</el-tag>
            </div>
          </template>
          <div ref="chartBarRef" class="chart-container" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                满意度
                <InfoLabel dict-key="csat_score" />
                分布
              </span>
              <el-tag type="success" size="small">最近 30 天</el-tag>
            </div>
          </template>
          <div ref="chartPieRef" class="chart-container" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
  overflow-y: auto;
}

.dashboard-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.view-section {
  flex-shrink: 0;
}

.kpi-card {
  border-radius: 8px;
  border-left: 4px solid;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.kpi-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.kpi-value {
  font-size: 26px;
  font-weight: 700;
  color: #1d1d1d;
  line-height: 1;
  margin-bottom: 8px;
}

.kpi-unit {
  font-size: 13px;
  font-weight: 400;
  color: #909399;
  margin-left: 2px;
}

.kpi-sub {
  font-size: 12px;
  font-weight: 500;
}

.trend-up { color: #f56c6c; }
.trend-down { color: #67c23a; }
.trend-arrow { margin-right: 2px; }

.chart-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-title-sep {
  font-weight: 400;
  color: #c0c4cc;
  margin: 0 2px;
}

.chart-container {
  width: 100%;
}

.blind-table {
  border-radius: 4px;
  overflow: hidden;
}

.count-badge {
  display: inline-block;
  background: #fef0f0;
  color: #f56c6c;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 10px;
}

.blind-hint {
  margin-top: 12px;
  font-size: 12px;
  color: #c0c4cc;
  text-align: center;
}
</style>