import { type FieldEntry, useFieldArray, useForm } from 'vee-validate'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import { useStatusColors } from '@/composables/useStatusColors'
import { ContactStatus } from '@/services/contact/enums/contact-status.enum'

export interface CustomValue {
  customFieldId?:string
  value?: string | null
  id?:string
}

export interface ContactForm {
  name?: string
  lastName?: string
  email?: string
  phone: string
  countryCode: string
  status?: ContactStatus
  birthDate?: Date | null
  customValues?: CustomValue[]
}

export interface ContactFormRef {
  name: Ref<string>
  lastName: Ref<string>
  email: Ref<string>
  phone: Ref<string>
  countryCode: Ref<string>
  status: Ref<'active' | 'inactive'>
  birthDate: Ref<Date | null>
  organizationId: Ref<number>
  customValue: Ref<FieldEntry<CustomValue>[]>
}

export const useFormContact = () => {
  const { t } = useI18n()
  const { getStatusesForType } = useStatusColors()

  const validStatuses = getStatusesForType('contact')

  yup.setLocale({
    mixed: {
      required: () => t('contacts.general.required_field'),
    },
    string: {
      email: () => t('contacts.general.invalid_email'),
    },
  })

  const schema = yup.object<ContactForm>({
    name: yup.string().optional().label(t('contacts.general.name')),
    lastName: yup.string().optional().label(t('contacts.general.last_name')),
    email: yup.string().email().optional().label(t('contacts.general.email')),
    phone: yup.string().required().label(t('contacts.general.phone')),
    countryCode: yup.string().required().label(t('contacts.general.country_code')),
    status: yup.string().oneOf(validStatuses).optional().label(t('contacts.general.status')),
    birthDate: yup.date().nullable().optional().label(t('contacts.general.birth_date')),
    customValues: yup.array().of(
      yup.object().shape({
        customFieldId: yup.number().integer().required().label('form.customFieldId'),
        value: yup.string().when('customFieldId', {
          is: (_customFieldId:string) => {
            // Para campos de fecha en customValues, permitir valores vacíos/null
            return false // Por ahora permitimos valores opcionales
          },
          then: (schema) => schema.optional(),
          otherwise: (schema) => schema.optional()
        }).label('form.customValue'),
        id: yup.number().integer().nullable().label('form.customId'),
      }),
    ).optional(),
  })

  const { defineField, handleSubmit, resetForm, errors, setValues } = useForm<ContactForm>({
    validationSchema: schema,
    initialValues: {
      name: '',
      lastName: '',
      email: '',
      phone: '',
      countryCode: '',
      status: ContactStatus.ACTIVE,
      birthDate: null, // Permitir null por defecto
      customValues: [],
    },
    validateOnMount: false,
  })

  const [name] = defineField('name')
  const [lastName] = defineField('lastName')
  const [email] = defineField('email')
  const [phone] = defineField('phone')
  const [countryCode] = defineField('countryCode')
  const [status] = defineField('status')
  const [birthDate] = defineField('birthDate')

  const {
    fields: customValues,
    push: addCustomValue,
    remove: removeCustomValue,
  } = useFieldArray<CustomValue>('customValues')

  const addCustomField = (field: { customFieldId:string; value?: string; id?:string }) => {
    addCustomValue(field)
  }

  const removeCustomField = (index: number) => {
    removeCustomValue(index)
  }

  return {
    form: {
      name,
      lastName,
      email,
      phone,
      countryCode,
      status,
      birthDate,
      customValues,
    },
    handleSubmit,
    resetForm,
    errors,
    setValues,
    addCustomField,
    removeCustomField,
  }
}
