<script lang="ts">
import { defineComponent } from 'vue'
import AppHeader from '@/components/molecules/app-header/AppHeader.vue'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import CampaignRouteIcon from '@/assets/svg/campaign_route.svg?component'
import CampaignChannelIcon from '@/assets/svg/campaign_channel.svg?component'
import CampaignDescriptionIcon from '@/assets/svg/campaign_description.svg?component'
import CampaignStatusIcon from '@/assets/svg/campaign_status.svg?component'
import { useFormCampaign } from '../composables/useCampaignForm'

import { IconTypes } from '@/components/molecules/app-header/enums/icon-types.enum'
import CampaignFormDetails from './CampaignFormDetails.vue'
import CampaignFormTriggers from './CampaignFormTriggers.vue'
import CampaignFormMessage from './CampaignFormMessage.vue'

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
    CampaignChannelIcon,
    CampaignDescriptionIcon,
    CampaignStatusIcon,
  },
  setup() {
    const { form, handleSubmit, resetForm, errors, addRule, removeRule } = useFormCampaign()

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
    }
  },
})
</script>

<template>
  <AppHeader :icon="IconTypes.CAMPAIGNS" :actions="[]" class="hidden lg:flex" />

  <form @submit.prevent="onSubmitForm" class="w-full flex flex-col gap-4 mt-8">
    <div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <AppInput
        v-model="form.name.value"
        type="text"
        class="w-full border-gray-300 dark:border-gray-600 rounded-md"
        :error-message="errors.name"
      >
        <template #icon>
          <CampaignRouteIcon class="dark:fill-white" />
        </template>
      </AppInput>

      <AppInput
        v-model="form.description.value"
        :error-message="errors.description"
        type="text"
        class="w-full border-gray-300 dark:border-gray-600 rounded-md"
      >
        <template #icon>
          <CampaignDescriptionIcon class="dark:fill-white" />
        </template>
      </AppInput>

      <AppSelect
        v-model="form.channelId.value"
        :options="statusOptions"
        :error-message="errors.channelId"
        placeholder="Seleccione una opción"
        class="w-full"
      >
        <template #icon>
          <CampaignChannelIcon class="dark:fill-white" />
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
          <CampaignStatusIcon class="dark:fill-white" />
        </template>
      </AppSelect>
    </div>

    <CampaignFormDetails :form="form" :errors="errors" />

    <CampaignFormTriggers
      :form="form"
      :errors="errors"
      :conditionOptions="conditionOptions"
      :addRule="addRule"
      :removeRule="removeRule"
    />

    <CampaignFormMessage :form="form" :errors="errors" />

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
