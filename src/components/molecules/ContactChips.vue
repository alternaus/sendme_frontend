<script setup lang="ts">
import { computed, ref } from 'vue'

import AutoComplete from 'primevue/autocomplete'
import Button from 'primevue/button'
import Chip from 'primevue/chip'
import Dialog from 'primevue/dialog'

import { useI18n } from 'vue-i18n'

import type { IContact } from '@/services/contact/interfaces/contact.interface'
import { useContactService } from '@/services/contact/useContactService'

interface Props {
  modelValue: string[]
  placeholder?: string
  type?: 'email' | 'phone'
  disabled?: boolean
  errorMessage?: string
  showErrorMessage?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Enter contacts...',
  type: 'email',
  disabled: false,
  errorMessage: '',
  showErrorMessage: false,
})

const emit = defineEmits<Emits>()

const { t } = useI18n()
const contactService = useContactService()
const inputValue = ref('')
const suggestions = ref<IContact[]>([])
const loading = ref(false)
const showModal = ref(false)

const chips = computed({
  get: () => props.modelValue,
  set: (value: string[]) => emit('update:modelValue', value),
})

const visibleChips = computed(() => chips.value.slice(0, 2))

const remainingChips = computed(() => chips.value.slice(2))

const remainingCount = computed(() => remainingChips.value.length)

const searchContacts = async (event: { query: string }) => {
  const query = event.query?.trim()
  if (!query || query.length < 2) {
    suggestions.value = []
    return
  }

  loading.value = true
  try {
    const results = await contactService.searchContacts(query, 10)
    suggestions.value = results || []
  } catch (error) {
    console.error('Error searching contacts:', error)
    suggestions.value = []
  } finally {
    loading.value = false
  }
}

const onSelect = (event: { value: IContact }) => {
  const contact = event.value
  const contactValue = props.type === 'email' ? contact.email : contact.phone
  if (contactValue && !chips.value.includes(contactValue)) {
    chips.value = [...chips.value, contactValue]
  }
  inputValue.value = ''
}

const onKeyDown = (event: KeyboardEvent) => {
  if ((event.key === 'Enter' || event.key === ',') && inputValue.value.trim()) {
    event.preventDefault()
    const value = inputValue.value.trim()

    let isValid = false
    if (props.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      isValid = emailRegex.test(value)
    } else {
      isValid = /\d/.test(value)
    }

    if (isValid && !chips.value.includes(value)) {
      chips.value = [...chips.value, value]
      inputValue.value = ''
    }
  }
}

const removeChip = (index: number) => {
  chips.value = chips.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="w-full">
    <div v-if="chips.length > 0" class="flex flex-wrap items-center gap-2 mb-3">
      <Chip
        v-for="(chip, index) in visibleChips"
        :key="index"
        :label="chip"
        removable
        @remove="removeChip(index)"
        class="text-xs h-6"
      />

      <template v-if="remainingCount > 0">
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ t('send.contact_chips.more_count', { count: remainingCount }) }}
        </span>
        <Button
          @click="showModal = true"
          size="small"
          severity="secondary"
          outlined
          class="h-6 px-2 text-xs !rounded-xl"
        >
          {{ t('send.contact_chips.view_all') }}
        </Button>
      </template>
    </div>

    <Dialog
      v-model:visible="showModal"
      modal
      :header="t('send.contact_chips.selected_contacts', { count: chips.length })"
      :style="{ width: '32rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div class="flex flex-wrap gap-2 p-4">
        <Chip
          v-for="(chip, index) in chips"
          :key="index"
          :label="chip"
          removable
          @remove="removeChip(index)"
          class="text-xs"
        />
      </div>

      <template #footer>
        <Button
          :label="t('send.contact_chips.close')"
          @click="showModal = false"
          size="small"
          severity="secondary"
          class="!rounded-xl"
        />
      </template>
    </Dialog>

    <div class="w-full">
      <AutoComplete
        v-model="inputValue"
        :suggestions="suggestions"
        :placeholder="placeholder"
        :disabled="disabled"
        :loading="loading"
        :class="[
          '!w-full !rounded-xl',
          { 'p-invalid': showErrorMessage && errorMessage }
        ]"
        option-label="name"
        complete-method="searchContacts"
        @complete="searchContacts"
        @option-select="onSelect"
        @keydown="onKeyDown"
        :pt="{
          input: {
            class: '!rounded-xl',
            style: 'border-radius: 0.75rem !important'
          }
        }"
        size="small"
        :force-selection="false"
      >
        <template #option="{ option }">
          <div class="flex items-center gap-1 p-1">
            <div class="flex flex-col">
              <span class="font-medium text-sm">{{ option.name || t('send.contact_chips.no_name') }}</span>
              <span class="text-xs text-gray-600 dark:text-gray-400">
                {{ type === 'email' ? option.email : option.phone }}
              </span>
            </div>
          </div>
        </template>

        <template #empty>
          <div class="p-2 text-gray-500 text-sm">
            {{
              inputValue.length < 2
                ? t('send.contact_chips.search_min_chars')
                : t('send.contact_chips.no_contacts_found')
            }}
          </div>
        </template>
      </AutoComplete>

      <div v-if="showErrorMessage && errorMessage" class="text-red-400 dark:text-red-300 p-0 m-0">
        <small>{{ errorMessage }}</small>
      </div>

      <small class="text-gray-500 dark:text-gray-400 text-xs mt-1 block">
        {{
          t('send.contact_chips.add_manually_help', {
            type: t(`send.contact_chips.${type === 'email' ? 'emails' : 'numbers'}`)
          })
        }}
      </small>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-autocomplete) {
  width: 100%;
}

:deep(.p-autocomplete-input) {
  width: 100%;
  border-radius: 0.75rem !important; /* !rounded-xl equivalent */
}

:deep(.p-chip) {
  font-size: 0.75rem;
}

/* Asegurar que el input interno del AutoComplete tenga bordes redondeados */
:deep(.p-autocomplete .p-inputtext) {
  border-radius: 0.75rem !important; /* !rounded-xl equivalent */
}
</style>
