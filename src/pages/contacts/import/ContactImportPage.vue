<template>
  <AppHeader :text="$t('contact.import_contacts')" :icon="IconTypes.IMPORT" :actions="[]" />

  <AppCard>
    <template #content>
      <div class="flex justify-content-center mb-4">
        <AppSelectButton v-model="importType" :options="importOptions" optionLabel="name" optionValue="value"
          class="mx-auto" :allowEmpty="false">
          <template #option="slotProps">
            <span>
              <i :class="slotProps.option.icon" style="margin-right:8px" />
              {{ slotProps.option.name }}
            </span>
          </template>
        </AppSelectButton>
      </div>

      <div class="flex justify-content-center" v-if="importType === 'google'">
          <AppButton v-if="googleAuthStatus?.hasValidTokens" :label="t('contact.import.google_import_button')"
            icon="pi pi-cloud-upload" size="small" :loading="loading" @click="handleGoogleImport"
            class="mb-2 mx-auto! w-auto!" />
          <AppButton v-else :label="t('contact.import.google_connect_button')" icon="pi pi-google" size="small"
            @click="handleGoogleConnect" class="mb-2 mx-auto! w-auto!" />
          <p v-if="googleAuthStatus?.message" class="text-sm text-gray-600 mt-2">
            {{ googleAuthStatus.message }}
          </p>
      </div>
      <div v-else>
        <UploadFile />
      </div>

    </template>
  </AppCard>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppSelectButton from '@/components/atoms/buttons/AppSelectButton.vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import type { IGoogleAuthStatus } from '@/services/auth/interfaces/google-auth.interface'
import { useAuthService } from '@/services/auth/useAuthService'
import { useContactService } from '@/services/contact/useContactService'

import UploadFile from '../components/UploadFile.vue'

export default defineComponent({
  components: {
    AppHeader,
    AppCard,
    UploadFile,
    AppSelectButton,
    AppButton,
  },
  setup() {
    const toast = useToast()
    const { t } = useI18n()
    const { syncGoogleContacts } = useContactService()
    const { checkGoogleAuthStatus, getGoogleAuthUrl } = useAuthService()
    const importType = ref<'google' | 'excel'>('excel')
    const importOptions = [
      { name: t('contact.import.import_option_google'), value: 'google', icon: 'pi pi-google' },
      { name: t('contact.import.import_option_excel'), value: 'excel', icon: 'pi pi-file-excel' }
    ]
    const loading = ref(false)
    const googleAuthStatus = ref<IGoogleAuthStatus | null>(null)
    const result = ref<{ imported: number; created: number; updated: number } | null>(null)

    const checkGoogleAuth = async () => {
      try {
        const response = await checkGoogleAuthStatus()
        googleAuthStatus.value = response
      } catch {
        googleAuthStatus.value = {
          hasValidTokens: false,
          reauthUrl: '',
          message: 'Error al verificar el estado de autenticación de Google'
        }
      }
    }

    const handleGoogleConnect = async () => {
      try {
        const response = await getGoogleAuthUrl()
        localStorage.setItem('googleAuthReturnPath', '/contacts/import')
        window.location.href = response.url
      } catch {
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('contact.import.google_connect_error'),
          life: 4000
        })
      }
    }

    const handleGoogleImport = async () => {
      loading.value = true
      result.value = null

      try {
        const status = await checkGoogleAuthStatus()

        if (!status.hasValidTokens) {
          throw new Error('No tiene tokens válidos de Google')
        }

        toast.add({
          severity: 'info',
          summary: t('general.processing'),
          detail: t('contact.import.google_sync_processing'),
          life: 3000
        })

        const res = await syncGoogleContacts()

        result.value = {
          imported: Number(res.imported ?? 0),
          created: Number(res.created ?? 0),
          updated: Number(res.updated ?? 0),
        }

        toast.add({
          severity: 'success',
          summary: t('general.success'),
          detail: t('contact.import.google_sync_success', { count: result.value.imported }),
          life: 4000
        })

      } catch (error: unknown) {
        console.error('Error en sincronización:', error)

        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

        if (errorMessage.includes('No tiene tokens válidos')) {
          await handleGoogleConnect()
        } else {
          toast.add({
            severity: 'error',
            summary: t('general.error'),
            detail: t('contact.import.google_sync_error', { message: errorMessage }),
            life: 4000
          })
        }
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      if (importType.value === 'google') {
        checkGoogleAuth()
      }
    })

    watch(importType, (newType) => {
      if (newType === 'google') {
        checkGoogleAuth()
      }
    })

    return {
      IconTypes,
      importType,
      importOptions,
      loading,
      result,
      googleAuthStatus,
      handleGoogleImport,
      handleGoogleConnect,
      t,
    }
  },
})
</script>
