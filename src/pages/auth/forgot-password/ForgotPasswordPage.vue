<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppLink from '@/components/atoms/links/AppLink.vue'
import { useAuthService } from '@/services/auth/useAuthService'

const { t } = useI18n()
const router = useRouter()
const authService = useAuthService()
const toast = useToast()

const isLoading = ref(false)

// Configurar validaciones
yup.setLocale({
  mixed: {
    required: () => t('general.required_field'),
  },
  string: {
    email: () => t('general.invalid_email'),
  },
})

const validationSchema = yup.object({
  email: yup.string().required().email(),
})

const { defineField, errors, handleSubmit } = useForm({
  validationSchema,
})

const [email] = defineField('email')

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true

  try {
    await authService.forgotPassword({
      email: values.email,
    })

    toast.add({
      severity: 'success',
      summary: t('general.success'),
      detail: t('auth.reset_link_sent'),
      life: 5000
    })

    // Opcional: redirigir de vuelta al login después de un tiempo
    setTimeout(() => {
      router.push('/auth/sign-in')
    }, 3000)

  } catch {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('auth.reset_link_error'),
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
    <!-- Header -->
    <div class="text-center">
      <p class="text-surface-600 dark:text-surface-400">
        {{ t('auth.forgot_password_description') }}
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
      <AppInput
        v-model="email"
        :error-message="errors.email"
        :label="t('general.email')"
        type="email"
      />

      <AppButton
        type="submit"
        :label="isLoading ? t('general.loading') : t('auth.send_reset_link')"
        :loading="isLoading"
        :disabled="isLoading"
        class="w-full"
      />
    </form>

    <!-- Back to login -->
    <div class="text-center">
      <AppLink
        :label="t('auth.back_to_login')"
        @click="goBackToLogin"
      />
    </div>
  </div>
</template>
