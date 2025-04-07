<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import CampaignRouteIcon from '@/assets/svg/campaign_route.svg?component'
import ChannelIcon from '@/assets/svg/channel.svg?component'
import DescriptionIcon from '@/assets/svg/description.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import { type SelectOption } from '@/components/atoms/selects/types/select-option.types'
import AppStepper from '@/components/atoms/stepper/AppStepper.vue'
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
    AppStepper,
    CampaignFormDetails,
    CampaignFormTriggers,
    CampaignFormMessage,
    CampaignRouteIcon,
    ChannelIcon,
    DescriptionIcon,
    StatusIcon,
  },

  setup() {
    const router = useRouter()
    const { t } = useI18n()
    const { form, handleSubmit, resetForm, errors, addRule, removeRule } = useFormCampaign()
    const { getChannels } = useChannelService()
    const activeStep = ref(0)

    const steps = [
      { label: t('campaign.details'), icon: 'pi pi-info-circle' },
      { label: t('campaign.triggers'), icon: 'pi pi-bolt' },
      { label: t('campaign.message'), icon: 'pi pi-comment' },
    ]

    const statusOptions = [
      { name: t('general.active'), value: 'active' },
      { name: t('general.inactive'), value: 'inactive' },
    ]

    const conditionOptions = [
      { name: t('campaign.conditions.is_empty'), value: 'is_empty' },
      { name: t('campaign.conditions.is_not_empty'), value: 'is_not_empty' },
      { name: t('campaign.conditions.is_equal'), value: 'is_equal' },
      { name: t('campaign.conditions.is_not_equal'), value: 'is_not_equal' },
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

    const nextStep = () => {
      if (activeStep.value < steps.length - 1) {
        activeStep.value++
      }
    }

    const prevStep = () => {
      if (activeStep.value > 0) {
        activeStep.value--
      }
    }

    const handleCancel = () => {
      resetForm()
      router.push('/campaigns')
    }

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
      activeStep,
      steps,
      nextStep,
      prevStep,
      handleCancel,
      t,
    }
  },
})
</script>

<template>
  <AppHeader :icon="IconTypes.CAMPAIGNS" :actions="[]" class="hidden lg:flex" />

  <form @submit.prevent="onSubmitForm" class="w-full flex flex-col gap-4 pt-4">
    <AppStepper v-model="activeStep" :steps="steps" class="mb-8" />

    <div v-if="activeStep === 0" class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <AppInput
        v-model="form.name.value"
        type="text"
        class="w-full border-gray-300 dark:border-gray-600 rounded-md"
        :error-message="errors.name"
        :placeholder="t('general.name')"
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
        :placeholder="t('general.description')"
      >
        <template #icon>
          <DescriptionIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppInput>

      <AppSelect
        v-model="form.channelId.value"
        :options="channels"
        :error-message="errors.channelId"
        :placeholder="t('campaign.select_option')"
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
        :placeholder="t('campaign.select_option')"
        class="w-full"
      >
        <template #icon>
          <StatusIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppSelect>
    </div>

    <CampaignFormDetails v-if="activeStep === 0" :form="form" :errors="errors" @update:form="updateFormContent" />

    <CampaignFormTriggers
      v-if="activeStep === 1"
      :form="form"
      :errors="errors"
      :conditionOptions="conditionOptions"
      :addRule="addRule"
      :removeRule="removeRule"
      @update:form="updateFormContent"
    />

    <CampaignFormMessage v-if="activeStep === 2" :form="form" :errors="errors" @update:form="updateFormContent" />

    <div class="flex flex-col lg:flex-row lg:justify-between gap-5 mt-7">
      <div class="flex gap-5">
        <AppButton
          v-if="activeStep > 0"
          severity="secondary"
          class="w-full sm:w-auto"
          :label="t('general.previous')"
          @click.prevent="prevStep"
        />
        <AppButton
          v-if="activeStep < steps.length - 1"
          severity="primary"
          class="w-full sm:w-auto"
          :label="t('general.next')"
          @click.prevent="nextStep"
        />
      </div>
      <div class="flex gap-5">
        <AppButton
          v-if="activeStep === steps.length - 1"
          type="submit"
          severity="primary"
          class="w-full sm:w-auto"
          :label="t('general.save')"
        />
        <AppButton
          severity="secondary"
          class="w-full sm:w-auto"
          :label="t('general.cancel')"
          @click.prevent="handleCancel"
        />
      </div>
    </div>
  </form>
</template>
