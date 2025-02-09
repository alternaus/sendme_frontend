import { useForm, useFieldArray, type FieldEntry } from 'vee-validate'
import type { Ref } from 'vue'
import * as yup from 'yup'

export interface CampaignRule {
  conditionType: string
  value: Record<string, unknown> | string | number
  customFieldId: number
  campaignId?: number
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

const schema = yup.object<CampaignForm>({
  name: yup.string().required().label('Nombre de la Campaña'),
  description: yup.string().required().label('Descripción'),
  content: yup.string().required().label('Contenido del Mensaje'),
  contentType: yup.string().oneOf(['plain_text', 'html']).required().label('Tipo de Contenido'),
  status: yup.string().oneOf(['active', 'inactive']).required().label('Estado'),
  startDate: yup.date().required().label('Fecha de Inicio'),
  endDate: yup.date().required().label('Fecha de Finalización'),
  time: yup.string().required().label('Hora de Ejecución'),
  days: yup
    .array()
    .of(yup.object().shape({ value: yup.string().required(), name: yup.string().required() }))
    .min(1, 'Debes seleccionar al menos un día')
    .label('Días de Ejecución'),
  frequency: yup.string().oneOf(['DAILY', 'WEEKLY', 'MONTHLY']).required().label('Frecuencia'),
  channelId: yup.number().integer().required().label('ID del Canal'),
  organizationId: yup.number().integer().required().label('ID de la Organización'),
  campaignRules: yup.array().of(
    yup.object().shape({
      conditionType: yup.string().required().label('Tipo de Condición'),
      value: yup
        .mixed()
        .test(
          'is-valid-type',
          'El valor debe es obligatorio',
          (value) =>
            value &&
            (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'),
        )
        .required()
        .label('Valor de la Condición'),
      customFieldId: yup.number().integer().required().label('ID del Campo Personalizado'),
    }),
  ),
})

export const useFormCampaign = () => {
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
      campaignRules: [{ conditionType: '', value: '', customFieldId: 0 }],
    },
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
    addCampaignRule({ conditionType: '', value: '', customFieldId: 0 })
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
