<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

import CampaignRouteIcon from '@/assets/svg/campaign_route.svg?component'
import ChannelIcon from '@/assets/svg/channel.svg?component'
import DescriptionIcon from '@/assets/svg/description.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import { type SelectOption } from '@/components/atoms/selects/types/select-option.types'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import { useChannelService } from '@/services/channel/useChannelService'

import { type CampaignFormRef, useFormCampaign } from '../composables/useCampaignForm'
import CampaignFormDetails from './CampaignFormDetails.vue'
import CampaignFormMessage from './CampaignFormMessage.vue'
import CampaignFormTriggers from './CampaignFormTriggers.vue'

export default defineComponent({
  components: {
    AppHeader,
    AppButton,
    AppInput,
    AppSelect,
    CampaignFormDetails,
    CampaignFormTriggers,
    CampaignFormMessage,
    CampaignRouteIcon,
    ChannelIcon,
    DescriptionIcon,
    StatusIcon,
  },

  setup() {
    const { form, handleSubmit, resetForm, errors, addRule, removeRule } = useFormCampaign()
    const { getChannels } = useChannelService()

    const statusOptions = [
      { name: 'Activo', value: 'active' },
      { name: 'Inactivo', value: 'inactive' },
    ]

    const conditionOptions = [
      { name: 'Está vacío', value: 'is_empty' },
      { name: 'No está vacío', value: 'is_not_empty' },
      { name: 'Es igual a', value: 'is_equal' },
      { name: 'Es diferente de', value: 'is_not_equal' },
    ]

    const channels = ref<SelectOption[]>([])

    onMounted(async () => {
      try {
        const response = await getChannels()
        channels.value = response.map((channel) => ({
          name: channel.name,
          value: channel.id,
        }))
      } catch (error) {
        console.error('❌ Error al obtener canales:', error)
      }
    })

    const updateFormContent = (newContent: Partial<CampaignFormRef>) => {
      console.log('Updating form content with:', newContent)
      console.log('Form:', form)
      ;(Object.keys(newContent) as Array<keyof typeof form>).forEach((key) => {
        if (form[key] && form[key].value !== undefined) {
          if (newContent[key] !== undefined) {
            form[key].value = newContent[key]!.value
          }
        }
      })
    }

    const onSubmitForm = handleSubmit(
      (values) => {
        console.log('Formulario enviado con:', values)
      },
      (error) => {
        console.log('Formulario con errores', error)
      },
    )

    return {
      IconTypes,
      form,
      errors,
      resetForm,
      onSubmitForm,
      statusOptions,
      conditionOptions,
      addRule,
      removeRule,
      channels,
      updateFormContent,
    }
  },
})
</script>

<template>
  <AppHeader :icon="IconTypes.CAMPAIGNS" :actions="[]" class="hidden lg:flex" />

  <form @submit.prevent="onSubmitForm" class="w-full flex flex-col gap-4 pt-4">
    <div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <AppInput
        v-model="form.name.value"
        type="text"
        class="w-full border-gray-300 dark:border-gray-600 rounded-md"
        :error-message="errors.name"
      >
        <template #icon>
          <CampaignRouteIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppInput>

      <AppInput
        v-model="form.description.value"
        :error-message="errors.description"
        type="text"
        class="w-full border-gray-300 dark:border-gray-600 rounded-md"
      >
        <template #icon>
          <DescriptionIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppInput>

      <AppSelect
        v-model="form.channelId.value"
        :options="channels"
        :error-message="errors.channelId"
        placeholder="Seleccione una opción"
        class="w-full"
      >
        <template #icon>
          <ChannelIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppSelect>

      <AppSelect
        v-model="form.status.value"
        :options="statusOptions"
        :error-message="errors.status"
        placeholder="Seleccione una opción"
        class="w-full"
      >
        <template #icon>
          <StatusIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppSelect>
    </div>

    <CampaignFormDetails :form="form" :errors="errors" @update:form="updateFormContent" />

    <CampaignFormTriggers
      :form="form"
      :errors="errors"
      :conditionOptions="conditionOptions"
      :addRule="addRule"
      :removeRule="removeRule"
      @update:form="updateFormContent"
    />

    <CampaignFormMessage :form="form" :errors="errors" @update:form="updateFormContent" />

    <div class="flex flex-col lg:flex-row lg:justify-start gap-5 mt-7">
      <AppButton type="submit" severity="primary" class="w-full sm:w-auto" label="Guardar" />
      <AppButton
        severity="secondary"
        class="w-full sm:w-auto"
        label="Cancelar"
        @click.prevent="resetForm"
      />
    </div>
  </form>
</template>
