<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import { googleOneTap } from "vue3-google-login"
import * as yup from 'yup'

import GoogleIcon from '@/assets/svg/google.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppDivider from '@/components/atoms/divider/AppDivider.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppInputPassword from '@/components/atoms/inputs/AppInputPassword.vue'
import AppLink from '@/components/atoms/links/AppLink.vue'
import { BASE_URL } from '@/helpers/api-url.helper'
import { useAuthService } from '@/services/auth/useAuthService'
import { useAuthStore } from '@/stores/useAuthStore'


export default defineComponent({
  components: {
    AppInput,
    AppInputPassword,
    AppButton,
    AppLink,
    AppDivider,
    GoogleIcon
  },
  setup() {

    onMounted(async () => {
      const res = await googleOneTap()
      oneTapCallback(res)

    })

    const { t } = useI18n()
    const router = useRouter()
    const authStore = useAuthStore()
  const authService = useAuthService()

  const isSubmitting = ref(false)
  const isOAuthLoading = ref(false)


    const callbackUrl = `${BASE_URL}/auth/google/callback`

    yup.setLocale({
      mixed: {
        required: () => t('auth.validation.email_required'),
      },
      string: {
        email: () => t('auth.validation.email_invalid'),
      },
    })

    const schema = yup.object({
      email: yup.string().email().required().label(t('auth.common.email')),
      password: yup.string().required().label(t('auth.common.password')),
    })

    const { defineField, handleSubmit, errors } = useForm({
      validationSchema: schema,
      initialValues: {
        email: '',
        password: '',
      },
    })

    const [email] = defineField('email')
    const [password] = defineField('password')

    const onSubmit = handleSubmit(async (values) => {
      isSubmitting.value = true
      try {
        await authStore.login(values.email, values.password)
      } catch {
      } finally {
        isSubmitting.value = false
      }
    })

    const handleGoogleLogin = async () => {
      try {
        isOAuthLoading.value = true
        // Guardar ruta actual para retorno post-auth
        localStorage.setItem('googleAuthReturnPath', router.currentRoute.value.fullPath)
        const { url } = await authService.getOAuthUrl('google')
        window.location.href = url
      } catch {
        isOAuthLoading.value = false
      }
    }

    function goToForgotPassword() {
      router.push('/auth/forgot-password')
    }

    function goToSignUp() {
      router.push('/auth/sign-up')
    }

    const oneTapCallback = async (response: { credential: string }) => {
      try {
        isOAuthLoading.value = true
        const data = await authService.handleGoogleOneTap(response.credential)
        authStore.setAuthData(data.accessToken, data.refreshToken || '')
        const userData = await authService.me()
        authStore.user = userData
        localStorage.setItem('user', JSON.stringify(userData))
        router.push('/')
      } catch {
        isOAuthLoading.value = false
      }
    }
    return {
      email,
      password,
      errors,
      onSubmit,
      handleGoogleLogin,
      goToForgotPassword,
      goToSignUp,
      callbackUrl,
      oneTapCallback,
      isSubmitting,
      isOAuthLoading
    }
  },
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex justify-center items-center gap-6 flex-col w-full" :aria-busy="isSubmitting || isOAuthLoading">
    <AppInput v-model="email" :error-message="errors.email" :placeholder="$t('auth.sign_in.email_placeholder')" :disabled="isSubmitting || isOAuthLoading" />

    <AppInputPassword v-model="password" :error-message="errors.password" :placeholder="$t('auth.sign_in.password_placeholder')" :disabled="isSubmitting || isOAuthLoading" />

    <AppButton type="submit" :label="isSubmitting ? $t('auth.sign_in.processing') : $t('auth.sign_in.enter')" :loading="isSubmitting" :disabled="isSubmitting || isOAuthLoading" class="w-full" />

  <AppLink severity="secondary" :label="$t('auth.forgot_password.title')" :disabled="isSubmitting || isOAuthLoading" @click="!(isSubmitting || isOAuthLoading) && goToForgotPassword()" />

  <AppLink severity="secondary" :label="$t('auth.layout.register_here')" :disabled="isSubmitting || isOAuthLoading" @click="!(isSubmitting || isOAuthLoading) && goToSignUp()" />

    <AppDivider />

    <div class="w-full grid grid-cols-1 gap-4">
      <AppButton :label="isOAuthLoading ? $t('auth.common.loading') : $t('auth.oauth.google_button')" severity="contrast" variant="outlined" :loading="isOAuthLoading" :disabled="isSubmitting || isOAuthLoading" @click="handleGoogleLogin">
        <template #icon-start>
          <GoogleIcon class="w-5 h-5" />
        </template>
      </AppButton>

    </div>
  </form>
</template>
