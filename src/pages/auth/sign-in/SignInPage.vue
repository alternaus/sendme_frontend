<script lang="ts">
import { defineComponent, onMounted } from 'vue'
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
      try {
        await authStore.login(values.email, values.password)
      } catch {
      }
    })

    const handleGoogleLogin = async () => {
      try {
        const { url } = await authService.getOAuthUrl('google')
        window.location.href = url
      } catch {
      }
    }

    function goToForgotPassword() {
      router.push('/auth/forgot-password')
    }

    const oneTapCallback = async (response: { credential: string }) => {

      const data = await authService.handleGoogleOneTap(response.credential)

      authStore.setAuthData(data.accessToken, data.refreshToken || '')

      const userData = await authService.me()
      authStore.user = userData
      localStorage.setItem('user', JSON.stringify(userData))

      router.push('/')

    }
    return {
      email,
      password,
      errors,
      onSubmit,
      handleGoogleLogin,
      goToForgotPassword,
      callbackUrl,
      oneTapCallback
    }
  },
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex justify-center items-center gap-6 flex-col w-full">
    <AppInput v-model="email" :error-message="errors.email" :placeholder="$t('auth.sign_in.email_placeholder')" />

    <AppInputPassword v-model="password" :error-message="errors.password" :placeholder="$t('auth.sign_in.password_placeholder')" />

    <AppButton type="submit" :label="$t('auth.sign_in.enter')" class="w-full" />

    <AppLink severity="secondary" :label="$t('auth.forgot_password.title')" @click="goToForgotPassword" />

    <AppDivider />

    <div class="w-full grid grid-cols-1 gap-4">
      <AppButton :label="$t('auth.oauth.google_button')" severity="contrast" variant="outlined" @click="handleGoogleLogin">
        <template #icon-start>
          <GoogleIcon class="w-5 h-5" />
        </template>
      </AppButton>

    </div>
  </form>
</template>
