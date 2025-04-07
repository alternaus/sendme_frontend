<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useRoute,useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

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
import type { ICreateCampaign } from '@/services/campaign/interfaces/create-campaign.interface'
import type { IUpdateCampaign } from '@/services/campaign/interfaces/update-campaign.interface'
import { useCampaignService } from '@/services/campaign/useCampaignService'
import { useChannelService } from '@/services/channel/useChannelService'

import type { CampaignForm } from '../composables/useCampaignForm'
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
    const route = useRoute()
    const { t } = useI18n()
    const toast = useToast()
    const { form, handleSubmit, resetForm, errors, addRule, removeRule, setValues } = useFormCampaign()
    const { getChannels } = useChannelService()
    const { createCampaign, updateCampaign, getCampaign } = useCampaignService()
    const activeStep = ref(0)
    const isLoading = ref(false)
    const isEditMode = ref(false)
    const campaignId = ref<string | null>(null)

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
      { name: t('campaign.conditions.not_empty'), value: 'not_empty' },
      { name: t('campaign.conditions.equals'), value: 'equals' },
      { name: t('campaign.conditions.not_equals'), value: 'not_equals' },
      { name: t('campaign.conditions.greater_than'), value: 'greater_than' },
      { name: t('campaign.conditions.less_than'), value: 'less_than' },
      { name: t('campaign.conditions.between'), value: 'between' },
      { name: t('campaign.conditions.contains'), value: 'contains' },
      { name: t('campaign.conditions.starts_with'), value: 'starts_with' },
      { name: t('campaign.conditions.ends_with'), value: 'ends_with' },
    ]

    const channels = ref<SelectOption[]>([])

    onMounted(async () => {
      try {
        const response = await getChannels()
        channels.value = response.map((channel) => ({
          name: channel.name,
          value: channel.id,
        }))

        // Verificar si estamos en modo edición
        if (route.params.id) {
          campaignId.value = route.params.id as string
          isEditMode.value = true
          await loadCampaignData()
        }
      } catch (error) {
        console.error('❌ Error al obtener canales:', error)
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('campaign.errors.load_channels'),
          life: 3000,
        })
      }
    })

    const loadCampaignData = async () => {
      if (!campaignId.value) return

      try {
        isLoading.value = true
        const campaign = await getCampaign(campaignId.value)

        // Convertir las fechas de string a Date y adaptar el formato de las reglas
        const formattedCampaign = {
          ...campaign,
          startDate: new Date(campaign.startDate),
          endDate: new Date(campaign.endDate),
          time: new Date(`2000-01-01T${campaign.time}`),
          campaignRules: campaign.campaignRules.map(rule => ({
            ...rule,
            value: rule.value?.toString() || ''
          }))
        }

        setValues(formattedCampaign as unknown as CampaignForm)
      } catch (error) {
        console.error('❌ Error al cargar la campaña:', error)
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

    const formatCampaignData = (values: CampaignForm) => {
      // Formatear las fechas para el backend
      const formattedData = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        time: values.time.toTimeString().split(' ')[0].substring(0, 5), // Formato HH:MM
        contentType: 'plain_text' as const, // Asegurar que sea 'plain_text'
        // Eliminar la propiedad rrule que no debe existir
      }

      // Eliminar la propiedad rrule si existe
      if ('rrule' in formattedData) {
        delete (formattedData).rrule
      }

      return formattedData
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
            await createCampaign(formattedData as ICreateCampaign)
            toast.add({
              severity: 'success',
              summary: t('general.success'),
              detail: t('campaign.success.created'),
              life: 3000,
            })
          }

          router.push('/campaigns')
        } catch (error) {
          console.error('❌ Error al guardar la campaña:', error)
          toast.add({
            severity: 'error',
            summary: t('general.error'),
            detail: t('campaign.errors.save'),
            life: 3000,
          })
        } finally {
          isLoading.value = false
        }
      },
      (error) => {
        console.log('Formulario con errores', error)
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('campaign.errors.validation'),
          life: 3000,
        })
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
      isLoading,
      isEditMode,
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
        :label="t('general.name')"
        :disabled="isLoading"
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
        :label="t('general.description')"
        :disabled="isLoading"
      >
        <template #icon>
          <DescriptionIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppInput>

      <AppSelect
        v-model="form.channelId.value"
        :options="channels"
        :error-message="errors.channelId"
        :label="t('campaign.channel')"
        class="w-full"
        :disabled="isLoading"
      >
        <template #icon>
          <ChannelIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppSelect>

      <AppSelect
        v-model="form.status.value"
        :options="statusOptions"
        :error-message="errors.status"
        :label="t('general.status')"
        class="w-full"
        :disabled="isLoading"
      >
        <template #icon>
          <StatusIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppSelect>
    </div>

    <CampaignFormDetails v-if="activeStep === 0" :form="form" :errors="errors" @update:form="updateFormContent" :disabled="isLoading" />

    <CampaignFormTriggers
      v-if="activeStep === 1"
      :form="form"
      :errors="errors"
      :conditionOptions="conditionOptions"
      :addRule="addRule"
      :removeRule="removeRule"
      @update:form="updateFormContent"
      :disabled="isLoading"
    />

    <CampaignFormMessage v-if="activeStep === 2" :form="form" :errors="errors" @update:form="updateFormContent" :disabled="isLoading" />

    <div class="flex flex-col lg:flex-row lg:justify-between gap-5 mt-7">
      <div class="flex gap-5">
        <AppButton
          v-if="activeStep > 0"
          severity="secondary"
          class="w-full sm:w-auto"
          :label="t('general.previous')"
          @click.prevent="prevStep"
          :disabled="isLoading"
        />
        <AppButton
          v-if="activeStep < steps.length - 1"
          severity="primary"
          class="w-full sm:w-auto"
          :label="t('general.next')"
          @click.prevent="nextStep"
          :disabled="isLoading"
        />
      </div>
      <div class="flex gap-5">
        <AppButton
          v-if="activeStep === steps.length - 1"
          type="submit"
          severity="primary"
          class="w-full sm:w-auto"
          :label="isEditMode ? t('general.update') : t('general.save')"
          :loading="isLoading"
        />
        <AppButton
          severity="secondary"
          class="w-full sm:w-auto"
          :label="t('general.cancel')"
          @click.prevent="handleCancel"
          :disabled="isLoading"
        />
      </div>
    </div>
  </form>
</template>
