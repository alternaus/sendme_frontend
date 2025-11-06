import { computed } from 'vue'

import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import { type StepConfig, useFormStepper } from '@/composables/useFormStepper'

export interface CustomClientFormData {
  planType: 'existing' | 'custom'
  selectedPlanId?: string
  orgName: string
  orgDocument: string
  orgDocumentType: string
  orgEmail: string
  orgPhone: string
  orgCountry: string
  orgCity: string
  orgAddress: string
  planName?: string
  subscriptionPrice?: number
  includedMessages?: number
  messagePrice?: number
  resetDay?: number
  campaignLimit?: number
  contactLimit?: number
  tagLimit?: number
  customFieldLimit?: number
  managers: Array<{ name: string; email: string; password: string }>
}

export function useCustomClientForm() {
  const { t } = useI18n()

  const planTypeSchema = yup.object({
    planType: yup.string().oneOf(['existing', 'custom']).required().label(t('custom_clients.form.plan_type.label')),
    selectedPlanId: yup.string().when('planType', {
      is: 'existing',
      then: (schema) => schema.required().label(t('custom_clients.form.plan_type.select_plan')),
      otherwise: (schema) => schema.notRequired(),
    }),
  }).shape({}) as yup.ObjectSchema<Partial<CustomClientFormData>>

  const organizationSchema = yup.object({
    orgName: yup.string().required().label(t('custom_clients.form.organization.name')),
    orgDocument: yup.string().required().label(t('custom_clients.form.organization.document')),
    orgDocumentType: yup.string().required().label(t('custom_clients.form.organization.document_type')),
    orgEmail: yup.string().email().required().label(t('custom_clients.form.organization.email')),
    orgPhone: yup.string().required().label(t('custom_clients.form.organization.phone')),
    orgCountry: yup.string().required().label(t('custom_clients.form.organization.country')),
    orgCity: yup.string().required().label(t('custom_clients.form.organization.city')),
    orgAddress: yup.string().required().label(t('custom_clients.form.organization.address')),
  }).shape({}) as yup.ObjectSchema<Partial<CustomClientFormData>>

  const customPlanSchema = yup.object({
    planName: yup.string().required().label(t('custom_clients.form.custom_plan.plan_name')),
    subscriptionPrice: yup.number().min(0).required().label(t('custom_clients.form.custom_plan.subscription_price')),
    includedMessages: yup.number().min(0).required().label(t('custom_clients.form.custom_plan.included_messages')),
    messagePrice: yup.number().min(0).required().label(t('custom_clients.form.custom_plan.message_price')),
    resetDay: yup.number().min(1).max(31).required().label(t('custom_clients.form.custom_plan.reset_day')),
    campaignLimit: yup.number().min(0).required().label(t('custom_clients.form.custom_plan.campaign_limit')),
    contactLimit: yup.number().min(0).required().label(t('custom_clients.form.custom_plan.contact_limit')),
    tagLimit: yup.number().min(0).required().label(t('custom_clients.form.custom_plan.tag_limit')),
    customFieldLimit: yup.number().min(0).required().label(t('custom_clients.form.custom_plan.custom_field_limit')),
  }).shape({}) as yup.ObjectSchema<Partial<CustomClientFormData>>

  const managersSchema = yup.object({
    managers: yup
      .array()
      .of(
        yup.object({
          name: yup.string().required().label(t('custom_clients.form.managers.name')),
          email: yup.string().email().required().label(t('custom_clients.form.managers.email')),
          password: yup.string().min(8).required().label(t('custom_clients.form.managers.password')),
        }),
      )
      .min(1)
      .required()
      .label(t('custom_clients.form.managers.title')),
  }).shape({}) as yup.ObjectSchema<Partial<CustomClientFormData>>

  const allSteps: StepConfig<CustomClientFormData>[] = [
    {
      id: '1',
      label: t('custom_clients.form.steps.plan_type'),
      icon: 'pi pi-building',
      fields: ['planType', 'selectedPlanId'],
      schema: planTypeSchema,
    },
    {
      id: '2',
      label: t('custom_clients.form.steps.organization'),
      icon: 'pi pi-users',
      fields: ['orgName', 'orgDocument', 'orgDocumentType', 'orgEmail', 'orgPhone', 'orgCountry', 'orgCity', 'orgAddress'],
      schema: organizationSchema,
    },
    {
      id: '3',
      label: t('custom_clients.form.steps.custom_plan'),
      icon: 'pi pi-box',
      fields: ['planName', 'subscriptionPrice', 'includedMessages', 'messagePrice', 'resetDay', 'campaignLimit', 'contactLimit', 'tagLimit', 'customFieldLimit'],
      schema: customPlanSchema,
    },
    {
      id: '4',
      label: t('custom_clients.form.steps.managers'),
      icon: 'pi pi-user',
      fields: ['managers'],
      schema: managersSchema,
    },
    {
      id: '5',
      label: t('custom_clients.form.steps.confirmation'),
      icon: 'pi pi-check',
      fields: [],
      schema: yup.object().shape({}) as yup.ObjectSchema<Partial<CustomClientFormData>>,
    },
  ]

  const initialValues: Partial<CustomClientFormData> = {
    planType: 'existing',
    selectedPlanId: undefined,
    orgName: '',
    orgDocument: '',
    orgDocumentType: 'NIT',
    orgEmail: '',
    orgPhone: '',
    orgCountry: 'Colombia',
    orgCity: '',
    orgAddress: '',
    planName: '',
    subscriptionPrice: 0,
    includedMessages: 0,
    messagePrice: 50,
    resetDay: new Date().getDate(),
    campaignLimit: 100,
    contactLimit: 50000,
    tagLimit: 50,
    customFieldLimit: 20,
    managers: [{ name: '', email: '', password: '' }],
  }

  const stepper = useFormStepper({
    steps: allSteps,
    initialValues,
    validateOnMount: false,
  })

  const [planType] = stepper.defineField('planType')
  const [selectedPlanId] = stepper.defineField('selectedPlanId')
  const [orgName] = stepper.defineField('orgName')
  const [orgDocument] = stepper.defineField('orgDocument')
  const [orgDocumentType] = stepper.defineField('orgDocumentType')
  const [orgEmail] = stepper.defineField('orgEmail')
  const [orgPhone] = stepper.defineField('orgPhone')
  const [orgCountry] = stepper.defineField('orgCountry')
  const [orgCity] = stepper.defineField('orgCity')
  const [orgAddress] = stepper.defineField('orgAddress')
  const [planName] = stepper.defineField('planName')
  const [subscriptionPrice] = stepper.defineField('subscriptionPrice')
  const [includedMessages] = stepper.defineField('includedMessages')
  const [messagePrice] = stepper.defineField('messagePrice')
  const [resetDay] = stepper.defineField('resetDay')
  const [campaignLimit] = stepper.defineField('campaignLimit')
  const [contactLimit] = stepper.defineField('contactLimit')
  const [tagLimit] = stepper.defineField('tagLimit')
  const [customFieldLimit] = stepper.defineField('customFieldLimit')
  const [managers] = stepper.defineField('managers')

  const steps = computed(() => {
    return allSteps.filter((step) => {
      if (step.id === '3') {
        return planType.value === 'custom'
      }
      return true
    })
  })

  const form = {
    planType,
    selectedPlanId,
    orgName,
    orgDocument,
    orgDocumentType,
    orgEmail,
    orgPhone,
    orgCountry,
    orgCity,
    orgAddress,
    planName,
    subscriptionPrice,
    includedMessages,
    messagePrice,
    resetDay,
    campaignLimit,
    contactLimit,
    tagLimit,
    customFieldLimit,
    managers,
  }

  return {
    form,
    ...stepper,
    steps,
  }
}

