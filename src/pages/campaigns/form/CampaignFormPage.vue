<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import type { GenericObject } from 'vee-validate'
import { useI18n } from 'vue-i18n'

import { type SelectOption } from '@/components/atoms/selects/types/select-option.types'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import AppFormStepper from '@/components/molecules/stepper/AppFormStepper.vue'
import { useStatusColors } from '@/composables/useStatusColors'
import type { ICreateCampaign } from '@/services/campaign/interfaces/create-campaign.interface'
import type { IUpdateCampaign } from '@/services/campaign/interfaces/update-campaign.interface'
import { useCampaignService } from '@/services/campaign/useCampaignService'
import { useChannelService } from '@/services/channel/useChannelService'

import type { CampaignFormData } from '../composables/useCampaignForm'
import { useCampaignForm } from '../composables/useCampaignForm'
import CampaignFormDetails from './CampaignFormDetails.vue'
import CampaignFormMessage from './CampaignFormMessage.vue'
import CampaignFormTriggers from './CampaignFormTriggers.vue'

export default defineComponent({
  components: {
    AppHeader,
    AppFormStepper,
    CampaignFormDetails,
    CampaignFormTriggers,
    CampaignFormMessage,
  },

  setup() {
    const router = useRouter()
    const route = useRoute()
    const { t } = useI18n()
    const toast = useToast()

    const {
      form,
      addRule,
      removeRule,
      handleSubmit,
      resetForm,
      setValues,
      errors,
      steps,
      currentStep,
      currentStepIndex,
      isFirstStep,
      isLastStep,
      nextStep,
      prevStep,
      goToStep,
      canNavigateToStep,
      hasStepErrors,
    } = useCampaignForm()

    const { getChannels } = useChannelService()
    const { createCampaign, updateCampaign, getCampaign } = useCampaignService()
    const { getStatusOptions } = useStatusColors()

    const isLoading = ref(false)
    const isEditMode = ref(false)
    const campaignId = ref<string | null>(null)

    const statusOptions = computed(() =>
      getStatusOptions('campaign').map(option => ({
        name: option.label,
        value: option.value
      }))
    )

    const conditionOptions = [
      { name: t('campaign.conditions.is_empty'), value: 'is_empty' },
      { name: t('campaign.conditions.not_empty'), value: 'not_empty' },
      { name: t('campaign.conditions.equals'), value: 'equals' },
      { name: t('campaign.conditions.not_equals'), value: 'not_equals' },
      { name: t('campaign.conditions.greater_than'), value: 'greater_than' },
      { name: t('campaign.conditions.less_than'), value: 'less_than' },
      { name: t('campaign.conditions.greater_or_equal'), value: 'greater_or_equal' },
      { name: t('campaign.conditions.less_or_equal'), value: 'less_or_equal' },
      { name: t('campaign.conditions.between'), value: 'between' },
      { name: t('campaign.conditions.between_dates'), value: 'between_dates' },
      { name: t('campaign.conditions.contains'), value: 'contains' },
      { name: t('campaign.conditions.starts_with'), value: 'starts_with' },
      { name: t('campaign.conditions.ends_with'), value: 'ends_with' },
      { name: t('campaign.conditions.birthday_today'), value: 'birthday_today' },
      { name: t('campaign.conditions.birthday_in_x_days'), value: 'birthday_in_x_days' },
      { name: t('campaign.conditions.is_today'), value: 'is_today' },
      { name: t('campaign.conditions.was_yesterday'), value: 'was_yesterday' },
      { name: t('campaign.conditions.is_tomorrow'), value: 'is_tomorrow' },
      { name: t('campaign.conditions.in_x_days'), value: 'in_x_days' },
    ]

    const channels = ref<SelectOption[]>([])

    onMounted(async () => {
      try {
        const response = await getChannels()
        channels.value = response.map((channel) => ({
          name: channel.name,
          value: channel.id,
        }))

        //Verificar si estamos en modo edición
        if (route.params.id) {
          campaignId.value = route.params.id as string
          isEditMode.value = true
          await loadCampaignData()
        }
      } catch {
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('campaign.errors.load_channels'),
          life: 3000,
        })
      }
    })

    const loadCampaignData = async (): Promise<void> => {
      if (!campaignId.value) return

      try {
        isLoading.value = true
        const campaign = await getCampaign(campaignId.value)

        //Convertir las fechas de string a Date y time string a Date
        const timeString = campaign.time || '12:00'
        const [hours, minutes] = timeString.split(':').map(Number)
        const timeDate = new Date(0, 0, 0, hours, minutes)

        const formattedCampaign: Partial<CampaignFormData> = {
          ...campaign,
          startDate: new Date(campaign.startDate),
          endDate: new Date(campaign.endDate),
          time: timeDate,
          days: campaign.days || [],
          campaignRules: (campaign.campaignRules || []).map(rule => ({
            conditionType: rule.conditionType,
            value: String(rule.value || ''),
            customFieldId: rule.customFieldId,
            campaignId: rule.campaignId,
          })),
        }

        setValues(formattedCampaign as Record<string, unknown>)
      } catch {
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('campaign.errors.load_campaign'),
          life: 3000,
        })
      } finally {
        isLoading.value = false
      }
    }

    const updateFormContent = (key: string, value: unknown) => {
      try {
        setValues({ [key]: value } as Record<string, unknown>)
      } catch {
      }
    }

    // Helper para convertir días de campaña al formato de la API
    const convertDaysToApiFormat = (days: string[]): string[] => {
      const dayMapping: Record<string, string> = {
        'MO': 'MO', // Monday
        'TU': 'TU', // Tuesday
        'WE': 'WE', // Wednesday
        'TH': 'TH', // Thursday
        'FR': 'FR', // Friday
        'SA': 'SA', // Saturday
        'SU': 'SU', // Sunday
      }

      return days.map(day => dayMapping[day] || day)
    }

    const formatCampaignData = (values: GenericObject): Record<string, unknown> => {
      try {
        const timeString = values.time instanceof Date
          ? values.time.toTimeString().split(' ')[0].substring(0, 5)
          : '12:00'

        const formattedData: Record<string, unknown> = {
          ...values,
          startDate: values.startDate instanceof Date
            ? values.startDate.toISOString().split('T')[0]
            : values.startDate,
          endDate: values.endDate instanceof Date
            ? values.endDate.toISOString().split('T')[0]
            : values.endDate,
          time: timeString,
          days: Array.isArray(values.days) ? convertDaysToApiFormat(values.days) : [],
          campaignRules: Array.isArray(values.campaignRules)
            ? values.campaignRules.map((rule: Record<string, unknown>) => ({
                conditionType: rule.conditionType,
                value: String(rule.value || ''),
                customFieldId: rule.customFieldId,
              }))
            : [],
        }

        const fieldsToRemove = ['id', 'createdAt', 'updatedAt', 'deletedAt', 'channel', 'rrule']
        fieldsToRemove.forEach(field => {
          delete formattedData[field]
        })

        return formattedData
      } catch {
        return values
      }
    }

    const onSubmitForm = handleSubmit(
      async (values) => {
        try {
          isLoading.value = true
          const formattedData = formatCampaignData(values)

          if (isEditMode.value && campaignId.value) {
            await updateCampaign(campaignId.value, formattedData as IUpdateCampaign)
            toast.add({
              severity: 'success',
              summary: t('general.success'),
              detail: t('campaign.success.updated'),
              life: 3000,
            })
          } else {
            await createCampaign(formattedData as unknown as ICreateCampaign)
            toast.add({
              severity: 'success',
              summary: t('general.success'),
              detail: t('campaign.success.created'),
              life: 3000,
            })
          }

          router.push('/campaigns')
        } catch {
          toast.add({
            severity: 'error',
            summary: t('general.error'),
            detail: isEditMode.value ? t('campaign.errors.update_campaign') : t('campaign.errors.create_campaign'),
            life: 3000,
          })
        } finally {
          isLoading.value = false
        }
      },
      (_error) => {
        toast.add({
          severity: 'warn',
          summary: t('general.validation_error'),
          detail: t('campaign.errors.validation_failed'),
          life: 3000,
        })
      },
    )

    const handleNext = async (): Promise<void> => {
      const success = await nextStep()
      if (!success) {
        toast.add({
          severity: 'warn',
          summary: t('general.validation_error'),
          detail: t('campaign.errors.complete_current_step'),
          life: 3000,
        })
      }
    }

    const handlePrev = async (): Promise<void> => {
      await prevStep()
    }

    const handleGoToStep = async (stepId: string): Promise<void> => {
      const success = await goToStep(stepId)
      if (!success) {
        toast.add({
          severity: 'warn',
          summary: t('general.validation_error'),
          detail: t('campaign.errors.complete_current_step'),
          life: 3000,
        })
      }
    }

    const handleFormSubmit = (): void => {
      onSubmitForm()
    }

    const handleCancel = (): void => {
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

      //Stepper
      steps,
      currentStep,
      currentStepIndex,
      isFirstStep,
      isLastStep,
      canNavigateToStep,
      hasStepErrors,
      handleNext,
      handlePrev,
      handleGoToStep,
      handleFormSubmit,
      handleCancel,

      isLoading,
      isEditMode,
      t,
    }
  },
})
</script>

<template>
  <AppHeader :icon="IconTypes.CAMPAIGNS" :actions="[]"  />

  <form @submit.prevent="onSubmitForm" class="w-full flex flex-col gap-4 pt-4">
    <AppFormStepper
      :steps="steps"
      :current-step="currentStep"
      :is-first-step="isFirstStep"
      :is-last-step="isLastStep"
      :can-navigate-to-step="canNavigateToStep"
      :has-step-errors="hasStepErrors"
      :is-loading="isLoading"
      :submit-label="isEditMode ? t('general.update') : t('general.save')"
      @next="handleNext"
      @prev="handlePrev"
      @go-to="handleGoToStep"
      @submit="handleFormSubmit"
      @cancel="handleCancel"
    >
      <template #step-1>
        <CampaignFormDetails
          :form="form"
          :errors="errors"
          :channels="channels"
          @update:form="updateFormContent"
          :disabled="isLoading"
        />
      </template>

      <template #step-2>
        <CampaignFormTriggers
          :form="form"
          :errors="errors"
          :condition-options="conditionOptions"
          :add-rule="addRule"
          :remove-rule="removeRule"
          @update:form="updateFormContent"
          :disabled="isLoading"
        />
      </template>

      <template #step-3>
        <CampaignFormMessage
          :form="form"
          :errors="errors"
          :channels="channels"
          @update:form="updateFormContent"
          :disabled="isLoading"
        />
      </template>
    </AppFormStepper>
  </form>
</template>
