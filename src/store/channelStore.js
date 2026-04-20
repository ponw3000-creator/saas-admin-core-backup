import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChannelStore = defineStore('channel', () => {
  const channelList = ref([
    { id: 1, name: '男装小程序', code: 'WX_MINI', isActive: true, createTime: '2026-04-16 10:00:00', appId: 'wx12345678', appSecret: '' },
    { id: 2, name: '女装小程序', code: 'WX_MINI', isActive: true, createTime: '2026-04-15 14:30:00', appId: 'wx87654321', appSecret: '' },
    { id: 3, name: '官网', code: 'WEB', isActive: true, createTime: '2026-04-14 09:00:00', domain: 'https://www.example.com', themeColor: '#409EFF' },
    { id: 4, name: 'iOS App', code: 'APP', isActive: false, createTime: '2026-04-10 11:20:00', packageName: 'com.example.ios', appSecret: '' },
    { id: 5, name: 'H5商城', code: 'H5', isActive: false, createTime: '2026-04-01 08:30:00', domain: 'https://m.example.com', h5Secret: '' }
  ])

  const CHANNEL_TYPE_MAP = {
    WX_MINI: '微信小程序',
    WEB: 'Web网页端',
    APP: 'APP原生端',
    H5: 'H5移动端',
    DOUYIN: '抖音客服',
    XHS: '小红书店铺',
    WX_GZH: '微信公众号'
  }

  const getChannelById = (id) => {
    return channelList.value.find(ch => ch.id === id) || null
  }

  const getChannelName = (id) => {
    const channel = getChannelById(id)
    return channel ? channel.name : '未知渠道'
  }

  const getChannelTypeLabel = (code) => {
    return CHANNEL_TYPE_MAP[code] || code
  }

  const addChannel = (channelData) => {
    const newChannel = {
      id: Date.now(),
      createTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).replace(/\//g, '-'),
      ...channelData
    }
    channelList.value.push(newChannel)
    return newChannel
  }

  const updateChannel = (id, updates) => {
    const index = channelList.value.findIndex(ch => ch.id === id)
    if (index !== -1) {
      channelList.value[index] = { ...channelList.value[index], ...updates }
      return channelList.value[index]
    }
    return null
  }

  const deleteChannel = (id) => {
    const index = channelList.value.findIndex(ch => ch.id === id)
    if (index !== -1) {
      channelList.value.splice(index, 1)
      return true
    }
    return false
  }

  return {
    channelList,
    CHANNEL_TYPE_MAP,
    getChannelById,
    getChannelName,
    getChannelTypeLabel,
    addChannel,
    updateChannel,
    deleteChannel
  }
})
