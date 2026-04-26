import { defineStore } from 'pinia'
import { fetchMetricsDict } from '@/api/dict'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    metricsDict: {}
  }),
  actions: {
    async initSystemDict() {
      try {
        const dict = await fetchMetricsDict()
        this.metricsDict = dict
      } catch (error) {
        console.error('初始化系统字典失败:', error)
      }
    }
  }
})