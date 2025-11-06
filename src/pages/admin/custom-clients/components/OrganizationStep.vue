<template>
  <div class="space-y-6">
    <div class="text-center mb-6">
      <h3 class="text-xl font-semibold mb-2">{{ $t('custom_clients.form.organization.title') }}</h3>
      <p class="text-muted-foreground">{{ $t('custom_clients.form.organization.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppInput
        v-model="localOrganization.name"
        :label="$t('custom_clients.form.organization.name')"
        :placeholder="$t('custom_clients.form.organization.name_placeholder')"
        required
      />

      <AppInput
        v-model="localOrganization.document"
        :label="$t('custom_clients.form.organization.document')"
        :placeholder="$t('custom_clients.form.organization.document_placeholder')"
        required
      />

      <AppSelect
        v-model="localOrganization.documentType"
        :label="$t('custom_clients.form.organization.document_type')"
        :placeholder="$t('custom_clients.form.organization.document_type_placeholder')"
        :options="documentTypes"
        required
      />

      <AppInput
        v-model="localOrganization.email"
        :label="$t('custom_clients.form.organization.email')"
        :placeholder="$t('custom_clients.form.organization.email_placeholder')"
        type="email"
        required
      />

      <AppInput
        v-model="localOrganization.phone"
        :label="$t('custom_clients.form.organization.phone')"
        :placeholder="$t('custom_clients.form.organization.phone_placeholder')"
        required
      />

      <AppSelect
        v-model="localOrganization.country"
        :label="$t('custom_clients.form.organization.country')"
        :placeholder="$t('custom_clients.form.organization.country_placeholder')"
        :options="countries"
        required
      />

      <AppInput
        v-model="localOrganization.city"
        :label="$t('custom_clients.form.organization.city')"
        :placeholder="$t('custom_clients.form.organization.city_placeholder')"
        required
      />

      <AppInput
        v-model="localOrganization.address"
        :label="$t('custom_clients.form.organization.address')"
        :placeholder="$t('custom_clients.form.organization.address_placeholder')"
        class="md:col-span-2"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue'

import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import type { IOrganizationFormData } from '@/services/organization/interfaces/create-client.interface'

interface Props {
  modelValue: IOrganizationFormData
}

interface Emits {
  (e: 'update:modelValue', value: IOrganizationFormData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localOrganization = reactive<IOrganizationFormData>({
  name: '',
  document: '',
  documentType: 'NIT',
  email: '',
  phone: '',
  country: 'Colombia',
  city: '',
  address: ''
})

watch(() => props.modelValue, (value) => {
  Object.assign(localOrganization, value)
}, { immediate: true, deep: true })

const documentTypes = [
  { name: 'NIT', value: 'NIT' },
  { name: 'RUT', value: 'RUT' },
  { name: 'CC', value: 'CC' },
  { name: 'CE', value: 'CE' },
]

const countries = [
  { name: 'Colombia', value: 'Colombia' },
  { name: 'Argentina', value: 'Argentina' },
  { name: 'Chile', value: 'Chile' },
  { name: 'Perú', value: 'Peru' },
  { name: 'México', value: 'Mexico' },
]

watch(localOrganization, () => {
  emit('update:modelValue', { ...localOrganization })
}, { deep: true })
</script>
