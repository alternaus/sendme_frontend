<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import { useWhatsAppService } from '@/services/whatsapp/useWhatsAppService'

interface FacebookSDK {
  init: (config: {
    appId: string
    autoLogAppEvents: boolean
    xfbml: boolean
    version: string
  }) => void
  login: (callback: (response: FacebookLoginResponse) => void, options?: FacebookLoginOptions) => void
}

interface FacebookLoginOptions {
  scope?: string
  config_id?: string
  response_type?: string
  override_default_response_type?: boolean
  extras?: {
    feature?: string
    featureType?: string
  }
}

interface FacebookLoginResponse {
  authResponse?: {
    accessToken?: string
    userID?: string
    code?: string
  }
}

declare global {
  interface Window {
    FB?: FacebookSDK
  }
}

export default defineComponent({
  name: 'WhatsAppEmbeddedSignupPage',
  components: {
    Message
  },
  setup() {
    const isLoading = ref(true)
    const isConnecting = ref(false)
    const toast = useToast()
    const { t } = useI18n()
    const { connect } = useWhatsAppService()

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

    const handleFacebookResponse = async (res: FacebookLoginResponse) => {
      isConnecting.value = false

      const code = res?.authResponse?.code
      if (!code) {
        toast.add({
          severity: 'error',
          summary: t('whatsapp.signup.messages.no_authorization_code.summary'),
          detail: t('whatsapp.signup.messages.no_authorization_code.detail'),
          life: 5000
        })
        return
      }

      try {
        // enviar el "code" a tu backend (intercambio seguro)
        await connect(code)

        toast.add({
          severity: 'success',
          summary: t('whatsapp.signup.messages.connection_success.summary'),
          detail: t('whatsapp.signup.messages.connection_success.detail'),
          life: 5000
        })
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : t('whatsapp.signup.messages.connection_error.detail')
        toast.add({
          severity: 'error',
          summary: t('whatsapp.signup.messages.connection_error.summary'),
          detail: errorMessage,
          life: 5000
        })
      }
    }

    const connectWhatsApp = () => {
      if (!window.FB) {
        toast.add({
          severity: 'error',
          summary: t('whatsapp.signup.messages.sdk_not_available.summary'),
          detail: t('whatsapp.signup.messages.sdk_not_available.detail'),
          life: 5000
        })
        return
      }

      isConnecting.value = true

      window.FB.login(
        (res: FacebookLoginResponse) => {
          // Llama a la función async sin usar await aquí
          handleFacebookResponse(res).catch(err => {
            console.error('Error in Facebook response handler:', err)
            isConnecting.value = false
          })
        },
        {
          // *** CLAVE para Embedded Signup ***
          config_id: import.meta.env.VITE_WHATSAPP_CONFIGURATION_ID, // tu "Facebook Login for Business > Configuration"
          scope: 'business_management,whatsapp_business_management,whatsapp_business_messaging',
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            feature: 'whatsapp_embedded_signup',
            // Opcional: si quieres sólo compartir WABA y agregar el número luego por API:
            // featureType: 'only_waba_sharing'
          }
        }
      )
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
      connectWhatsApp,
      t
    }
  }
})
</script>

<template>
  <div class="whatsapp-signup-container">
    <div class="max-w-md mx-auto p-4">
      <!-- Header -->
      <div class="text-center mb-4">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t('whatsapp.signup.title') }}
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          {{ t('whatsapp.signup.description') }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-6">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
        <p class="text-xs text-gray-600 dark:text-gray-300">{{ t('whatsapp.signup.loading') }}</p>
      </div>

      <!-- Main Content -->
      <div v-else class="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4">
        <!-- WhatsApp Icon -->
        <div class="text-center mb-4">
          <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white">
            {{ t('whatsapp.signup.connect_account') }}
          </h2>
        </div>

        <!-- Connect Button -->
        <div class="text-center mb-4">
          <button
            @click="connectWhatsApp"
            :disabled="isConnecting"
            class="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 flex items-center justify-center mx-auto text-sm"
          >
            <div v-if="isConnecting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {{ isConnecting ? t('whatsapp.signup.connecting') : t('whatsapp.signup.connect_whatsapp') }}
          </button>
        </div>

        <!-- Info -->
        <div class="mt-4">
          <Message size="small" severity="info" :closable="false">
            <template #icon>
              <i class="pi pi-info-circle"></i>
            </template>
            {{ t('whatsapp.signup.info.message') }}
          </Message>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.whatsapp-signup-container {
  padding: 1rem 0;
  min-height: auto;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Small view optimizations */
@media (max-width: 480px) {
  .whatsapp-signup-container {
    padding: 0.5rem 0;
  }

  .max-w-md {
    max-width: 100%;
    margin: 0 1rem;
  }
}
</style>
