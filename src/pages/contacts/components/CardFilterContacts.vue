<script setup lang="ts">
import CredentialIcon from '@/assets/svg/credential.svg?component'
import DataOriginIcon from '@/assets/svg/data_origin.svg?component'
import PhoneIcon from '@/assets/svg/phone.svg?component'
import SearchIcon from '@/assets/svg/search.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'

import { ContactOriginTypes } from '../enums/contact-origin.enum'
import { ContactStatusTypes } from '../enums/contact-status.enum'

interface Props {
  search?: string
  name?: string
  countryCode?: string
  status?: string
  origin?: string
}

interface Emits {
  'update:search': [value: string]
  'update:name': [value: string]
  'update:countryCode': [value: string]
  'update:status': [value: string]
  'update:origin': [value: string]
}

const _props = withDefaults(defineProps<Props>(), {
  search: '',
  name: '',
  countryCode: '',
  status: '',
  origin: '',
})

const emit = defineEmits<Emits>()

const updateField = (field: string, value: string) => {
  switch (field) {
    case 'search':
      emit('update:search', value)
      break
    case 'name':
      emit('update:name', value)
      break
    case 'countryCode':
      emit('update:countryCode', value)
      break
    case 'status':
      emit('update:status', value)
      break
    case 'origin':
      emit('update:origin', value)
      break
    default:
      console.warn(`Unknown field: ${field}`)
  }
}

const countryCodeOptions = [
  { value: '1', name: '+1 (US/CA)' },
  { value: '52', name: '+52 (MX)' },
  { value: '34', name: '+34 (ES)' },
  { value: '33', name: '+33 (FR)' },
  { value: '44', name: '+44 (UK)' },
  { value: '49', name: '+49 (DE)' },
  { value: '39', name: '+39 (IT)' },
  { value: '55', name: '+55 (BR)' },
  { value: '54', name: '+54 (AR)' },
  { value: '57', name: '+57 (CO)' },
]
</script>

<template>
  <AppCard>
    <template #content>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        <AppInput
          :modelValue="_props.search"
          type="text"
          class="w-full rounded-md mt-3"
          :label="$t('general.search')"
          @input="updateField('search', $event.target.value)"
        >
          <template #icon>
            <SearchIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppInput>

        <AppInput
          :modelValue="_props.name"
          type="text"
          class="w-full rounded-md mt-3"
          :label="$t('general.name')"
          @input="updateField('name', $event.target.value)"
        >
          <template #icon>
            <CredentialIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppInput>

        <AppSelect
          class="w-full mt-3"
          :modelValue="_props.countryCode"
          :options="countryCodeOptions"
          :label="$t('general.country_code')"
          @update:modelValue="updateField('countryCode', $event)"
        >
          <template #icon>
            <PhoneIcon class="w-6 h-4 dark:fill-white" />
          </template>
        </AppSelect>

        <AppSelect
          class="w-full mt-3"
          :modelValue="_props.status"
          :options="
            Object.entries(ContactStatusTypes).map(([key, value]) => ({
              value: key,
              name: $t(value),
            }))
          "
          :label="$t('general.status')"
          @update:modelValue="updateField('status', $event)"
        >
          <template #icon>
            <StatusIcon class="w-6 h-4 dark:fill-white" />
          </template>
        </AppSelect>

        <AppSelect
          class="w-full mt-3"
          :modelValue="_props.origin"
          :options="
            Object.entries(ContactOriginTypes).map(([key, value]) => ({
              value: key,
              name: $t(value),
            }))
          "
          :label="$t('general.origin')"
          @update:modelValue="updateField('origin', $event)"
        >
          <template #icon>
            <DataOriginIcon class="w-6 h-4 dark:fill-white" />
          </template>
        </AppSelect>
      </div>
    </template>
  </AppCard>
</template>
