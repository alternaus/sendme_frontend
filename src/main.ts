import './assets/scss/main.css'

import { createApp } from 'vue'

import { Ripple, ToastService, Tooltip } from 'primevue'
import PrimeVue from 'primevue/config'

import { createPinia } from 'pinia'

import { instanceI18n } from '@/plugins/i18n'

import App from './App.vue'
import router from './router'
import { AppTheme } from './theme/app-theme'

const pinia = createPinia()
const app = createApp(App)
app.use(ToastService)

app.use(pinia)

app.use(router)

app.use(PrimeVue, {
  theme: {
    preset: AppTheme,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark',
    },
  },
})
app.use(instanceI18n)

app.directive('tooltip', Tooltip)
app.directive('ripple', Ripple)

app.mount('#app')
