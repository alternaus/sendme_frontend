<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import CredentialIcon from '@/assets/svg/credential.svg?component'
import DataOriginIcon from '@/assets/svg/data_origin.svg?component'
import PhoneIcon from '@/assets/svg/phone.svg?component'
import SearchIcon from '@/assets/svg/search.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppStatusSelect from '@/components/atoms/selects/AppStatusSelect.vue'
import { useEnumValues } from '@/composables/useEnumValues'
import { ContactOrigin } from '@/services/contact/enums/contact-origin.enum'

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

const { t } = useI18n()
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
  }
}

const { enumOptions:originOptions } = useEnumValues(ContactOrigin)

const countryCodeOptions = [
  { name: 'US', value: '1' },
  { name: 'UK', value: '44' },
  { name: 'CA', value: '1' },
  { name: 'AU', value: '61' },
  { name: 'FR', value: '33' },
  { name: 'DE', value: '49' },
  { name: 'IN', value: '91' },
  { name: 'JP', value: '81' },
  { name: 'CN', value: '86' },
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
          :label="t('general.search')"
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
          :label="t('general.name')"
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
          :label="t('general.country_code')"
          @update:modelValue="updateField('countryCode', $event !== null ? String($event) : '')"
        >
          <template #icon>
            <PhoneIcon class="w-6 h-4 dark:fill-white" />
          </template>
        </AppSelect>

        <AppStatusSelect
          class="w-full mt-3"
          :modelValue="_props.status"
          status-type="contact"
          :label="t('general.status')"
          :show-colors="true"
          @update:modelValue="updateField('status', $event !== null ? String($event) : '')"
        >
          <template #icon>
            <StatusIcon class="w-6 h-4 dark:fill-white" />
          </template>
        </AppStatusSelect>

        <AppSelect
          class="w-full mt-3"
          :modelValue="_props.origin"
          :options="originOptions"
          :label="t('general.origin')"
          @update:modelValue="updateField('origin', $event !== null ? String($event) : '')"
        >
          <template #icon>
            <DataOriginIcon class="w-6 h-4 dark:fill-white" />
          </template>
        </AppSelect>
      </div>
    </template>
  </AppCard>
</template>
