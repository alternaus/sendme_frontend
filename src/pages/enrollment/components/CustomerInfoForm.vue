<template>
  <div>
    <h3 class="text-surface-900 dark:text-surface-0 font-bold text-lg mb-4">
      {{ $t('enrollment.payment.account_information') }}
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="flex flex-col gap-2">
        <label for="name" class="block text-surface-800 dark:text-surface-200 font-medium text-sm">
          {{ $t('enrollment.form.full_name') }}
        </label>
        <AppInput
          id="name"
          :model-value="form.name.value"
          type="text"
          size="small"
          :placeholder="$t('enrollment.form.full_name')"
          :error-message="form.nameError?.value || ''"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="email" class="block text-surface-800 dark:text-surface-200 font-medium text-sm">
          {{ $t('enrollment.form.email') }}
        </label>
        <AppInput
          id="email"
          :model-value="form.email.value"
          type="email"
          size="small"
          :placeholder="$t('enrollment.form.email')"
          :error-message="form.emailError?.value || ''"
        />
      </div>
    </div>

    <div class="flex flex-col gap-2 mb-4">
      <label for="company" class="block text-surface-800 dark:text-surface-200 font-medium text-sm">
        {{ $t('enrollment.form.company_name') }}
      </label>
      <AppInput
        id="company"
        :model-value="form.company.value"
        type="text"
        size="small"
        :placeholder="$t('enrollment.form.company_name')"
        :error-message="form.companyError?.value || ''"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppInput from '@/components/atoms/inputs/AppInput.vue'

interface FormField {
  value: string
}

interface FormErrors {
  value: string
}

interface PaymentForm {
  name: FormField
  email: FormField
  company: FormField
  nameError?: FormErrors
  emailError?: FormErrors
  companyError?: FormErrors
  isFormValid: boolean
}

interface Props {
  form: PaymentForm
}

defineProps<Props>()
</script>
