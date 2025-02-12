<template>
  <AppCard>
    <template #content>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="flex-col items-center justify-center col-span-1 hidden lg:flex">
          <p
            class="w-10 h-10 flex items-center justify-center rounded-full border border-gray-400 text-lg font-bold"
          >
            3
          </p>
          <p class="text-center mt-2 font-medium">Mensaje</p>
        </div>

        <div class="col-span-11 grid grid-cols-8 gap-4 items-center justify-center text-center">
          <div class="flex flex-col items-center justify-center gap-1 col-span-12 lg:col-span-1">
            <SmsIcon class="w-12 h-12 dark:fill-white" />
            <span class="text-gray-700 dark:text-neutral-300 font-medium">SMS</span>
          </div>

          <div class="flex items-center justify-center col-span-12 lg:col-span-5">
            <AppEditor
              :modelValue="form.content.value"
              :errorMessage="errors.content"
              @update:modelValue="updateContent"
            />
          </div>

          <div class="flex flex-col items-center justify-center gap-2 col-span-12 lg:col-span-2">
            <p class="text-gray-700 dark:text-neutral-300 font-medium">Dato dinámico</p>

            <AppSelect v-model="selectedField" :options="availableFields" class="w-full" />

            <AppButton label="Insertar en el mensaje" @click="insertPlaceholder" />
          </div>
        </div>
      </div>
    </template>
  </AppCard>
</template>

<script lang="ts">
import { defineComponent, type PropType,ref } from 'vue'

import SmsIcon from '@/assets/svg/sms.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppEditor from '@/components/atoms/editor/AppEditor.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import type { SelectOption } from '@/components/atoms/selects/types/select-option.types'
import { useCustomFieldService } from '@/services/custom-field/useCustomFieldService'

import type { CampaignFormRef } from '../composables/useCampaignForm'

export default defineComponent({
  components: {
    AppCard,
    AppEditor,
    SmsIcon,
    AppSelect,
    AppButton,
  },
  props: {
    form: {
      type: Object as PropType<CampaignFormRef>,
      required: true,
    },
    errors: {
      type: Object as PropType<Partial<Record<string, string>>>,
      required: true,
    },
  },
  emits: ['update:form'],
  setup(props, { emit }) {
    const { getCustomFields } = useCustomFieldService()

    const availableFields = ref<SelectOption[]>([])
    const selectedField = ref<string | null>(null)

    const updateContent = (value: string) => {
      emit('update:form', { content: { value } })
    }

    const insertPlaceholder = () => {
      if (selectedField.value) {
        const newValue = `${props.form.content.value} ${selectedField.value}`
        updateContent(newValue)
      }
    }

    getCustomFields()
      .then((response) => {
        const contactFields = [
          { name: 'Nombre', value: '{name}' },
          { name: 'Apellido', value: '{lastName}' },
          { name: 'Correo', value: '{email}' },
          { name: 'Teléfono', value: '{phone}' },
          { name: 'Código País', value: '{countryCode}' },
          { name: 'Fecha de Nacimiento', value: '{birthDate}' },
          { name: 'Estado', value: '{status}' },
        ]

        const customFields = response.map((field) => ({
          name: field.fieldName,
          value: `{${field.fieldName}}`,
        }))

        availableFields.value = [...contactFields, ...customFields]
      })
      .catch((error) => {
        console.error('❌ Error al obtener campos personalizados:', error)
      })

    return {
      availableFields,
      selectedField,
      insertPlaceholder,
      updateContent,
    }
  },
})
</script>
