import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'
import './style.css'
import './styles/pro-design.scss'
import './styles/global.scss'
import { trackEvent } from './utils/monitor'
import { vPermission } from './directives/permission'
import ProAvatar from './components/ProAvatar/index.vue'
import ProHelp from './components/ProHelp/index.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.directive('permission', vPermission)
app.component('ProAvatar', ProAvatar)
app.component('ProHelp', ProHelp)

app.provide('trackEvent', trackEvent)

app.mount('#app')