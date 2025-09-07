<script setup lang="ts">
import { onMounted,ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInputPassword from '@/components/atoms/inputs/AppInputPassword.vue'
import AppLink from '@/components/atoms/links/AppLink.vue'
import { useAuthService } from '@/services/auth/useAuthService'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authService = useAuthService()
const toast = useToast()

const isLoading = ref(false)
const isSuccess = ref(false)
const token = ref('')
const email = ref('')

// Configurar validaciones
yup.setLocale({
  mixed: {
    required: () => t('auth.validation.password_required'),
  },
  string: {
    min: (params) => t('auth.validation.password_min_length', { min: params.min }),
  },
})

const validationSchema = yup.object({
  password: yup.string().required().min(8),
  confirmPassword: yup.string()
    .required()
    .oneOf([yup.ref('password')], t('auth.reset_password.passwords_must_match')),
})

const { defineField, errors, handleSubmit } = useForm({
  validationSchema,
})

const [password] = defineField('password')
const [confirmPassword] = defineField('confirmPassword')

onMounted(() => {
  token.value = route.query.token as string || ''

  if (!token.value) {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('auth.reset_password.invalid_token'),
      life: 5000
    })
    router.push('/auth/sign-in')
  }
})

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true

  try {
    await authService.resetPassword({
      token: token.value,
      newPassword: values.password,
    })

    // Mostrar estado de éxito
    isSuccess.value = true

    toast.add({
      severity: 'success',
      summary: t('general.success'),
      detail: t('auth.reset_password.success_title'),
      life: 8000
    })

    // Redirigir al login después de mostrar el mensaje de éxito
    setTimeout(() => {
      router.push('/auth/sign-in')
    }, 5000)

  } catch {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('auth.reset_password.error_message'),
      life: 5000
    })
  } finally {
    isLoading.value = false
  }
})

function goBackToLogin() {
  router.push('/auth/sign-in')
}
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <!-- Mensaje de éxito -->
    <div v-if="isSuccess" class="text-center p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
          <i class="pi pi-check text-2xl text-green-600 dark:text-green-400"></i>
        </div>
      </div>
      <h2 class="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
        {{ t('auth.reset_password.success_title') }}
      </h2>
      <p class="text-green-700 dark:text-green-300 mb-4">
        {{ t('auth.reset_password.success_message', { email }) }}
      </p>
      <p class="text-sm text-green-600 dark:text-green-400">
        {{ t('auth.reset_password.redirecting_message') }}
      </p>
    </div>

    <!-- Contenido normal (oculto cuando hay éxito) -->
    <div v-else>
      <!-- Header -->
      <div class="text-center">
        <p class="text-surface-600 dark:text-surface-400">
          {{ t('auth.reset_password.description') }}
        </p>
        <p class="text-sm text-surface-500 dark:text-surface-500 mt-2">
          {{ email }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="onSubmit" class="flex flex-col gap-6 mt-6">
        <AppInputPassword
          v-model="password"
          :error-message="errors.password"
          :label="t('auth.reset_password.new_password_label')"
        />

        <AppInputPassword
          v-model="confirmPassword"
          :error-message="errors.confirmPassword"
          :label="t('auth.reset_password.confirm_password_label')"
        />

        <AppButton
          type="submit"
          :label="isLoading ? t('general.loading') : t('auth.reset_password.submit_button')"
          :loading="isLoading"
          :disabled="isLoading"
          class="w-full"
        />
      </form>

      <!-- Back to login -->
      <div class="text-center">
        <AppLink
          :label="t('auth.reset_password.back_to_login')"
          @click="goBackToLogin"
        />
      </div>
    </div>
  </div>
</template>
