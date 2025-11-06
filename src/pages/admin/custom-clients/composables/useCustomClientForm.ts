import { computed } from 'vue'

import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import { type StepConfig, useFormStepper } from '@/composables/useFormStepper'

export type PlanSelectionType = 'existing' | 'custom'

export interface CustomClientFormData {
  planType: PlanSelectionType
  selectedPlanId?: string
  orgName: string
  orgDocument: string
  orgDocumentType: string
  orgEmail: string
  orgPhone: string
  orgCountry: string
  orgCity: string
  orgAddress: string
  planName: string
  subscriptionPrice: number
  includedMessages: number
  messagePrice: number
  resetDay: number
  campaignLimit: number
  contactLimit: number
  tagLimit: number
  customFieldLimit: number
  managers: Array<{ name: string; email: string; password: string }>
}

export function useCustomClientForm() {
  const { t } = useI18n()

  const planTypeSchema = yup.object({
    planType: yup.string().oneOf(['existing', 'custom']).required().label(t('custom_clients.form.plan_type.label')),
    selectedPlanId: yup.string().when('planType', {
      is: 'existing',
      then: (schema) => schema.required().label(t('custom_clients.form.plan_type.select_plan')),
      otherwise: (schema) => schema.notRequired()
    })
  })

  const organizationSchema = yup.object({
    orgName: yup.string().required().label(t('custom_clients.form.organization.name')),
    orgDocument: yup.string().required().label(t('custom_clients.form.organization.document')),
    orgDocumentType: yup.string().required().label(t('custom_clients.form.organization.document_type')),
    orgEmail: yup.string().email().required().label(t('custom_clients.form.organization.email')),
    orgPhone: yup.string().required().label(t('custom_clients.form.organization.phone')),
    orgCountry: yup.string().required().label(t('custom_clients.form.organization.country')),
    orgCity: yup.string().required().label(t('custom_clients.form.organization.city')),
    orgAddress: yup.string().notRequired().label(t('custom_clients.form.organization.address'))
  })

  const customPlanSchema = yup.object({
    planName: yup.string().when('planType', {
      is: 'custom',
      then: (schema) => schema.required().label(t('custom_clients.form.custom_plan.plan_name')),
      otherwise: (schema) => schema.notRequired()
    }),
    subscriptionPrice: yup.number().when('planType', {
      is: 'custom',
      then: (schema) => schema.positive().required().label(t('custom_clients.form.custom_plan.subscription_price')),
      otherwise: (schema) => schema.notRequired()
    }),
    includedMessages: yup.number().when('planType', {
      is: 'custom',
      then: (schema) => schema.positive().integer().required().label(t('custom_clients.form.custom_plan.included_messages')),
      otherwise: (schema) => schema.notRequired()
    }),
    messagePrice: yup.number().when('planType', {
      is: 'custom',
      then: (schema) => schema.positive().required().label(t('custom_clients.form.custom_plan.message_price')),
      otherwise: (schema) => schema.notRequired()
    }),
    resetDay: yup.number().when('planType', {
      is: 'custom',
      then: (schema) => schema.min(1).max(31).integer().required().label(t('custom_clients.form.custom_plan.reset_day')),
      otherwise: (schema) => schema.notRequired()
    }),
    campaignLimit: yup.number().when('planType', {
      is: 'custom',
      then: (schema) => schema.positive().integer().required().label(t('custom_clients.form.custom_plan.campaign_limit')),
      otherwise: (schema) => schema.notRequired()
    }),
    contactLimit: yup.number().when('planType', {
      is: 'custom',
      then: (schema) => schema.positive().integer().required().label(t('custom_clients.form.custom_plan.contact_limit')),
      otherwise: (schema) => schema.notRequired()
    }),
    tagLimit: yup.number().when('planType', {
      is: 'custom',
      then: (schema) => schema.positive().integer().required().label(t('custom_clients.form.custom_plan.tag_limit')),
      otherwise: (schema) => schema.notRequired()
    }),
    customFieldLimit: yup.number().when('planType', {
      is: 'custom',
      then: (schema) => schema.positive().integer().required().label(t('custom_clients.form.custom_plan.custom_field_limit')),
      otherwise: (schema) => schema.notRequired()
    })
  })

  const managersSchema = yup.object({
    managers: yup.array().of(
      yup.object({
        name: yup.string().required().label(t('custom_clients.form.managers.name')),
        email: yup.string().email().required().label(t('custom_clients.form.managers.email')),
        password: yup.string().min(6).required().label(t('custom_clients.form.managers.password'))
      })
    ).min(1).required().label(t('custom_clients.form.managers.title'))
  })

  const allSteps: StepConfig<CustomClientFormData>[] = [
    {
      id: '1',
      label: t('custom_clients.form.steps.plan_type'),
      icon: 'pi pi-list',
      fields: ['planType', 'selectedPlanId'],
      schema: planTypeSchema as yup.ObjectSchema<Partial<CustomClientFormData>>
    },
    {
      id: '2',
      label: t('custom_clients.form.steps.organization'),
      icon: 'pi pi-building',
      fields: ['orgName', 'orgDocument', 'orgDocumentType', 'orgEmail', 'orgPhone', 'orgCountry', 'orgCity', 'orgAddress'],
      schema: organizationSchema as yup.ObjectSchema<Partial<CustomClientFormData>>
    },
    {
      id: '3',
      label: t('custom_clients.form.steps.custom_plan'),
      icon: 'pi pi-cog',
      fields: ['planName', 'subscriptionPrice', 'includedMessages', 'messagePrice', 'resetDay', 'campaignLimit', 'contactLimit', 'tagLimit', 'customFieldLimit'],
      schema: customPlanSchema as yup.ObjectSchema<Partial<CustomClientFormData>>
    },
    {
      id: '4',
      label: t('custom_clients.form.steps.managers'),
      icon: 'pi pi-users',
      fields: ['managers'],
      schema: managersSchema as yup.ObjectSchema<Partial<CustomClientFormData>>
    },
    {
      id: '5',
      label: t('custom_clients.form.steps.confirmation'),
      icon: 'pi pi-check',
      fields: [],
      schema: yup.object().shape({}) as yup.ObjectSchema<Partial<CustomClientFormData>>
    }
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
    resetDay: 1,
    campaignLimit: 100,
    contactLimit: 50000,
    tagLimit: 50,
    customFieldLimit: 20,
    managers: [{ name: '', email: '', password: '' }]
  }

  const stepper = useFormStepper({
    steps: allSteps,
    initialValues,
    validateOnMount: false
  })

  const [planType] = stepper.defineField('planType')

  const steps = computed(() => {
    if (planType.value === 'custom') {
      return allSteps
    } else {
      return allSteps.filter(step => step.id !== '3')
    }
  })

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

  const form = computed(() => ({
    planType: { value: planType.value },
    selectedPlanId: { value: selectedPlanId.value },
    orgName: { value: orgName.value },
    orgDocument: { value: orgDocument.value },
    orgDocumentType: { value: orgDocumentType.value },
    orgEmail: { value: orgEmail.value },
    orgPhone: { value: orgPhone.value },
    orgCountry: { value: orgCountry.value },
    orgCity: { value: orgCity.value },
    orgAddress: { value: orgAddress.value },
    planName: { value: planName.value },
    subscriptionPrice: { value: subscriptionPrice.value },
    includedMessages: { value: includedMessages.value },
    messagePrice: { value: messagePrice.value },
    resetDay: { value: resetDay.value },
    campaignLimit: { value: campaignLimit.value },
    contactLimit: { value: contactLimit.value },
    tagLimit: { value: tagLimit.value },
    customFieldLimit: { value: customFieldLimit.value },
    managers: { value: managers.value }
  }))

  return {
    form,
    ...stepper,
    steps
  }
}
