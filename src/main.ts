import './assets/scss/main.css'

import { createApp } from 'vue'

import { ConfirmationService, Ripple, ToastService, Tooltip } from 'primevue'
import PrimeVue from 'primevue/config'

import { createHead } from '@unhead/vue/client'
import { createPinia } from 'pinia'
import vue3GoogleLogin from 'vue3-google-login'

import { instanceI18n } from '@/plugins/i18n'
import { useThemeStore } from '@/stores/themeStore'

import App from './App.vue'
import router from './router'
import { AppTheme } from './theme/app-theme'

const pinia = createPinia()
const app = createApp(App)
const head = createHead()

app.use(head)
app.use(ToastService)

app.use(pinia)

useThemeStore(pinia)

app.use(router)

app.use(vue3GoogleLogin, {
  clientId: '916028257398-48219o2n9561ggv5kf7qf70sihe82lvd.apps.googleusercontent.com'
})

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

app.use(ConfirmationService)

app.directive('tooltip', Tooltip)
app.directive('ripple', Ripple)

app.mount('#app')
