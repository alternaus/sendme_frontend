<script lang="ts">
import { defineComponent } from 'vue'

import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppDivider from '@/components/atoms/divider/AppDivider.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppInputPassword from '@/components/atoms/inputs/AppInputPassword.vue'
import AppLink from '@/components/atoms/links/AppLink.vue'
import { useAuthStore } from '@/stores/useAuthStore'

export default defineComponent({
  components: {
    AppInput,
    AppInputPassword,
    AppButton,
    AppLink,
    AppDivider,
  },
  setup() {
    const { t } = useI18n()
    yup.setLocale({
      mixed: {
        required: () => t('general.required_field'),
      },
      string: {
        email: () => t('general.invalid_email'),
      },
    })

    const authStore = useAuthStore()

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

    return {
      email,
      password,
      errors,
      onSubmit,
    }
  },
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex justify-center items-center gap-4 flex-col w-full">
    <AppInput v-model="email" :error-message="errors.email" :placeholder="$t('general.email')" />

    <AppInputPassword
      v-model="password"
      :error-message="errors.password"
      :placeholder="$t('general.password')"
    />

    <AppButton type="submit" :label="$t('auth.enter')" class="w-full" />

    <AppLink :label="$t('auth.forgot_password')" />

    <AppDivider />

    <div class="w-full grid grid-cols-2 gap-4">
      <AppButton label="Google" variant="white" />
      <AppButton label="Facebook" variant="white" />
    </div>
  </form>
</template>

<style lang="scss" scoped></style>
