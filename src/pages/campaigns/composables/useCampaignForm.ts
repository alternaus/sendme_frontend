import { type FieldEntry,useFieldArray, useForm } from 'vee-validate'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

export interface CampaignRule {
  conditionType: string | undefined
  value: string | undefined
  customFieldId: number | undefined
  campaignId?: number | undefined
}

export interface CampaignForm {
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

  const schema = yup.object<CampaignForm>({
    name: yup.string().required().label(t('campaign.form.campaign_name')),
    description: yup.string().required().label(t('campaign.form.description')),
    content: yup.string().required().label(t('campaign.form.message_content')),
    contentType: yup.string().oneOf(['plain_text', 'html']).required().label(t('campaign.form.content_type')),
    status: yup.string().oneOf(['active', 'inactive']).required().label(t('campaign.form.status')),
    startDate: yup.date().required().label(t('campaign.form.start_date')),
    endDate: yup.date().required().label(t('campaign.form.end_date')),
    time: yup.string().required().label(t('campaign.form.execution_time')),
    days: yup
      .array()
      .of(yup.string())
      .min(1, t('campaign.form.select_at_least_one_day'))
      .label(t('campaign.form.execution_days')),
    frequency: yup.string().oneOf(['DAILY', 'WEEKLY', 'MONTHLY']).required().label(t('campaign.form.frequency')),
    channelId: yup.number().integer().required().label(t('campaign.form.channel_id')),
    organizationId: yup.number().integer().required().label(t('campaign.form.organization_id')),
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

  const { defineField, handleSubmit, resetForm, errors, setValues } = useForm<CampaignForm>({
    validationSchema: schema,
    initialValues: {
      name: '',
      description: '',
      content: '',
      contentType: 'plain_text',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(),
      time: new Date(),
      days: [],
      frequency: 'DAILY',
      channelId: 0,
      organizationId: 0,
      campaignRules: [{ conditionType: 'is_empty', value: '', customFieldId: 0 }],
    },
    validateOnMount: false,
  })

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
      campaignRules,
    },
    handleSubmit,
    resetForm,
    errors,
    setValues,
    addRule,
    removeRule,
  }
}
