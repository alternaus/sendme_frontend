<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import type {
  CreateEmailConfigurationDto,
  EmailConfigurationResponseDto,
  UpdateEmailConfigurationDto
} from '@/services/email-configuration/emailConfigurationTypes'
import { useMailProviderService } from '@/services/email-configuration/useMailProviderService'
import { MessageChannel } from '@/services/send/interfaces/message.interface'
import { useSendService } from '@/services/send/useSendService'

import { useMailProviderForm } from './composables/useMailProviderForm'

const { t } = useI18n()
const toast = useToast()
const { form, handleSubmit, setValues, resetForm, errors } = useMailProviderForm()
const { getEmailConfigurations, createEmailConfiguration, updateEmailConfiguration } = useMailProviderService()
const { sendBatchMessage } = useSendService()

const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const currentId = ref<number | null>(null)

// Opciones de puerto SMTP con mapeo de seguridad
const portSecurityMap = {
  587: false, // TLS
  465: true,  // SSL
  25: false   // Sin cifrado
}

const portOptions = computed(() => [
  { name: t('email_configuration.port_587_tls'), value: 587 },
  { name: t('email_configuration.port_465_ssl'), value: 465 },
  { name: t('email_configuration.port_25_plain'), value: 25 }
])

onMounted(async () => {
  loading.value = true
  try {
    const res = await getEmailConfigurations()
    const list: EmailConfigurationResponseDto[] = Array.isArray(res) ? res : []
    const item = list?.[0]
    if (item) {
      currentId.value = (item).id as number
      setValues({
        name: (item).name,
        host: (item).host,
        port: (item).port,
        secure: (item).secure,
        username: (item).username,
        password: '',
        fromEmail: (item).fromEmail,
        fromName: (item).fromName,
        isDefault: true,
        isActive: true,
      })
    }
  } finally {
    loading.value = false
  }
})


// Actualizar secure cuando cambie el puerto
watch(() => form.port.value, (port) => {
  if (port && port in portSecurityMap) {
    form.secure.value = portSecurityMap[port as keyof typeof portSecurityMap]
  }
})



// Computed para validaciones
const isFormValid = computed(() => {
  return !errors.value.name && !errors.value.host && !errors.value.username && !errors.value.password &&
         !errors.value.fromEmail && !errors.value.fromName && !errors.value.port &&
         form.name.value && form.host.value && form.username.value &&
         form.fromEmail.value && form.fromName.value && form.port.value
})

const onSubmit = handleSubmit(async (values) => {
  saving.value = true
  try {
    if (currentId.value) {
      const updatePayload: UpdateEmailConfigurationDto = {
        name: values.name,
        host: values.host,
        port: values.port ?? undefined,
        secure: values.secure,
        username: values.username,
        fromEmail: values.fromEmail,
        fromName: values.fromName,
        isDefault: true,
        isActive: true,
        ...(values.password ? { password: values.password } : {}),
      } as unknown as UpdateEmailConfigurationDto

      await updateEmailConfiguration(currentId.value, updatePayload)
      toast.add({ severity: 'success', summary: 'Guardado', detail: 'Configuración actualizada', life: 2500 })
    } else {
      const createPayload: CreateEmailConfigurationDto = {
        name: values.name,
        host: values.host,
        port: values.port ?? 587,
        secure: values.secure,
        username: values.username,
        password: values.password,
        fromEmail: values.fromEmail,
        fromName: values.fromName,
        isDefault: true,
        isActive: true,
      } as unknown as CreateEmailConfigurationDto

      const created = await createEmailConfiguration(createPayload)
      const createdData: EmailConfigurationResponseDto = (created)
      currentId.value = (createdData).id as number
      toast.add({ severity: 'success', summary: 'Guardado', detail: 'Configuración creada', life: 2500 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar', life: 3000 })
  } finally {
    saving.value = false
  }
})

const testConfiguration = handleSubmit(async (values) => {
  testing.value = true
  try {
    // Crear el mensaje de prueba usando el servicio de envío
    const testMessage = {
      channel: MessageChannel.EMAIL,
      message: t('email_configuration.test_email_body', {
        date: new Date().toLocaleString()
      }),
      subject: t('email_configuration.test_email_subject'),
      contacts: [values.fromEmail],
      sendToAll: false
    }

    const result = await sendBatchMessage(testMessage)

    if (result) {
      toast.add({
        severity: 'success',
        summary: t('email_configuration.test_success'),
        detail: 'Email enviado correctamente',
        life: 3000
      })
    } else {
      throw new Error('Send failed')
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: t('email_configuration.test_error'),
      detail: 'Verifica los datos de configuración',
      life: 4000
    })
  } finally {
    testing.value = false
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <form @submit.prevent="onSubmit" class="space-y-2">
          <!-- Sección: Información General -->
      <div class="space-y-2">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ $t('email_configuration.general_information') }}
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Nombre de la configuración - Ancho completo en móvil, mitad en desktop -->
          <div class="space-y-1 col-span-2">
            <AppInput
              v-model="form.name.value"
              :error-message="errors.name"
              :placeholder="$t('email_configuration.name')"
            />
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ $t('email_configuration.name_description') }}
            </p>
          </div>

          <!-- Campo vacío para equilibrar el grid -->
          <div class="hidden lg:block"></div>
        </div>
      </div>

          <!-- Sección: Configuración del Remitente -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ $t('email_configuration.sender_configuration') }}
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Nombre del remitente -->
          <div class="space-y-1">
            <AppInput
              v-model="form.fromName.value"
              :error-message="errors.fromName"
              :placeholder="$t('email_configuration.from_name')"
            />
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ $t('email_configuration.from_name_description') }}
            </p>
          </div>

          <!-- Email del remitente -->
          <div class="space-y-1">
            <AppInput
              v-model="form.fromEmail.value"
              :error-message="errors.fromEmail"
              type="email"
              :placeholder="$t('email_configuration.from_email')"
            />
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ $t('email_configuration.from_email_description') }}
            </p>
          </div>
        </div>
      </div>

          <!-- Sección: Autenticación SMTP -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ $t('email_configuration.smtp_authentication') }}
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Nombre de usuario -->
          <div class="space-y-1">
            <AppInput
              v-model="form.username.value"
              :error-message="errors.username"
              :placeholder="$t('email_configuration.username')"
            />
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ $t('email_configuration.username_description') }}
            </p>
          </div>

          <!-- Contraseña -->
          <div class="space-y-1">
            <AppInput
              v-model="form.password.value"
              :error-message="errors.password"
              type="password"
              :placeholder="$t('email_configuration.password')"
            />
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ $t('email_configuration.password_description') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Sección: Configuración del Servidor -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ $t('email_configuration.server_configuration') }}
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Servidor SMTP - Más ancho -->
          <div class="space-y-1 lg:col-span-2">
            <AppInput
              v-model="form.host.value"
              :error-message="errors.host"
              :placeholder="$t('email_configuration.smtp_host')"
            />
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ $t('email_configuration.smtp_host_description') }}
            </p>
          </div>

          <div class="space-y-1">
            <AppSelect
              v-model="form.port.value"
              :error-message="errors.port"
              :options="portOptions"
              :placeholder="$t('email_configuration.port')"
            />
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ $t('email_configuration.port_description') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Sección: Acciones -->
      <div class="flex gap-3 pt-2">
        <!-- Botón de guardar -->
        <AppButton
          type="submit"
          class="!w-auto"
          :disabled="saving || loading || testing || !isFormValid"
          severity="primary"
          :label="currentId ? $t('email_configuration.save_changes') : $t('email_configuration.create')"
        />

        <!-- Botón de probar configuración -->
        <AppButton
          type="button"
          :disabled="testing || saving || loading || !isFormValid"
          class="!w-auto ml-auto"
          outlined
          severity="contrast"
          :label="testing ? $t('email_configuration.testing') : $t('email_configuration.test_configuration')"
          @click="testConfiguration"
        />

        <AppButton
          type="button"
          outlined
          class="!w-auto"
          severity="contrast"
          :disabled="saving || testing"
          :label="$t('email_configuration.reset')"
          @click="resetForm()"
        />
      </div>
    </form>
  </div>
</template>


<style scoped>
:deep([data-pc-name="tablist"]) {
  margin-block-end: var(--p-content-padding, 1rem);
  border-radius: 0.75rem;
  /* rounded-lg */
}

:deep([data-pc-name="tab"]) {
  border-radius: 0.75rem;
  /* rounded-lg */
}
</style>
