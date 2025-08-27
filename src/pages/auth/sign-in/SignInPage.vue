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

    onMounted(() => {
      googleOneTap()
        .then((response) => {
          oneTapCallback(response)
        })
        .catch((error) => {
          console.log("Handle the error", error)
        })
    })

    const { t } = useI18n()
    const router = useRouter()
    const authStore = useAuthStore()
    const authService = useAuthService()

    const baseUrl = window.location.origin
    const callbackUrl = `${baseUrl}/auth/google/callback`

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
      } catch {
      }
    })

    const handleGoogleLogin = async () => {
      try {
        const { url } = await authService.getGoogleAuthUrl()
        window.location.href = url
      } catch {
      }
    }

    function goToForgotPassword() {
      router.push('/auth/forgot-password')
    }

    const oneTapCallback = (response: unknown) => {

      console.log("Handle the response", response)
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
    <AppInput v-model="email" :error-message="errors.email" :placeholder="$t('general.email')" />

    <AppInputPassword v-model="password" :error-message="errors.password" :placeholder="$t('general.password')" />

    <AppButton type="submit" :label="$t('auth.enter')" class="w-full" />

    <AppLink :label="$t('auth.forgot_password')" @click="goToForgotPassword" />

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


</template>
