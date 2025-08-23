import { useFieldArray } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import { type StepConfig, useFormStepper } from '@/composables/useFormStepper'
import { useAuthStore } from '@/stores/useAuthStore'

export interface CampaignRule {
  conditionType: string
  value: string
  customFieldId: number
  campaignId?: number
}

export interface CampaignFormData {
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

// Tipo para el objeto form que retorna el composable
export type CampaignFormFields = ReturnType<typeof useCampaignForm>['form']

// Tipo para los errores de campo
export type CampaignFormErrors = ReturnType<typeof useCampaignForm>['fieldErrors']

export function useCampaignForm() {
  const { t } = useI18n()
  const authStore = useAuthStore()

  const userOrganizationId = authStore.user?.organizationId || 1

  const detailsSchema = yup.object({
    name: yup.string().required().label(t('campaign.form.campaign_name')),
    description: yup.string().required().label(t('campaign.form.description')),
    channelId: yup.number().integer().min(1).required().label(t('campaign.form.channel_id')),
    status: yup.string().oneOf(['active', 'inactive']).required().label(t('campaign.form.status')),
    startDate: yup.date().required().label(t('campaign.form.start_date')),
    endDate: yup.date().required().label(t('campaign.form.end_date')),
    time: yup.date().required().label(t('campaign.form.execution_time')),
    days: yup.array().of(yup.string()).min(1).required().label(t('campaign.form.execution_days')),
    organizationId: yup.number().integer().min(1).required().label(t('campaign.form.organization_id'))
  }).shape({}) as yup.ObjectSchema<Partial<CampaignFormData>>

  const triggersSchema = yup.object({
    frequency: yup.string().oneOf(['DAILY', 'WEEKLY', 'MONTHLY']).required().label(t('campaign.form.frequency')),
    campaignRules: yup.array().of(
      yup.object({
        conditionType: yup.string().required().label(t('campaign.form.condition_type')),
        value: yup.string().required().label(t('campaign.form.condition_value')),
        customFieldId: yup.number().integer().required().label(t('campaign.form.custom_field_id'))
      })
    ).required()
  }).shape({}) as yup.ObjectSchema<Partial<CampaignFormData>>

  const messageSchema = yup.object({
    content: yup.string().required().label(t('campaign.form.message_content')),
    contentType: yup.string().oneOf(['plain_text', 'html']).required().label(t('campaign.form.content_type'))
  }).shape({}) as yup.ObjectSchema<Partial<CampaignFormData>>

  const steps: StepConfig<CampaignFormData>[] = [
    {
      id: '1',
      label: t('campaign.details'),
      icon: 'pi pi-info-circle',
      fields: ['name', 'description', 'channelId', 'status', 'startDate', 'endDate', 'time', 'days', 'organizationId'],
      schema: detailsSchema
    },
    {
      id: '2',
      label: t('campaign.triggers'),
      icon: 'pi pi-bolt',
      fields: ['frequency', 'campaignRules'],
      schema: triggersSchema
    },
    {
      id: '3',
      label: t('campaign.message'),
      icon: 'pi pi-comment',
      fields: ['content', 'contentType'],
      schema: messageSchema
    }
  ]

  const initialValues: Partial<CampaignFormData> = {
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
    channelId: 1,
    organizationId: userOrganizationId,
    campaignRules: []
  }

  const stepper = useFormStepper({
    steps,
    initialValues,
    validateOnMount: false
  })

  const [name, nameError] = stepper.defineField('name')
  const [description, descriptionError] = stepper.defineField('description')
  const [content, contentError] = stepper.defineField('content')
  const [contentType, contentTypeError] = stepper.defineField('contentType')
  const [status, statusError] = stepper.defineField('status')
  const [startDate, startDateError] = stepper.defineField('startDate')
  const [endDate, endDateError] = stepper.defineField('endDate')
  const [time, timeError] = stepper.defineField('time')
  const [days, daysError] = stepper.defineField('days')
  const [frequency, frequencyError] = stepper.defineField('frequency')
  const [channelId, channelIdError] = stepper.defineField('channelId')
  const [organizationId, organizationIdError] = stepper.defineField('organizationId')

  const {
    fields: campaignRules,
    push: addCampaignRule,
    remove: removeCampaignRule
  } = useFieldArray<CampaignRule>('campaignRules')

  const addRule = () => {
    addCampaignRule({
      conditionType: '',
      value: '',
      customFieldId: 0
    })
  }

  const removeRule = (index: number) => {
    removeCampaignRule(index)
  }

  return {
    form: {
      name,
      description,
      content,
      contentType,
      status,
      startDate,
      endDate,
      time,
      days,
      frequency,
      channelId,
      organizationId,
      campaignRules
    },

    fieldErrors: {
      name: nameError,
      description: descriptionError,
      content: contentError,
      contentType: contentTypeError,
      status: statusError,
      startDate: startDateError,
      endDate: endDateError,
      time: timeError,
      days: daysError,
      frequency: frequencyError,
      channelId: channelIdError,
      organizationId: organizationIdError
    },

    addRule,
    removeRule,

    ...stepper
  }
}
