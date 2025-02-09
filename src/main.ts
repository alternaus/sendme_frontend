import './assets/scss/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'

import App from './App.vue'
import router from './router'
import { Ripple, Tooltip } from 'primevue'
import { AppTheme } from './theme/app-theme'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
  theme: {
    preset: AppTheme,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
    },
  },
})

app.directive('tooltip', Tooltip)
app.directive('ripple', Ripple)

app.mount('#app')
