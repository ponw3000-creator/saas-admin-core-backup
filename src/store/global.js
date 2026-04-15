import { defineStore } from 'pinia'
import { fetchMetricsDict } from '@/api/dict'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    metricsDict: {}
  }),
  actions: {
    async initSystemDict() {
      const dict = await fetchMetricsDict()
      this.metricsDict = dict
    }
  }
})