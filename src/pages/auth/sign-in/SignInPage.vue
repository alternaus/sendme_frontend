<script lang="ts">
import { defineComponent } from 'vue'
import { useScriptTag } from '@vueuse/core'

import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import GoogleIcon from '@/assets/svg/google.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppDivider from '@/components/atoms/divider/AppDivider.vue'
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
    AppLink,
    AppDivider,
    GoogleIcon
  },
  setup() {
    const { t } = useI18n()
    const authStore = useAuthStore()
    const authService = useAuthService()

    // Determinar la URL de callback según el entorno
    const isDevelopment = import.meta.env.MODE === 'development'
    const baseUrl = isDevelopment
      ? 'http://localhost:5173'
      : import.meta.env.VITE_API_URL || window.location.origin
    const callbackUrl = `${baseUrl}/auth/google/callback`

    console.log('Callback URL:', callbackUrl)

    useScriptTag(
      'https://accounts.google.com/gsi/client',
    )

    yup.setLocale({
      mixed: {
        required: () => t('general.required_field'),
      },
      string: {
        email: () => t('general.invalid_email'),
      },
    })

    const schema = yup.object({
      email: yup.string().email().required().label(t('general.email')),
      password: yup.string().required().label(t('general.password')),
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
      } catch (error) {
        console.error('Error de autenticación:', error)
      }
    })

    const handleGoogleLogin = async () => {
      try {
        const { url } = await authService.getGoogleAuthUrl()
        window.location.href = url
      } catch (error) {
        console.error('Error al iniciar sesión con Google:', error)
      }
    }

    return {
      email,
      password,
      errors,
      onSubmit,
      handleGoogleLogin,
      callbackUrl
    }
  },
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex justify-center items-center gap-6 flex-col w-full">
    <AppInput v-model="email" :error-message="errors.email" :placeholder="$t('general.email')" />

    <AppInputPassword v-model="password" :error-message="errors.password" :placeholder="$t('general.password')" />

    <AppButton type="submit" :label="$t('auth.enter')" class="w-full" />

    <AppLink :label="$t('auth.forgot_password')" />

    <AppDivider />

    <div class="w-full grid grid-cols-2 gap-4">
      <AppButton label="Google" :variant="'contrast'" outlined @click="handleGoogleLogin">
        <template #icon-start>
          <GoogleIcon class="w-4 h-4" />
        </template>
      </AppButton>
      <AppButton label="Facebook" variant="white" />
    </div>
  </form>
 <!--  <div id="g_id_onload"
    data-client_id="916028257398-48219o2n9561ggv5kf7qf70sihe82lvd.apps.googleusercontent.com"
    data-context="signin"
    :data-login_uri="callbackUrl"
    data-auto_select="false"
    data-itp_support="true"
    > </div>-->


</template>
