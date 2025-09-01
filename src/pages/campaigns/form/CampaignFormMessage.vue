<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4">
    <div class="col-span-12 grid grid-cols-8 gap-4 items-center justify-center text-center">
      <!-- Icono y título del canal -->
      <div class="flex flex-col items-center justify-center gap-1 col-span-12 lg:col-span-1">
        <component
          :is="channelIcon"
          class="w-12 h-12 dark:fill-white"
        />
        <span class="text-gray-700 dark:text-neutral-300 font-medium">
          {{ channelName }}
        </span>
      </div>

      <!-- Editor según el tipo de canal -->
      <div class="flex items-center justify-center col-span-12 lg:col-span-5">
        <AppEditor
          :contentType="isEmailChannel ? 'html' : 'text'"
          :modelValue="(form.content.value as string)"
          :errorMessage="errors.content"
          :aiAttach="true"
          @update:modelValue="updateContent"
        />
      </div>

      <!-- Campos dinámicos -->
      <div class="flex flex-col items-center justify-center gap-2 col-span-12 lg:col-span-2">
        <p class="text-gray-700 dark:text-neutral-300 font-medium">
          {{ t('campaign.dynamic_data') }}
        </p>

        <AppSelect v-model="selectedField" :options="availableFields" class="w-full" />

        <AppButton
          :label="t('campaign.insert_in_message')"
          @click="insertPlaceholder"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted,ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import EmailIcon from '@/assets/svg/email.svg?component'
import SmsIcon from '@/assets/svg/sms.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppEditor from '@/components/atoms/editor/AppEditor.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import type { SelectOption } from '@/components/atoms/selects/types/select-option.types'
import { useCustomFieldService } from '@/services/custom-field/useCustomFieldService'

import type { CampaignFormFields } from '../composables/useCampaignForm'

interface Props {
  form: CampaignFormFields
  errors: Partial<Record<string, string | undefined>>
  channels?: SelectOption[]
}

const props = withDefaults(defineProps<Props>(), {
  channels: () => []
})

const emit = defineEmits<{
  'update:form': [key: string, value: unknown]
}>()

const { t } = useI18n()
const { getCustomFields } = useCustomFieldService()

const availableFields = ref<SelectOption[]>([])
const selectedField = ref<string | null>(null)

// Determinar el canal seleccionado
const selectedChannel = computed(() => {
  const channelId = props.form.channelId.value as number
  return props.channels.find(channel => channel.value === channelId)
})

// Determinar si es canal de email
const isEmailChannel = computed(() => {
  const channelName = selectedChannel.value?.name?.toLowerCase() || ''
  return channelName.includes('email') || channelName.includes('correo')
})

// Icono del canal
const channelIcon = computed(() => {
  return isEmailChannel.value ? EmailIcon : SmsIcon
})

// Nombre del canal
const channelName = computed(() => {
  return isEmailChannel.value ? t('general.email') : t('general.sms')
})

// Actualizar el tipo de contenido cuando cambie el canal
const updateContentType = () => {
  const newContentType = isEmailChannel.value ? 'html' : 'plain_text'
  emit('update:form', 'contentType', newContentType)

  // Borrar el contenido al cambiar de canal para evitar problemas entre HTML y texto
  emit('update:form', 'content', '')
}

// Observar cambios en el canal para actualizar el tipo de contenido
watch(
  () => props.form.channelId.value,
  () => {
    updateContentType()
  }
)

const updateContent = (value: string) => {
  try {
    emit('update:form', 'content', value)
  } catch {
    // Manejo de errores silencioso
  }
}

const insertPlaceholder = () => {
  try {
    if (selectedField.value) {
      const currentContent = props.form.content.value as string || ''
      const newValue = `${currentContent} ${selectedField.value}`
      updateContent(newValue)
    }
  } catch {
    // Manejo de errores silencioso
  }
}

// Cargar campos personalizados
onMounted(async () => {
  try {
    const response = await getCustomFields()
    const contactFields = [
      { name: t('general.name'), value: '{name}' },
      { name: t('general.last_name'), value: '{lastName}' },
      { name: t('general.email'), value: '{email}' },
      { name: t('general.phone'), value: '{phone}' },
      { name: t('general.country_code'), value: '{countryCode}' },
      { name: t('general.birth_date'), value: '{birthDate}' },
      { name: t('general.status'), value: '{status}' },
    ]

    const customFields = response.map((field) => ({
      name: field.fieldName,
      value: `{${field.fieldName}}`,
    }))

    availableFields.value = [...contactFields, ...customFields]
  } catch {
    // Manejo de errores silencioso
  }
})
</script>
