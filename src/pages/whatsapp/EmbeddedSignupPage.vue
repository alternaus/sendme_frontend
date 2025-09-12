<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

interface FacebookSDK {
  init: (config: {
    appId: string
    autoLogAppEvents: boolean
    xfbml: boolean
    version: string
  }) => void
  login: (callback: (response: FacebookLoginResponse) => void, options?: {
    scope?: string
  }) => void
}

interface FacebookLoginResponse {
  authResponse?: {
    accessToken: string
    userID: string
  }
}

declare global {
  interface Window {
    FB?: FacebookSDK
  }
}

export default defineComponent({
  name: 'WhatsAppEmbeddedSignupPage',
  setup() {
    const isLoading = ref(true)
    const isConnecting = ref(false)

    const loadFacebookSDK = async () => {
      if (document.querySelector('#facebook-jssdk')) {
        return Promise.resolve()
      }

      return new Promise<void>((resolve) => {
        const script = document.createElement('script')
        script.id = 'facebook-jssdk'
        script.src = 'https://connect.facebook.net/en_US/sdk.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => resolve()
        document.head.appendChild(script)
      })
    }

    const initSDK = () => {
      if (window.FB) {
        window.FB.init({
          appId: '384568781143182',
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v23.0'
        })
      }
    }

    const connectWhatsApp = () => {
      if (!window.FB) {
        alert('Facebook SDK no está disponible. Recarga la página.')
        return
      }

      isConnecting.value = true

      window.FB.login((response: FacebookLoginResponse) => {
        isConnecting.value = false

        if (response.authResponse) {
          alert(`✅ ¡WhatsApp Business conectado!

🔑 Access Token: ${response.authResponse.accessToken}
👤 User ID: ${response.authResponse.userID}

Guarda este token para configurar tu integración.`)
        } else {
          alert('❌ No se pudo conectar. Verifica que tu app de Facebook tenga los permisos necesarios.')
        }
      }, {
        scope: 'whatsapp_business_management,whatsapp_business_messaging'
      })
    }

    onMounted(async () => {
      try {
        await loadFacebookSDK()
        setTimeout(() => {
          initSDK()
          isLoading.value = false
        }, 1000)
      } catch {
        isLoading.value = false
      }
    })

    return {
      isLoading,
      isConnecting,
      connectWhatsApp
    }
  }
})
</script>

<template>
  <div class="whatsapp-signup-container">
    <div class="max-w-xl mx-auto p-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          WhatsApp Business
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Conecta tu cuenta de WhatsApp Business para empezar a enviar mensajes
        </p>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando Facebook SDK...</p>
      </div>

      <!-- Main Content -->
      <div v-else class="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
        <!-- WhatsApp Icon -->
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
            Conectar WhatsApp Business
          </h2>
        </div>

        <!-- Connect Button -->
        <div class="text-center mb-6">
          <button
            @click="connectWhatsApp"
            :disabled="isConnecting"
            class="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto"
          >
            <div v-if="isConnecting" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            {{ isConnecting ? 'Conectando...' : 'Conectar con WhatsApp' }}
          </button>
        </div>

        <!-- Info -->
        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div class="text-sm text-blue-700 dark:text-blue-300">
            <p class="font-medium mb-1">ℹ️ Información</p>
            <p>Al hacer click en "Conectar", se abrirá una ventana de Facebook para autorizar el acceso a WhatsApp Business.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.whatsapp-signup-container {
  padding: 2rem 0;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>