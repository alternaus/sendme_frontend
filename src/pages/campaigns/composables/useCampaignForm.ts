import { type FieldEntry, useFieldArray } from 'vee-validate'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import { type StepConfig, useFormStepper } from '@/composables/useFormStepper'
import { useAuthStore } from '@/stores/useAuthStore'

export interface CampaignRule {
  conditionType: string | undefined
  value: string | undefined
  customFieldId: number | undefined
  campaignId?: number | undefined
}

export interface CampaignForm extends Record<string, unknown> {
  name: string
  description: string
  content: string
  contentType: 'plain_text' | 'html'
  status: 'active' | 'inactive'
  startDate: Date
  endDate: Date
  time: Date
  days: string[]
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  channelId: number
  organizationId: number
  campaignRules: CampaignRule[]
}

export interface CampaignFormRef {
  name: Ref<string>
  description: Ref<string>
  content: Ref<string>
  contentType: Ref<'plain_text' | 'html'>
  status: Ref<'active' | 'inactive'>
  startDate: Ref<Date>
  endDate: Ref<Date>
  time: Ref<Date>
  days: Ref<string[]>
  frequency: Ref<'DAILY' | 'WEEKLY' | 'MONTHLY'>
  channelId: Ref<number>
  organizationId: Ref<number>
  campaignRules: Ref<FieldEntry<CampaignRule>[]>
}

export const useFormCampaign = () => {
  const { t } = useI18n()
  const authStore = useAuthStore()

  // Obtener el organizationId del usuario autenticado
  const userOrganizationId = authStore.user?.organizationId || 1

  // Schemas separados para cada paso
  const step1Schema = yup.object({
    name: yup.string().required().label(t('campaign.form.campaign_name')),
    description: yup.string().required().label(t('campaign.form.description')),
    channelId: yup.number().integer().min(1, t('campaign.form.channel_id')).required().label(t('campaign.form.channel_id')),
    status: yup.string().oneOf(['active', 'inactive']).required().label(t('campaign.form.status')),
    startDate: yup.date().required().label(t('campaign.form.start_date')),
    endDate: yup.date().required().label(t('campaign.form.end_date')),
    time: yup.date().required().label(t('campaign.form.execution_time')),
    days: yup
      .array()
      .of(yup.string())
      .min(1, t('campaign.form.select_at_least_one_day'))
      .label(t('campaign.form.execution_days')),
    organizationId: yup.number().integer().min(1, t('campaign.form.organization_id')).required().label(t('campaign.form.organization_id')),
  })

  const step2Schema = yup.object({
    frequency: yup.string().oneOf(['DAILY', 'WEEKLY', 'MONTHLY']).required().label(t('campaign.form.frequency')),
    campaignRules: yup.array().of(
      yup.object().shape({
        conditionType: yup.string().required().label(t('campaign.form.condition_type')),
        value: yup
          .mixed()
          .test(
            'is-valid-type',
            t('campaign.form.value_is_required'),
            (value) =>
              value &&
              (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'),
          )
          .required()
          .label(t('campaign.form.condition_value')),
        customFieldId: yup.number().integer().required().label(t('campaign.form.custom_field_id')),
      }),
    ),
  })

  const step3Schema = yup.object({
    content: yup.string().required().label(t('campaign.form.message_content')),
    contentType: yup.string().oneOf(['plain_text', 'html']).required().label(t('campaign.form.content_type')),
  })

  const steps: StepConfig[] = [
    {
      id: '1',
      label: t('campaign.details'),
      icon: 'pi pi-info-circle',
      fields: ['name', 'description', 'channelId', 'status', 'startDate', 'endDate', 'time', 'days', 'organizationId'],
      schema: step1Schema
    },
    {
      id: '2',
      label: t('campaign.triggers'),
      icon: 'pi pi-bolt',
      fields: ['frequency', 'campaignRules'],
      schema: step2Schema
    },
    {
      id: '3',
      label: t('campaign.message'),
      icon: 'pi pi-comment',
      fields: ['content', 'contentType'],
      schema: step3Schema
    }
  ]

  const {
    defineField,
    handleSubmit,
    resetForm,
    errors,
    setValues,
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    goToStep,
    canNavigateToStep,
    hasStepErrors,
    validateCurrentStep,
  } = useFormStepper({
    steps,
    initialValues: {
      name: '',
      description: '',
      content: '',
      contentType: 'plain_text',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(),
      time: new Date(0, 0, 0, 12, 0),
      days: [],
      frequency: 'DAILY',
      channelId: 1, // Changed from 0 to 1 to avoid validation issues
      organizationId: userOrganizationId,
      campaignRules: [{ conditionType: 'is_empty', value: '', customFieldId: 0 }],
    },
    validateOnMount: false,
  })

  // Define fields with explicit typing
  const [name] = defineField('name')
  const [description] = defineField('description')
  const [content] = defineField('content')
  const [contentType] = defineField('contentType')
  const [status] = defineField('status')
  const [startDate] = defineField('startDate')
  const [endDate] = defineField('endDate')
  const [time] = defineField('time')
  const [days] = defineField('days')
  const [frequency] = defineField('frequency')
  const [channelId] = defineField('channelId')
  const [organizationId] = defineField('organizationId')

  const {
    fields: campaignRules,
    push: addCampaignRule,
    remove: removeCampaignRule,
  } = useFieldArray<CampaignRule>('campaignRules')

  const addRule = () => {
    addCampaignRule({ conditionType: 'is_empty', value: '', customFieldId: 0 })
  }

  const removeRule = (index: number) => {
    removeCampaignRule(index)
  }

  return {
    // Form fields with proper typing
    form: {
      name: name as Ref<string>,
      description: description as Ref<string>,
      content: content as Ref<string>,
      contentType: contentType as Ref<'plain_text' | 'html'>,
      status: status as Ref<'active' | 'inactive'>,
      startDate: startDate as Ref<Date>,
      endDate: endDate as Ref<Date>,
      time: time as Ref<Date>,
      days: days as Ref<string[]>,
      frequency: frequency as Ref<'DAILY' | 'WEEKLY' | 'MONTHLY'>,
      channelId: channelId as Ref<number>,
      organizationId: organizationId as Ref<number>,
      campaignRules: campaignRules as Ref<FieldEntry<CampaignRule>[]>,
    } as CampaignFormRef,

    // Form utilities
    handleSubmit,
    resetForm,
    errors,
    setValues,

    // Stepper
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
    validateCurrentStep,

    // Campaign rules
    addRule,
    removeRule,
  }
}
