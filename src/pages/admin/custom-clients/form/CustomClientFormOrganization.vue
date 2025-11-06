<script lang="ts" setup>
import { computed } from 'vue'

import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppPhoneInput from '@/components/molecules/phone-input/AppPhoneInput.vue'
import type { CustomClientFormData } from '@/composables/useCustomClientForm'

interface Props {
  form: Record<keyof CustomClientFormData, { value: unknown }>
  errors: Record<string, string | undefined>
}

interface Emits {
  (e: 'update:form', field: keyof CustomClientFormData, value: unknown): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const orgName = computed({
  get: () => props.form.orgName.value as string,
  set: (value) => emit('update:form', 'orgName', value),
})

const orgDocument = computed({
  get: () => props.form.orgDocument.value as string,
  set: (value) => emit('update:form', 'orgDocument', value),
})

const orgDocumentType = computed({
  get: () => props.form.orgDocumentType.value as string,
  set: (value) => emit('update:form', 'orgDocumentType', value),
})

const orgEmail = computed({
  get: () => props.form.orgEmail.value as string,
  set: (value) => emit('update:form', 'orgEmail', value),
})

const orgPhone = computed({
  get: () => props.form.orgPhone.value as string,
  set: (value) => emit('update:form', 'orgPhone', value),
})

const orgCountry = computed({
  get: () => props.form.orgCountry.value as string,
  set: (value) => emit('update:form', 'orgCountry', value),
})

const orgCity = computed({
  get: () => props.form.orgCity.value as string,
  set: (value) => emit('update:form', 'orgCity', value),
})

const orgAddress = computed({
  get: () => props.form.orgAddress.value as string,
  set: (value) => emit('update:form', 'orgAddress', value),
})

const documentTypeOptions = [
  { name: 'NIT', value: 'NIT' },
  { name: 'RUT', value: 'RUT' },
  { name: 'CC', value: 'CC' },
]

const countryOptions = [
  { name: 'Colombia', value: 'Colombia' },
  { name: 'México', value: 'México' },
  { name: 'Argentina', value: 'Argentina' },
  { name: 'Chile', value: 'Chile' },
  { name: 'Perú', value: 'Perú' },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-4">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ $t('custom_clients.form.organization.title') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t('custom_clients.form.organization.subtitle') }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppInput
        v-model="orgName"
        :label="$t('custom_clients.form.organization.name')"
        :placeholder="$t('custom_clients.form.organization.name_placeholder')"
        :errorMessage="errors.orgName"
        required
      />

      <div class="grid grid-cols-2 gap-2">
        <AppSelect
          v-model="orgDocumentType"
          :options="documentTypeOptions"
          :label="$t('custom_clients.form.organization.document_type')"
          :errorMessage="errors.orgDocumentType"
          required
        />
        <AppInput
          v-model="orgDocument"
          :label="$t('custom_clients.form.organization.document')"
          :placeholder="$t('custom_clients.form.organization.document_placeholder')"
          :errorMessage="errors.orgDocument"
          required
        />
      </div>

      <AppInput
        v-model="orgEmail"
        type="email"
        :label="$t('custom_clients.form.organization.email')"
        :placeholder="$t('custom_clients.form.organization.email_placeholder')"
        :errorMessage="errors.orgEmail"
        required
      />

      <AppPhoneInput
        v-model="orgPhone"
        :label="$t('custom_clients.form.organization.phone')"
        :placeholder="$t('custom_clients.form.organization.phone_placeholder')"
        :error-message="errors.orgPhone"
        default-country="co"
        :preferred-countries="['co', 'mx', 'ar', 'cl', 'pe']"
        required
      />

      <AppSelect
        v-model="orgCountry"
        :options="countryOptions"
        :label="$t('custom_clients.form.organization.country')"
        :errorMessage="errors.orgCountry"
        required
      />

      <AppInput
        v-model="orgCity"
        :label="$t('custom_clients.form.organization.city')"
        :placeholder="$t('custom_clients.form.organization.city_placeholder')"
        :errorMessage="errors.orgCity"
        required
      />

      <div class="md:col-span-2">
        <AppInput
          v-model="orgAddress"
          :label="$t('custom_clients.form.organization.address')"
          :placeholder="$t('custom_clients.form.organization.address_placeholder')"
          :errorMessage="errors.orgAddress"
          required
        />
      </div>
    </div>
  </div>
</template>
