import { useFieldArray } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import { type StepConfig, useFormStepper } from '@/composables/useFormStepper'
import { useStatusColors } from '@/composables/useStatusColors'
import type { CampaignConditionType } from '@/services/campaign/enums/campaign-condition-type.enum'
import { CampaignFrequency } from '@/services/campaign/enums/campaign-frequency.enum'
import { CampaignStatus } from '@/services/campaign/enums/campaign-status.enum'
import { ContentType } from '@/services/campaign/enums/content-type.enum'
import type { CampaignDays } from '@/services/campaign/enums/days.enum'
import { useAuthStore } from '@/stores/useAuthStore'

export interface CampaignRule {
  conditionType: CampaignConditionType  | null
  value: string
  customFieldId: string
  campaignId?: string
}

export interface CampaignFormData {
  name: string
  description: string
  content: string
  contentType: ContentType
  status: CampaignStatus
  startDate: Date
  endDate: Date
  time: Date
  days: CampaignDays[]
  frequency: CampaignFrequency
  channelId: string
  organizationId: string
  campaignRules: CampaignRule[]
}

export type CampaignFormFields = ReturnType<typeof useCampaignForm>['form']

export type CampaignFormErrors = ReturnType<typeof useCampaignForm>['fieldErrors']

export function useCampaignForm() {
  const { t } = useI18n()
  const authStore = useAuthStore()
  const { getStatusesForType } = useStatusColors()

  const userOrganizationId = authStore.user?.organizationId || '1'

  const validStatuses = getStatusesForType('campaign')

  const detailsSchema = yup.object({
    name: yup.string().required().label(t('campaigns.form.campaign_name')),
    description: yup.string().required().label(t('campaigns.form.description')),
    channelId: yup.string().required().label(t('campaigns.form.channel_id')),
    status: yup.string().oneOf(validStatuses).required().label(t('campaigns.form.status')),
    startDate: yup.date().required().label(t('campaigns.form.start_date')),
    endDate: yup.date().required().label(t('campaigns.form.end_date')),
    time: yup.date().required().label(t('campaigns.form.execution_time')),
    days: yup.array().of(yup.string()).min(1).required().label(t('campaigns.form.execution_days')),
    organizationId: yup.string().required().label(t('campaigns.form.organization_id'))
  }).shape({}) as yup.ObjectSchema<Partial<CampaignFormData>>

  const triggersSchema = yup.object({
    frequency: yup.string().oneOf(['DAILY', 'WEEKLY', 'MONTHLY']).required().label(t('campaigns.form.frequency')),
    campaignRules: yup.array().of(
      yup.object({
        conditionType: yup.string().required().label(t('campaigns.form.condition_type')),
        value: yup.string().when('conditionType', {
          is: (conditionType: string) => {
            const conditionsWithoutValue = [
              'IS_EMPTY',
              'NOT_EMPTY',
              'BIRTHDAY_TODAY',
              'IS_TODAY',
              'WAS_YESTERDAY',
              'IS_TOMORROW'
            ]
            return !conditionsWithoutValue.includes(conditionType)
          },
          then: (schema) => schema.required().label(t('campaigns.form.condition_value')),
          otherwise: (schema) => schema.notRequired()
        }),
        customFieldId: yup.string().required().label(t('campaigns.form.custom_field_id'))
      })
    ).required()
  }).shape({}) as yup.ObjectSchema<Partial<CampaignFormData>>

  const messageSchema = yup.object({
    content: yup.string().required().label(t('campaigns.form.message_content')),
    contentType: yup.string().oneOf(['PLAIN_TEXT', 'HTML']).required().label(t('campaigns.form.content_type'))
  }).shape({}) as yup.ObjectSchema<Partial<CampaignFormData>>

  const steps: StepConfig<CampaignFormData>[] = [
    {
      id: '1',
      label: t('campaigns.navigation.details'),
      icon: 'pi pi-info-circle',
      fields: ['name', 'description', 'channelId', 'status', 'startDate', 'endDate', 'time', 'days', 'organizationId'],
      schema: detailsSchema
    },
    {
      id: '2',
      label: t('campaigns.navigation.triggers'),
      icon: 'pi pi-bolt',
      fields: ['frequency', 'campaignRules'],
      schema: triggersSchema
    },
    {
      id: '3',
      label: t('campaigns.navigation.message'),
      icon: 'pi pi-comment',
      fields: ['content', 'contentType'],
      schema: messageSchema
    }
  ]

  const initialValues: Partial<CampaignFormData> = {
    name: '',
    description: '',
    content: '',
    contentType: ContentType.PLAIN_TEXT,
    status: CampaignStatus.ACTIVE,
    startDate: new Date(),
    endDate: new Date(),
    time: new Date(0, 0, 0, 12, 0),
    days: [],
    frequency: CampaignFrequency.DAILY,
    channelId: '1',
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
      conditionType: null,
      value: '',
      customFieldId: ''
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
