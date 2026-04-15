<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { TrendCharts, Lightning } from '@element-plus/icons-vue'
import InfoLabel from '@/components/InfoLabel.vue'

const lineChartRef = ref(null)
const funnelChartRef = ref(null)
let lineChart = null
let funnelChart = null

const perfStats = ref([
  { label: '平均首次响应耗时', dictKey: 'avg_first_response', value: '1.8s', benchmark: '3.0s', status: 'good' },
  { label: '平均 AI 回复耗时', dictKey: 'avg_ai_response', value: '2.4s', benchmark: '5.0s', status: 'good' },
  { label: '知识库命中率', dictKey: 'kb_hit_rate', value: '76.3%', benchmark: '60%', status: 'good' },
  { label: '对话完成率', dictKey: 'chat_completion_rate', value: '68.5%', benchmark: '50%', status: 'good' }
])

function generateHourlyLabels() {
  const labels = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const h = new Date(now.getTime() - i * 3600000)
    labels.push(`${h.getHours().toString().padStart(2, '0')}:00`)
  }
  return labels
}

function initLineChart() {
  if (!lineChartRef.value) return
  lineChart = echarts.init(lineChartRef.value)

  const hours = generateHourlyLabels()
  const firstCharTime = [980, 1050, 920, 1100, 880, 1200, 960, 1040, 900, 1150, 870, 1100]
  const fullResponseTime = [3200, 3600, 2900, 4100, 2800, 4500, 3100, 3800, 3000, 4200, 2700, 3900]

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let html = `<strong>${params[0].axisValue}</strong><br/>`
        params.forEach(p => {
          html += `${p.marker} ${p.seriesName}: <strong>${p.value}ms</strong><br/>`
        })
        return html
      }
    },
    legend: {
      data: ['首字响应时间', '完整回复时间'],
      top: 0,
      textStyle: { fontSize: 12, color: '#666' }
    },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: '#e4e7ef' } },
      axisLabel: { fontSize: 11, color: '#999' }
    },
    yAxis: {
      type: 'value',
      name: 'ms',
      nameTextStyle: { fontSize: 11, color: '#bbb' },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { fontSize: 11, color: '#999' }
    },
    series: [
      {
        name: '首字响应时间',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: firstCharTime,
        lineStyle: { color: '#409eff', width: 2 },
        itemStyle: { color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.25)' },
            { offset: 1, color: 'rgba(64,158,255,0.02)' }
          ])
        }
      },
      {
        name: '完整回复时间',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: fullResponseTime,
        lineStyle: { color: '#e6a23c', width: 2 },
        itemStyle: { color: '#e6a23c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(230,162,60,0.2)' },
            { offset: 1, color: 'rgba(230,162,60,0.02)' }
          ])
        }
      }
    ]
  }

  lineChart.setOption(option)
}

function initFunnelChart() {
  if (!funnelChartRef.value) return
  funnelChart = echarts.init(funnelChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name}<br/>${p.value}%`
    },
    legend: { show: false },
    grid: { left: 60, right: 60, top: 20, bottom: 20 },
    series: [
      {
        name: '漏斗图',
        type: 'funnel',
        left: '10%',
        top: 20,
        bottom: 20,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 4,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}\n{c}%',
          fontSize: 12,
          color: '#fff'
        },
        labelLine: { show: false },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2
        },
        data: [
          { value: 100, name: '会话总数', itemStyle: { color: '#5470c6' } },
          { value: 80, name: '展现快捷问题', itemStyle: { color: '#91cc75' } },
          { value: 45, name: '客户点击', itemStyle: { color: '#fac858' } },
          { value: 30, name: '解决问题', itemStyle: { color: '#ef6567' } }
        ]
      }
    ]
  }

  funnelChart.setOption(option)
}

function handleResize() {
  lineChart?.resize()
  funnelChart?.resize()
}

onMounted(() => {
  initLineChart()
  initFunnelChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  funnelChart?.dispose()
})
</script>

<template>
  <div class="performance-page">
    <div class="perf-stats">
      <el-card
        v-for="(stat, index) in perfStats"
        :key="index"
        class="perf-card"
        :class="`perf-card--${stat.status}`"
        shadow="hover"
      >
        <div class="perf-label">
          <span>{{ stat.label }}</span>
          <InfoLabel :dict-key="stat.dictKey" />
        </div>
        <div class="perf-value">{{ stat.value }}</div>
        <div class="perf-benchmark">基准：{{ stat.benchmark }}</div>
      </el-card>
    </div>

    <div class="charts-grid">
      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="chart-header">
            <el-icon :size="16"><TrendCharts /></el-icon>
            <span>大模型响应耗时趋势图</span>
            <span class="chart-sub">近 12 小时</span>
          </div>
        </template>
        <div ref="lineChartRef" class="echarts-container" />
      </el-card>

      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="chart-header">
            <el-icon :size="16"><Lightning /></el-icon>
            <span>猜你想问点击率漏斗图</span>
          </div>
        </template>
        <div ref="funnelChartRef" class="echarts-container" />
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.performance-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.perf-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.perf-card {
  border-radius: 8px;
  transition: transform 0.2s;
}

.perf-card:hover {
  transform: translateY(-2px);
}

.perf-card--good { border-left: 4px solid #67c23a; }

.perf-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.perf-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  line-height: 1;
  margin-bottom: 6px;
}

.perf-benchmark {
  font-size: 12px;
  color: #bbb;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.chart-card {
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.chart-sub {
  font-size: 12px;
  color: #bbb;
  font-weight: 400;
  margin-left: 4px;
}

.echarts-container {
  width: 100%;
  height: 300px;
}
</style>