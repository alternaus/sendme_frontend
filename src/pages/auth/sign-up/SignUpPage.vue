<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppInputPassword from '@/components/atoms/inputs/AppInputPassword.vue'
import AppLink from '@/components/atoms/links/AppLink.vue'
import { useAuthService } from '@/services/auth/useAuthService'
import { useAuthStore } from '@/stores/useAuthStore'

export default defineComponent({
  components: {
    AppInput,
    AppInputPassword,
    AppButton,
    AppLink
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const authStore = useAuthStore()
    const authService = useAuthService()

    const isSubmitting = ref(false)

    yup.setLocale({
      mixed: {
        required: () => t('auth.validation.name_required'),
      },
      string: {
        email: () => t('auth.validation.email_invalid'),
        min: ({ min }: { min: number }) => t('auth.validation.password_min_length', { min }),
      },
    })

    const schema = yup.object({
      name: yup.string().required().label(t('auth.common.name')),
      email: yup.string().email().required().label(t('auth.common.email')),
      password: yup.string().min(8).required().label(t('auth.common.password')),
      confirmPassword: yup.string()
        .required()
        .oneOf([yup.ref('password')], t('auth.validation.passwords_no_match'))
        .label(t('auth.sign_up.confirm_password')),
    })

    const { defineField, handleSubmit, errors } = useForm({
      validationSchema: schema,
      initialValues: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
    })

    const [name] = defineField('name')
    const [email] = defineField('email')
    const [password] = defineField('password')
    const [confirmPassword] = defineField('confirmPassword')

    const onSubmit = handleSubmit(async (values) => {
      isSubmitting.value = true
      try {
        const signUpData = {
          name: values.name,
          email: values.email,
          password: values.password
        }

        const response = await authService.signUp(signUpData)

        // Configurar los tokens de autenticación
        authStore.setAuthData(response.accessToken, response.refreshToken || '')

        // Obtener información del usuario
        const userData = await authService.me()
        authStore.user = userData
        localStorage.setItem('user', JSON.stringify(userData))

        // Redirigir al dashboard
        router.push('/')
      } catch (error) {
        console.error('Error en registro:', error)
      } finally {
        isSubmitting.value = false
      }
    })

    function goToSignIn() {
      router.push('/auth/sign-in')
    }

    return {
      name,
      email,
      password,
      confirmPassword,
      errors,
      onSubmit,
      goToSignIn,
      isSubmitting
    }
  },
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex justify-center items-center gap-6 flex-col w-full" :aria-busy="isSubmitting">
    <AppInput
      v-model="name"
      :error-message="errors.name"
      :placeholder="$t('auth.sign_up.name_placeholder')"
      :disabled="isSubmitting"
    />

    <AppInput
      v-model="email"
      :error-message="errors.email"
      :placeholder="$t('auth.sign_up.email_placeholder')"
      :disabled="isSubmitting"
    />

    <AppInputPassword
      v-model="password"
      :error-message="errors.password"
      :placeholder="$t('auth.sign_up.password_placeholder')"
      :disabled="isSubmitting"
    />

    <AppInputPassword
      v-model="confirmPassword"
      :error-message="errors.confirmPassword"
      :placeholder="$t('auth.sign_up.confirm_password_placeholder')"
      :disabled="isSubmitting"
    />

    <AppButton
      type="submit"
      :label="isSubmitting ? $t('auth.sign_up.processing') : $t('auth.sign_up.create_account')"
      :loading="isSubmitting"
      :disabled="isSubmitting"
      class="w-full"
    />

    <AppLink
      severity="secondary"
      class="!ml-auto !w-auto"
      :label="$t('auth.sign_up.already_have_account')"
      :disabled="isSubmitting"
      theme="auth"
      @click="!isSubmitting && goToSignIn()"
    />
  </form>
</template>
